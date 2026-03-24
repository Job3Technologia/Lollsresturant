const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboardStats);
router.get('/customers', verifyToken, isAdmin, adminController.getAllCustomers);
router.get('/accounting', verifyToken, isAdmin, adminController.getAccountingStatement);
router.post('/export-report', verifyToken, isAdmin, adminController.exportAdminReport);

module.exports = router;
