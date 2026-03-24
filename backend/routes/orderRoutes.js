const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');

// Create a new order (Protected)
router.post('/', verifyToken, orderController.createOrder);

// Get orders by customer ID (Protected)
router.get('/customer', verifyToken, orderController.getCustomerOrders);

// Get all orders (Staff/Admin only)
router.get('/', verifyToken, isStaff, orderController.getAllOrders);

// Get order by ID (Protected)
router.get('/:id', verifyToken, orderController.getOrderById);

// Update order status (Staff/Admin only)
router.put('/:id/status', verifyToken, isStaff, orderController.updateOrderStatus);

module.exports = router;
