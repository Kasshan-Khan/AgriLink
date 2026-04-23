const express = require('express');
const {
  getAllProduce,
  getProduceByCenter,
  getProduceByFarmer,
  createProduce,
  getProduceStats,
} = require('../controllers/produceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllProduce);
router.get('/stats', protect, authorize('admin'), getProduceStats);
router.get('/center/:centerId', protect, authorize('manager', 'admin'), getProduceByCenter);
router.get('/farmer/:farmerId', protect, getProduceByFarmer);
router.post('/', protect, authorize('manager', 'admin'), upload.single('image'), createProduce);

module.exports = router;
