const db = require('../config/db');

exports.logAdminAction = async (adminId, action, details, req) => {
    try {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        await db.query(
            'INSERT INTO admin_audit_logs (admin_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
            [adminId, action, details, ipAddress, userAgent]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};
