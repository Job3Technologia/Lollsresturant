const db = require('../config/db');

exports.getSalesTrends = async (req, res) => {
    if (db.isDemoMode()) {
        const mockTrends = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            mockTrends.push({
                date,
                daily_revenue: (Math.random() * 2000 + 500).toFixed(2),
                order_count: Math.floor(Math.random() * 40 + 10)
            });
        }
        return res.status(200).json(mockTrends);
    }
    try {
        const [rows] = await db.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as daily_revenue, COUNT(*) as order_count 
            FROM orders 
            WHERE status != "Cancelled" 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC 
            LIMIT 30
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPeakTimes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT HOUR(created_at) as hour, COUNT(*) as order_count 
            FROM orders 
            GROUP BY HOUR(created_at) 
            ORDER BY order_count DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
