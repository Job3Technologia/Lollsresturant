const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');

router.get('/sales', verifyToken, isStaff, analyticsController.getSalesTrends);
router.get('/peak-times', verifyToken, isStaff, analyticsController.getPeakTimes);

module.exports = router;
