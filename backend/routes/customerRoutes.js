const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, customerController.getCustomerProfile);
router.get('/orders', verifyToken, customerController.getCustomerOrders);
router.put('/profile', verifyToken, customerController.updateCustomerProfile);
router.post('/deposit', verifyToken, customerController.depositToWallet);
router.post('/verify-id', verifyToken, customerController.uploadVerificationDoc);
router.get('/shops', customerController.getAllShops);
router.get('/logs', verifyToken, customerController.getCustomerLogs);

module.exports = router;
