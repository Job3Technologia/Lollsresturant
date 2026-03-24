const db = require('../config/db');

exports.calculateKitchenLoad = async () => {
    try {
        const [rows] = await db.query(`
            SELECT COUNT(*) as active_orders 
            FROM orders 
            WHERE status IN ('Received', 'Preparing')
        `);
        
        const activeOrders = rows[0].active_orders;
        
        // Thresholds based on operational limits (small stove, limited staff)
        if (activeOrders > 10) {
            return {
                level: 'Critical',
                message: 'Kitchen is overloaded. Expect 45+ min delay.',
                delay_minutes: 45
            };
        } else if (activeOrders > 5) {
            return {
                level: 'High',
                message: 'High kitchen load. Expect 25-30 min delay.',
                delay_minutes: 30
            };
        } else {
            return {
                level: 'Normal',
                message: 'Kitchen load normal. Expect 15 min delay.',
                delay_minutes: 15
            };
        }
    } catch (error) {
        console.error('Error calculating kitchen load:', error);
        return { level: 'Normal', message: '', delay_minutes: 15 };
    }
};

exports.getPeakPatterns = async () => {
    try {
        const [rows] = await db.query(`
            SELECT HOUR(created_at) as hour, COUNT(*) as order_count
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY HOUR(created_at)
            ORDER BY order_count DESC
        `);
        return rows;
    } catch (error) {
        console.error('Error fetching peak patterns:', error);
        return [];
    }
};
