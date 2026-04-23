const express = require('express');
const {
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
  getBuyerPrice,
} = require('../controllers/pricingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/buyer', getBuyerPrice); // Public/buyer
router.get('/', protect, getPricing); // Admin
router.post('/', protect, createPricing); // Admin
router.put('/:id', protect, updatePricing); // Admin
router.delete('/:id', protect, deletePricing); // Admin

module.exports = router;
