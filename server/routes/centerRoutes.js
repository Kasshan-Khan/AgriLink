const express = require('express');
const {
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
  assignManager,
} = require('../controllers/centerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', getCenters); // Public
router.get('/:id', protect, getCenter);
router.post('/', protect, authorize('admin'), createCenter);
router.put('/:id', protect, authorize('admin'), updateCenter);
router.delete('/:id', protect, authorize('admin'), deleteCenter);
router.put('/:id/assign-manager', protect, authorize('admin'), assignManager);

module.exports = router;
