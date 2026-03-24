const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET all menu items
router.get('/', menuController.getAllMenuItems);

// GET a single menu item by ID
router.get('/:id', menuController.getMenuItemById);

// POST a new menu item (Admin only - middleware to be added)
router.post('/', menuController.createMenuItem);

// PUT update a menu item (Admin only)
router.put('/:id', menuController.updateMenuItem);

// DELETE a menu item (Admin only)
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
