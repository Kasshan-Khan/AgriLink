const User = require('../models/User');

// @desc    Create a manager account
// @route   POST /api/users/managers
// @access  Admin
const createManager = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, phone, password, role: 'manager' });
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (with role filter)
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).populate('assignedCenter', 'name address');
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all farmers
// @route   GET /api/users/farmers
// @access  Admin/Manager
const getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' });
    res.json({ farmers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Self/Admin
const updateUser = async (req, res) => {
  try {
    const { name, phone, landSize, location, role } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (landSize) updateData.landSize = landSize;
    if (location) updateData.location = location;

    // Only admin can change role
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalManagers = await User.countDocuments({ role: 'manager' });

    res.json({ totalUsers, totalFarmers, totalManagers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getFarmers, createManager, updateUser, getUserStats };
