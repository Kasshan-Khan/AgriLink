const express = require('express');
const { getUsers, getFarmers, createManager, updateUser, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/farmers', protect, authorize('admin', 'manager'), getFarmers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.post('/managers', protect, authorize('admin'), createManager);
router.put('/:id', protect, updateUser);

module.exports = router;
