const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { verifyToken, isStaff } = require('../middleware/authMiddleware');

router.get('/queue', verifyToken, isStaff, kitchenController.getKitchenQueue);
router.put('/status', verifyToken, isStaff, kitchenController.updateQueueStatus);

module.exports = router;
