const db = require('../config/db');
const demoStore = require('../utils/demoStore');

exports.getCustomerProfile = async (req, res) => {
    if (db.isDemoMode()) {
        const user = demoStore.users.find(u => u.id === req.user.id);
        if (user) return res.status(200).json(user);
        
        const isMeluleki = req.user.id === 1000;
        return res.status(200).json({
            id: req.user.id,
            first_name: isMeluleki ? 'Meluleki' : 'Demo',
            last_name: isMeluleki ? 'User' : 'Customer',
            email: isMeluleki ? 'Meluleki@Digitalcommercesolutions.com' : 'user@lollys.co.za',
            phone: isMeluleki ? '083 456 7890' : '0123456789',
            total_spent: isMeluleki ? 4250.50 : 0.00,
            order_count: isMeluleki ? 35 : 0,
            wallet_balance: isMeluleki ? 150.00 : 0.00,
            verification_status: isMeluleki ? 'Verified' : 'Unverified',
            profile_image_url: isMeluleki ? "https://ui-avatars.com/api/?name=Meluleki&background=F97316&color=fff" : null
        });
    }
    try {
        const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, total_spent, order_count, last_order_date, is_loyal, profile_image_url, wallet_balance, country_code, country_name, verification_status, id_document_url FROM customers WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateCustomerProfile = async (req, res) => {
    const { firstName, lastName, phone, profileImageUrl, countryCode, countryName } = req.body;
    
    if (db.isDemoMode()) {
        const user = demoStore.users.find(u => u.id === req.user.id);
        if (user) {
            user.first_name = firstName;
            user.last_name = lastName;
            user.phone = phone;
            user.profile_image_url = profileImageUrl;
            
            demoStore.logs.unshift({
                id: demoStore.logs.length + 1,
                customer_id: req.user.id,
                action: 'PROFILE_UPDATE',
                details: `Updated profile for ${firstName} ${lastName} (DEMO MODE)`,
                created_at: new Date()
            });
            return res.status(200).json({ message: 'Profile updated (DEMO MODE)' });
        }
    }
    
    try {
        await db.query('UPDATE customers SET first_name = ?, last_name = ?, phone = ?, profile_image_url = ?, country_code = ?, country_name = ? WHERE id = ?', 
            [firstName, lastName, phone, profileImageUrl, countryCode, countryName, req.user.id]);
        
        await db.query('INSERT INTO customer_logs (customer_id, action, details) VALUES (?, ?, ?)', 
            [req.user.id, 'PROFILE_UPDATE', `Updated profile for ${firstName} ${lastName}`]);
            
        res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.uploadVerificationDoc = async (req, res) => {
    const { idDocumentUrl } = req.body;
    try {
        await db.query('UPDATE customers SET id_document_url = ?, verification_status = "Pending" WHERE id = ?', [idDocumentUrl, req.user.id]);
        
        await db.query('INSERT INTO customer_logs (customer_id, action, details) VALUES (?, ?, ?)', 
            [req.user.id, 'VERIFICATION_SUBMITTED', 'Submitted ID for verification']);
            
        res.status(200).json({ message: 'Verification document submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllShops = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shops WHERE is_active = TRUE');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.depositToWallet = async (req, res) => {
    const { amount, transaction_id } = req.body;
    try {
        await db.query('INSERT INTO customer_deposits (customer_id, amount, transaction_id, status) VALUES (?, ?, ?, "Completed")', 
            [req.user.id, amount, transaction_id]);
        
        await db.query('UPDATE customers SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, req.user.id]);
        
        await db.query('INSERT INTO customer_logs (customer_id, action, details) VALUES (?, ?, ?)', 
            [req.user.id, 'WALLET_DEPOSIT', `Deposited ${amount} via card`]);

        res.status(200).json({ message: 'Deposit successful' });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCustomerLogs = async (req, res) => {
    if (db.isDemoMode()) {
        const logs = demoStore.logs.filter(l => l.customer_id === req.user.id);
        return res.status(200).json(logs);
    }
    try {
        const [rows] = await db.query('SELECT * FROM customer_logs WHERE customer_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
