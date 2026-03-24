const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Customer Auth
router.post('/register', authController.registerCustomer);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.loginCustomer);
router.post('/logout', authController.logout);

// Staff Auth
router.post('/staff/login', authController.loginStaff);

module.exports = router;
