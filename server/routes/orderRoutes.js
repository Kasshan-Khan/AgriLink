const express = require('express');
const {
  getAvailableStock,
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public / Buyer routes
router.get('/stock', getAvailableStock);

// Protected routes (Buyer)
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);

// Protected routes (Admin/Manager)
router.get('/', protect, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
