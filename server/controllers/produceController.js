const Produce = require('../models/Produce');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all produce (with filters)
// @route   GET /api/produce
// @access  Admin
const getAllProduce = async (req, res) => {
  try {
    const { centerId, cropType, status, startDate, endDate } = req.query;
    const filter = {};

    if (centerId) filter.centerId = centerId;
    if (cropType) filter.cropType = new RegExp(cropType, 'i');
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const produce = await Produce.find(filter)
      .populate('farmerId', 'name email phone')
      .populate('centerId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ produce, count: produce.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get produce by center
// @route   GET /api/produce/center/:centerId
// @access  Manager
const getProduceByCenter = async (req, res) => {
  try {
    const produce = await Produce.find({ centerId: req.params.centerId })
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ produce, count: produce.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get produce by farmer
// @route   GET /api/produce/farmer/:farmerId
// @access  Farmer
const getProduceByFarmer = async (req, res) => {
  try {
    const produce = await Produce.find({ farmerId: req.params.farmerId })
      .populate('centerId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ produce, count: produce.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create produce entry (with image upload)
// @route   POST /api/produce
// @access  Manager
const createProduce = async (req, res) => {
  try {
    const { centerId, farmerId, cropType, quantity, price } = req.body;

    let imageUrl = '';

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        // Continue without image — don't block produce entry
      }
    }

    const produce = await Produce.create({
      centerId,
      farmerId,
      cropType,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      imageUrl,
    });

    const populated = await Produce.findById(produce._id)
      .populate('farmerId', 'name email phone')
      .populate('centerId', 'name address');

    res.status(201).json({ produce: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get produce stats
// @route   GET /api/produce/stats
// @access  Admin
const getProduceStats = async (req, res) => {
  try {
    const totalProduce = await Produce.countDocuments();
    const totalQuantity = await Produce.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const totalValue = await Produce.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Per center stats
    const perCenter = await Produce.aggregate([
      {
        $group: {
          _id: '$centerId',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'centers',
          localField: '_id',
          foreignField: '_id',
          as: 'center',
        },
      },
      { $unwind: '$center' },
      {
        $project: {
          centerName: '$center.name',
          totalQuantity: 1,
          totalValue: 1,
          count: 1,
        },
      },
    ]);

    // Monthly trends
    const monthlyTrends = await Produce.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalProduce,
      totalQuantity: totalQuantity[0]?.total || 0,
      totalValue: totalValue[0]?.total || 0,
      perCenter,
      monthlyTrends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllProduce, getProduceByCenter, getProduceByFarmer, createProduce, getProduceStats };
