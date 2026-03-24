const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/subscribe', newsletterController.subscribe);
router.get('/subscribers', verifyToken, isAdmin, newsletterController.getAllSubscribers);

module.exports = router;
