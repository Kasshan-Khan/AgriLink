const Order = require('../models/Order');
const Produce = require('../models/Produce');
const Pricing = require('../models/Pricing');

// @desc    Get aggregated available stock for buyers
// @route   GET /api/orders/stock
// @access  Public / Buyer
const getAvailableStock = async (req, res) => {
  try {
    // We aggregate Produce that is 'accepted' and has remainingQuantity > 0
    const stock = await Produce.aggregate([
      { $match: { status: 'accepted', remainingQuantity: { $gt: 0 } } },
      {
        $group: {
          _id: { cropType: '$cropType', centerId: '$centerId' },
          totalQuantity: { $sum: '$remainingQuantity' },
        },
      },
      {
        $lookup: {
          from: 'centers',
          localField: '_id.centerId',
          foreignField: '_id',
          as: 'centerInfo',
        },
      },
      { $unwind: '$centerInfo' },
    ]);

    // Format with pricing
    const result = await Promise.all(
      stock.map(async (item) => {
        const cropType = item._id.cropType;
        const centerId = item._id.centerId;

        // Fetch pricing
        let pricing = await Pricing.findOne({ cropType, centerId, isActive: true });
        if (!pricing) {
          pricing = await Pricing.findOne({ cropType, centerId: null, isActive: true });
        }

        const basePrice = pricing ? pricing.basePrice : 0;
        const finalPrice = basePrice + 2.5; // Base + Margin

        return {
          cropType,
          centerId,
          centerName: item.centerInfo.name,
          centerLocation: item.centerInfo.address,
          availableQuantity: item.totalQuantity,
          basePrice,
          margin: 2.5,
          finalPricePerKg: finalPrice,
          isPricingAvailable: !!pricing,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place an order
// @route   POST /api/orders
// @access  Buyer
  const placeOrder = async (req, res) => {
  try {
    const { cropType, centerId, quantity, orderType, logistics, deliveryAddress, distance, postalCode } = req.body;
    
    // Validate role
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can place orders' });
    }

    if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });
    if (orderType === 'immediate' && !centerId) return res.status(400).json({ message: 'Center is required for immediate order' });

    if (logistics === 'partner') {
      // If distance is missing, we default to 1km to apply the base ₹5 fee
      const effectiveDistance = Number(distance) || 1;
      if (effectiveDistance > 500) return res.status(400).json({ message: 'Delivery cannot exceed 500 km' });
    }

    // Handle immediate order stock
    if (orderType === 'immediate') {
      // Find all accepted produce matching cropType and centerId
      const produceList = await Produce.find({ 
        cropType, 
        centerId, 
        status: 'accepted',
        remainingQuantity: { $gt: 0 }
      }).sort({ createdAt: 1 }); // Oldest first

      const totalAvailable = produceList.reduce((sum, p) => sum + p.remainingQuantity, 0);
      if (totalAvailable < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Only ${totalAvailable} kg available.` });
      }

      // Decrement stock from produce records
      let qtyToFulfill = quantity;
      for (const p of produceList) {
        if (qtyToFulfill <= 0) break;
        if (p.remainingQuantity <= qtyToFulfill) {
          qtyToFulfill -= p.remainingQuantity;
          p.remainingQuantity = 0;
        } else {
          p.remainingQuantity -= qtyToFulfill;
          qtyToFulfill = 0;
        }
        await p.save();
      }
    }

    // Get Pricing snapshot
    let pricing = null;
    if (centerId) pricing = await Pricing.findOne({ cropType, centerId, isActive: true });
    if (!pricing) pricing = await Pricing.findOne({ cropType, centerId: null, isActive: true });
    
    if (!pricing) {
      return res.status(400).json({ message: 'No pricing defined for this crop' });
    }

    const marginPerKg = 2.5;
    // Calculation: ₹5 per 150km bracket
    const effectiveDistance = Number(distance) || 1;
    const deliveryPerKg = logistics === 'partner' ? Math.ceil(effectiveDistance / 150) * 5 : 0;
    const finalPricePerKg = pricing.basePrice + marginPerKg + deliveryPerKg;
    const subtotal = finalPricePerKg * quantity;

    // Create Order
    const order = await Order.create({
      buyerId: req.user._id,
      items: [{
        cropType,
        centerId: centerId || null,
        quantity,
        basePricePerKg: pricing.basePrice,
        marginPerKg,
        deliveryPerKg,
        finalPricePerKg,
        subtotal
      }],
      orderType,
      logistics,
      deliveryAddress,
      postalCode,
      distance: logistics === 'partner' ? effectiveDistance : 0,
      totalAmount: subtotal,
      status: 'pending', // Manager will need to confirm
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get buyer's own orders
// @route   GET /api/orders/my
// @access  Buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('items.centerId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin/Manager
const getAllOrders = async (req, res) => {
  try {
    // If manager, maybe filter by centerId (future enhancement). For now, admin sees all
    const orders = await Order.find()
      .populate('buyerId', 'name companyName email phone')
      .populate('items.centerId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin/Manager
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableStock,
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
