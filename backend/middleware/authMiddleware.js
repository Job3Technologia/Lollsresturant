const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'lollys_secret_key';

exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

exports.isStaff = (req, res, next) => {
    if (!['Admin', 'Manager', 'Chef', 'Cashier'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Staff access required' });
    }
    next();
};
