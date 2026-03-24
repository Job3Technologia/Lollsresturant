const db = require('../config/db');

// Mock Data for Demo Mode
const mockCategories = [
    { id: 1, name: 'Daily Special Meals', display_order: 1 },
    { id: 2, name: 'Weekly Daily Specials', display_order: 2 },
    { id: 3, name: 'Breakfast', display_order: 3 },
    { id: 4, name: 'Gwinya Combos', display_order: 4 },
    { id: 5, name: 'Zulu Burger Combos', display_order: 5 },
    { id: 6, name: 'Kota Menu', display_order: 6 }
];

const mockMenuItems = [
    { id: 1, category_id: 1, category_name: 'Daily Special Meals', name: 'Beef Curry', price: 81.00, description: 'Tender beef slow-cooked in aromatic spices', special_badge: 'Popular', is_featured: 1, is_available: 1 },
    { id: 2, category_id: 1, category_name: 'Daily Special Meals', name: 'Chicken Curry', price: 81.00, description: 'Succulent chicken in a rich, spicy gravy', special_badge: null, is_featured: 0, is_available: 1 },
    { id: 3, category_id: 6, category_name: 'Kota Menu', name: 'Kota 4', price: 59.00, description: 'Kota with chips, russian, cheese and egg', special_badge: 'Hungry?', is_featured: 1, is_available: 1 },
    { id: 4, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya, Polony and Cheese Combo', price: 15.00, description: 'The ultimate breakfast mix', special_badge: 'Value', is_featured: 0, is_available: 1 }
];

exports.getAllMenuItems = async (req, res) => {
    if (db.isDemoMode()) {
        return res.status(200).json(mockMenuItems);
    }
    try {
        const { include_unavailable } = req.query;
        let query = `
            SELECT mi.*, mc.name as category_name 
            FROM menu_items mi 
            JOIN menu_categories mc ON mi.category_id = mc.id 
        `;
        
        if (include_unavailable !== 'true') {
            query += ` WHERE mi.is_available = 1`;
        }
        
        query += ` ORDER BY mc.display_order, mi.name`;

        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMenuCategories = async (req, res) => {
    if (db.isDemoMode()) {
        return res.status(200).json(mockCategories);
    }
    try {
        const [rows] = await db.query('SELECT * FROM menu_categories ORDER BY display_order');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFeaturedItems = async (req, res) => {
    if (db.isDemoMode()) {
        return res.status(200).json(mockMenuItems.filter(i => i.is_featured === 1));
    }
    try {
        const [rows] = await db.query('SELECT * FROM menu_items WHERE is_featured = 1 AND is_available = 1');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching featured items:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMenuItemById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createMenuItem = async (req, res) => {
    const { name, description, price, category_id, image_url, is_featured, special_badge } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO menu_items (name, description, price, category_id, image_url, is_featured, special_badge) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category_id, image_url, is_featured, special_badge]
        );
        res.status(201).json({ id: result.insertId, name, description, price, category_id, image_url });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateMenuItem = async (req, res) => {
    const { name, description, price, category_id, image_url, is_available, is_featured, special_badge } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?, is_featured = ?, special_badge = ? WHERE id = ?',
            [name, description, price, category_id, image_url, is_available, is_featured, special_badge, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item updated successfully' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
