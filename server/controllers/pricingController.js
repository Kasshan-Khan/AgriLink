const Pricing = require('../models/Pricing');

// @desc    Get all pricing rules
// @route   GET /api/pricing
// @access  Admin
const getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find().populate('centerId', 'name location');
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new pricing rule
// @route   POST /api/pricing
// @access  Admin
const createPricing = async (req, res) => {
  try {
    const { cropType, centerId, basePrice } = req.body;

    // Check if duplicate exists
    const existing = await Pricing.findOne({
      cropType,
      centerId: centerId || null,
    });

    if (existing) {
      return res.status(400).json({ message: 'Pricing rule already exists for this crop and center' });
    }

    const pricing = await Pricing.create({
      cropType,
      centerId: centerId || null,
      basePrice,
    });

    res.status(201).json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update pricing rule
// @route   PUT /api/pricing/:id
// @access  Admin
const updatePricing = async (req, res) => {
  try {
    const { basePrice, isActive } = req.body;
    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      { basePrice, isActive },
      { new: true, runValidators: true }
    );

    if (!pricing) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }

    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete pricing rule
// @route   DELETE /api/pricing/:id
// @access  Admin
const deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json({ message: 'Pricing completely removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get final price for buyer (public or buyer accessible)
// @route   GET /api/pricing/buyer?cropType=X&centerId=Y
// @access  Public
const getBuyerPrice = async (req, res) => {
  try {
    const { cropType, centerId } = req.query;
    if (!cropType) return res.status(400).json({ message: 'Crop type required' });

    let pricing = null;
    if (centerId) {
      pricing = await Pricing.findOne({ cropType, centerId, isActive: true });
    }
    
    // Fallback to global
    if (!pricing) {
      pricing = await Pricing.findOne({ cropType, centerId: null, isActive: true });
    }

    if (!pricing) {
      return res.status(404).json({ message: `No pricing available for ${cropType}` });
    }

    // Buyer final price includes basePrice + 2.5 margin
    // Partner logistics fee (5.0) is handled on frontend when calculating total
    const finalPrice = pricing.basePrice + 2.5;

    res.json({
      cropType,
      basePrice: pricing.basePrice,
      margin: 2.5,
      deliveryPerKg: 5.0,
      finalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
  getBuyerPrice,
};
