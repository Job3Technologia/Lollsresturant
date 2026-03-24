const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../utils/mailer');
const demoStore = require('../utils/demoStore');

const JWT_SECRET = process.env.JWT_SECRET || 'lollys_secret_key';

// Generate random verification code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Human Verification Helper
const verifyCaptcha = async (token) => {
    // In production, verify with Cloudflare Turnstile or Google reCAPTCHA
    // const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { ... });
    return true; // Placeholder
};

// Register Customer
exports.registerCustomer = async (req, res) => {
    const { firstName, lastName, email, phone, password, captchaToken } = req.body;

    const isHuman = await verifyCaptcha(captchaToken);
    if (!isHuman) return res.status(400).json({ error: 'Human verification failed' });

    // Demo Mode: Allow fake registration
    if (db.isDemoMode()) {
        const newId = Math.floor(Math.random() * 1000) + 2000;
        const newUser = {
            id: newId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            password: password, // In demo we don't hash for simplicity if we want to check it later
            is_verified: false,
            verification_code: generateCode()
        };
        demoStore.users.push(newUser);
        return res.status(201).json({ 
            message: 'Customer registered. Please verify your email. (DEMO MODE)', 
            customerId: newId 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateCode();

        const [result] = await db.execute(
            'INSERT INTO customers (first_name, last_name, email, phone, password, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
            [firstName, lastName, email, phone, hashedPassword, verificationCode]
        );

        // Send email in real time
        await sendVerificationCode(email, verificationCode);

        res.status(201).json({ 
            message: 'Customer registered. Please verify your email.', 
            customerId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    // Demo Mode
    if (db.isDemoMode()) {
        const user = demoStore.users.find(u => u.email === email);
        if (user) {
            user.is_verified = true;
            return res.status(200).json({ message: 'Email verified successfully. You can now login. (DEMO MODE)' });
        }
    }

    try {
        const [rows] = await db.execute('SELECT * FROM customers WHERE email = ? AND verification_code = ?', [email, code]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        await db.execute('UPDATE customers SET is_verified = TRUE, verification_code = NULL WHERE email = ?', [email]);

        res.status(200).json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

// Login Customer
exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    // Demo Mode Fallback
    if (db.isDemoMode()) {
        const user = demoStore.users.find(u => u.email === email && u.password === password);
        if (user) {
            const token = jwt.sign({ id: user.id, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ 
                token, 
                customer: {
                    id: user.id, 
                    name: user.name || `${user.first_name} ${user.last_name}`, 
                    role: 'customer',
                    email: user.email,
                    phone: user.phone,
                    total_spent: user.total_spent || 0,
                    order_count: user.order_count || 0,
                    wallet_balance: user.wallet_balance || 0,
                    profile_image: user.profile_image || null
                } 
            });
        }
    }

    try {
        const [rows] = await db.execute('SELECT * FROM customers WHERE email = ?', [email]);
        const customer = rows[0];

        if (!customer || !(await bcrypt.compare(password, customer.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!customer.is_verified) {
            return res.status(403).json({ error: 'Please verify your email first.' });
        }

        // Persistent login (24h)
        const token = jwt.sign({ id: customer.id, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
        
        // Log user activity
        await db.execute('UPDATE customers SET last_order_date = CURRENT_TIMESTAMP WHERE id = ?', [customer.id]);

        res.json({ 
            token, 
            customer: { 
                id: customer.id, 
                name: `${customer.first_name} ${customer.last_name}`, 
                role: 'customer',
                email: customer.email,
                phone: customer.phone
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.json({ message: 'Logged out' });
};

// Login Staff
exports.loginStaff = async (req, res) => {
    const { email, password } = req.body;

    // Demo Mode Fallback
    if (db.isDemoMode()) {
        const staff = demoStore.staff.find(s => s.email === email && s.password === password);
        if (staff) {
            const token = jwt.sign({ id: staff.id, role: 'Admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({ 
                token, 
                staff: { 
                    id: staff.id, 
                    name: staff.name, 
                    role: 'Admin',
                    email: staff.email
                } 
            });
        }
    }

    try {
        const [rows] = await db.execute('SELECT * FROM staff WHERE email = ?', [email]);
        const staff = rows[0];

        if (!staff || !(await bcrypt.compare(password, staff.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: staff.id, role: staff.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            staff: { 
                id: staff.id, 
                name: staff.full_name, 
                role: staff.role,
                email: staff.email
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Staff login failed' });
    }
};
