const db = require('./config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
    if (db.isDemoMode()) {
        console.log('Skipping seed process in DEMO MODE.');
        return;
    }
    try {
        console.log('Starting seed process...');

        // 1. Create Admin User
        const adminEmail = 'admin@lollys.co.za';
        const adminPassword = 'admin'; // In production, use strong password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const [existingAdmin] = await db.query('SELECT * FROM staff WHERE email = ?', [adminEmail]);
        
        if (existingAdmin.length === 0) {
            await db.query(
                'INSERT INTO staff (full_name, role, email, password, status) VALUES (?, ?, ?, ?, ?)',
                ['Lollys Admin', 'Admin', adminEmail, hashedPassword, 'Active']
            );
            console.log('Admin user created: admin@lollys.co.za / admin');
        } else {
            console.log('Admin user already exists.');
        }

        // 1.5 Create Test Customer
        const customerEmail = 'user@lollys.co.za';
        const customerPassword = 'password123';
        const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10);

        const [existingCustomer] = await db.query('SELECT * FROM customers WHERE email = ?', [customerEmail]);

        if (existingCustomer.length === 0) {
            await db.query(
                'INSERT INTO customers (first_name, last_name, email, phone, password, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
                ['Lollys', 'User', customerEmail, '0830000000', hashedCustomerPassword, true]
            );
            console.log('Test customer created: user@lollys.co.za / password123');
        } else {
            console.log('Test customer already exists.');
        }

        // 2. Seed Categories
        const categories = [
            { name: 'Daily Special Meals', order: 1 },
            { name: 'Weekly Daily Specials', order: 2 },
            { name: 'Breakfast', order: 3 },
            { name: 'Gwinya Combos', order: 4 },
            { name: 'Zulu Burger Combos', order: 5 },
            { name: 'Kota Menu', order: 6 },
            { name: 'Wings', order: 7 },
            { name: 'Fried Chips', order: 8 },
            { name: 'Rolls', order: 9 }
        ];

        for (const cat of categories) {
            await db.query(
                'INSERT INTO menu_categories (name, display_order) VALUES (?, ?) ON DUPLICATE KEY UPDATE display_order = ?',
                [cat.name, cat.order, cat.order]
            );
        }
        console.log('Categories seeded.');

        // 3. Seed Menu Items
        // Fetch category IDs to map names to IDs
        const [catRows] = await db.query('SELECT id, name FROM menu_categories');
        const catMap = {};
        catRows.forEach(c => catMap[c.name] = c.id);

        const menuItems = [
            // Daily Special Meals
            { cat: 'Daily Special Meals', name: 'Beef Curry', price: 81.00, desc: 'Tender beef slow-cooked in aromatic spices', badge: 'Popular', featured: true },
            { cat: 'Daily Special Meals', name: 'Chicken Curry', price: 81.00, desc: 'Succulent chicken in a rich, spicy gravy', badge: null, featured: false },
            
            // Weekly Daily Specials
            { cat: 'Weekly Daily Specials', name: 'Monday Special: Mutton Curry', price: 88.00, desc: 'Traditional mutton curry (Monday Only)', badge: 'Mon Special', featured: false },
            { cat: 'Weekly Daily Specials', name: 'Tuesday Special: Chicken Biryani', price: 81.00, desc: 'Fragrant basmati rice with spiced chicken (Tuesday Only)', badge: 'Tue Special', featured: true },
            { cat: 'Weekly Daily Specials', name: 'Wednesday Special: Umgxabhiso', price: 81.00, desc: 'Traditional tripe served with steam bread or pap (Wednesday Only)', badge: 'Wed Special', featured: false },
            { cat: 'Weekly Daily Specials', name: 'Thursday Special: Isitambu', price: 81.00, desc: 'Samp and beans with meat stew (Thursday Only)', badge: 'Thu Special', featured: false },

            // Breakfast
            { cat: 'Breakfast', name: 'Classic Breakfast', price: 80.00, desc: 'Eggs, bacon, toast, and grilled tomato', badge: 'Morning Only', featured: false },

            // Gwinya Combos
            { cat: 'Gwinya Combos', name: 'Gwinya Vetkoek Combo', price: 7.00, desc: 'Freshly fried traditional vetkoek', badge: null, featured: false },
            { cat: 'Gwinya Combos', name: 'Gwinya and Polony Combo', price: 10.00, desc: 'Vetkoek filled with polony slices', badge: null, featured: false },
            { cat: 'Gwinya Combos', name: 'Gwinya and Cheese Combo', price: 12.00, desc: 'Vetkoek filled with cheddar cheese', badge: null, featured: false },
            { cat: 'Gwinya Combos', name: 'Gwinya, Polony and Cheese Combo', price: 15.00, desc: 'The ultimate breakfast mix', badge: 'Value', featured: false },
            { cat: 'Gwinya Combos', name: 'Gwinya and Fried Chips Small Combo', price: 34.00, desc: 'Vetkoek served with a side of small chips', badge: null, featured: false },

            // Zulu Burger Combos
            { cat: 'Zulu Burger Combos', name: 'Zulu Burger Combo', price: 22.00, desc: 'Traditional seasoned patty on a fresh bun', badge: null, featured: false },
            { cat: 'Zulu Burger Combos', name: 'Zulu Burger with Polony Combo', price: 25.00, desc: 'Zulu burger topped with polony', badge: null, featured: false },
            { cat: 'Zulu Burger Combos', name: 'Zulu Burger with Cheese and Polony Combo', price: 30.00, desc: 'Fully loaded Zulu burger with cheese and polony', badge: 'Tasty', featured: false },

            // Kota Menu
            { cat: 'Kota Menu', name: 'Kota 1', price: 37.00, desc: 'Standard Kota with chips and polony', badge: null, featured: false },
            { cat: 'Kota Menu', name: 'Kota 2', price: 37.00, desc: 'Kota with chips and vienna', badge: null, featured: false },
            { cat: 'Kota Menu', name: 'Kota 3', price: 44.00, desc: 'Kota with chips, polony and cheese', badge: null, featured: false },
            { cat: 'Kota Menu', name: 'Kota 4', price: 59.00, desc: 'Kota with chips, russian, cheese and egg', badge: 'Hungry?', featured: false },
            { cat: 'Kota Menu', name: 'Kota 5', price: 59.00, desc: 'Kota with chips, beef patty, cheese and egg', badge: null, featured: false },
            { cat: 'Kota Menu', name: 'Last Number Kota', price: 81.00, desc: 'The Legend: Fully loaded with everything', badge: 'Best Seller', featured: true },

            // Wings
            { cat: 'Wings', name: 'Fried Wings', price: 206.00, desc: 'Platter of crispy fried wings', badge: 'Shareable', featured: false },
            { cat: 'Wings', name: 'Wings and Chips', price: 66.00, desc: '6 Wings served with crispy chips', badge: null, featured: false },

            // Fried Chips
            { cat: 'Fried Chips', name: 'Fried Chips', price: 21.00, desc: 'Golden crispy potato chips', badge: null, featured: false },

            // Rolls
            { cat: 'Rolls', name: 'Cheese Russian Roll', price: 44.00, desc: 'Fresh roll with russian sausage and melted cheese', badge: null, featured: false }
        ];

        for (const item of menuItems) {
            const catId = catMap[item.cat];
            if (catId) {
                // Check if exists to avoid duplicates or reset
                const [exists] = await db.query('SELECT id FROM menu_items WHERE name = ?', [item.name]);
                if (exists.length === 0) {
                    await db.query(
                        'INSERT INTO menu_items (category_id, name, description, price, image_url, is_featured, special_badge, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [catId, item.name, item.desc, item.price, `images/${item.name.toLowerCase().replace(/ /g, '_').replace(/[:]/g, '')}.jpg`, item.featured, item.badge, true]
                    );
                } else {
                    // Optional: Update price/desc if needed
                    await db.query(
                        'UPDATE menu_items SET price = ?, description = ?, special_badge = ?, is_featured = ? WHERE id = ?',
                        [item.price, item.desc, item.badge, item.featured, exists[0].id]
                    );
                }
            }
        }
        
        console.log('Menu items seeded/updated.');
    } catch (error) {
        console.error('Seed failed:', error);
    }
};

module.exports = seed;
