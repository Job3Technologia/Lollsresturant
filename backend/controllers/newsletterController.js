const db = require('../config/db');

exports.subscribe = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const [existing] = await db.query('SELECT * FROM newsletter_subscribers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }
        await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
