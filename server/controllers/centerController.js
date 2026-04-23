const Center = require('../models/Center');
const User = require('../models/User');

// @desc    Get all centers
// @route   GET /api/centers
// @access  Public
const getCenters = async (req, res) => {
  try {
    const centers = await Center.find().populate('managerId', 'name email phone');
    res.json({ centers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single center
// @route   GET /api/centers/:id
// @access  Private
const getCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id).populate('managerId', 'name email phone');
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ center });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create center
// @route   POST /api/centers
// @access  Admin
const createCenter = async (req, res) => {
  try {
    const { name, address, lat, lng, managerId } = req.body;

    const center = await Center.create({
      name,
      address,
      location: { lat, lng },
      managerId: managerId || null,
    });

    // If manager assigned, update user's assignedCenter
    if (managerId) {
      await User.findByIdAndUpdate(managerId, { assignedCenter: center._id });
    }

    const populated = await Center.findById(center._id).populate('managerId', 'name email phone');
    res.status(201).json({ center: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update center
// @route   PUT /api/centers/:id
// @access  Admin
const updateCenter = async (req, res) => {
  try {
    const { name, address, lat, lng, isActive } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (lat && lng) updateData.location = { lat, lng };
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const center = await Center.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('managerId', 'name email phone');

    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json({ center });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete center
// @route   DELETE /api/centers/:id
// @access  Admin
const deleteCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    // Unassign manager
    if (center.managerId) {
      await User.findByIdAndUpdate(center.managerId, { assignedCenter: null });
    }

    await Center.findByIdAndDelete(req.params.id);
    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign manager to center
// @route   PUT /api/centers/:id/assign-manager
// @access  Admin
const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    // Unassign previous manager
    if (center.managerId) {
      await User.findByIdAndUpdate(center.managerId, { assignedCenter: null });
    }

    // Assign new manager
    center.managerId = managerId;
    await center.save();
    await User.findByIdAndUpdate(managerId, { assignedCenter: center._id });

    const populated = await Center.findById(center._id).populate('managerId', 'name email phone');
    res.json({ center: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCenters, getCenter, createCenter, updateCenter, deleteCenter, assignManager };
