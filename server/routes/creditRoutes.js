const express = require('express');
const {
  getFarmerCredit,
  issueCredit,
  recordRepayment,
  getCreditStats,
} = require('../controllers/creditController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/farmer/:farmerId', protect, getFarmerCredit);
router.post('/', protect, authorize('admin'), issueCredit);
router.post('/repay', protect, authorize('admin'), recordRepayment);
router.get('/stats', protect, authorize('admin'), getCreditStats);

module.exports = router;
