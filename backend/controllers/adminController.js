const db = require('../config/db');
const { logAdminAction } = require('../utils/auditLogger');
const { sendReportEmail } = require('../utils/mailer');
const demoStore = require('../utils/demoStore');

exports.getDashboardStats = async (req, res) => {
    if (db.isDemoMode()) {
        const activeKitchen = demoStore.orders.filter(o => ['Received', 'Preparing'].includes(o.status)).length;
        const totalRevenue = demoStore.orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        
        return res.status(200).json({
            todayRevenue: (totalRevenue / 30).toFixed(2), // Average daily for demo
            todayOrders: Math.floor(demoStore.orders.length / 30),
            activeKitchen: activeKitchen,
            topProduct: { name: 'Beef Curry', sales_count: 125 },
            avgPrepTime: '18m'
        });
    }
    try {
        const today = new Date().toISOString().slice(0, 10);
        
        const [todayRevenue] = await db.query('SELECT SUM(total_amount) as revenue FROM orders WHERE DATE(created_at) = ? AND status != "Cancelled"', [today]);
        const [todayOrders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?', [today]);
        const [activeKitchen] = await db.query('SELECT COUNT(*) as count FROM orders WHERE status IN ("Received", "Preparing")');
        const [topProduct] = await db.query(`
            SELECT mi.name, COUNT(oi.id) as sales_count 
            FROM order_items oi 
            JOIN menu_items mi ON oi.menu_item_id = mi.id 
            GROUP BY mi.id 
            ORDER BY sales_count DESC 
            LIMIT 1
        `);

        res.status(200).json({
            todayRevenue: todayRevenue[0].revenue || 0,
            todayOrders: todayOrders[0].count || 0,
            activeKitchen: activeKitchen[0].count || 0,
            topProduct: topProduct[0] || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAccountingStatement = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Audit log for accessing sensitive financial info
        await logAdminAction(req.user.id, 'ACCESS_FINANCIAL_REPORT', `Statement for ${startDate} to ${endDate}`, req);

        // Calculate Revenue
        const [revenueData] = await db.query(`
            SELECT SUM(total_amount) as total_revenue, SUM(service_fee) as total_service_fees
            FROM orders 
            WHERE status != 'Cancelled' AND created_at BETWEEN ? AND ?
        `, [startDate, endDate]);

        // Calculate Cost of Goods Sold (COGS)
        const [cogsData] = await db.query(`
            SELECT SUM(oi.quantity * mi.cost_price) as total_cogs
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'Cancelled' AND o.created_at BETWEEN ? AND ?
        `, [startDate, endDate]);

        const totalRevenue = parseFloat(revenueData[0].total_revenue) || 0;
        const totalCOGS = parseFloat(cogsData[0].total_cogs) || 0;
        const grossProfit = totalRevenue - totalCOGS;

        res.status(200).json({
            revenue: totalRevenue,
            cogs: totalCOGS,
            grossProfit: grossProfit,
            netProfit: grossProfit // Assuming no other expenses for now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.exportAdminReport = async (req, res) => {
    try {
        const { companyEmail, reportType } = req.body;
        
        // Audit log
        await logAdminAction(req.user.id, 'EXPORT_REPORT', `Type: ${reportType}, Sent to: ${companyEmail}`, req);

        // Fetch report data
        const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
        
        // In a real system, we'd generate a PDF here. 
        // For this demo, we'll send a high-quality HTML email report as the "recorded report".
        await sendReportEmail(companyEmail, reportType, orders);

        res.status(200).json({ message: 'Report exported and sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllCustomers = async (req, res) => {
    if (db.isDemoMode()) {
        const customers = demoStore.users.map(u => ({
            ...u,
            first_name: u.first_name || u.name.split(' ')[0],
            last_name: u.last_name || u.name.split(' ')[1] || 'User',
        }));

        const otherNames = [
            'John Doe', 'Jane Smith', 'Thabo Mokoena', 'Sarah Zulu', 
            'David Miller', 'Chris Evans', 'Lollys User', 'Michael Brown', 
            'Emily Davis', 'Daniel Wilson', 'Jessica Taylor', 'Andrew Moore',
            'Sibusiso Khoza', 'Zanele Gumede', 'Bongani Nkosi', 'Nompumelelo Cele',
            'Thulani Buthelezi', 'Ayanda Dlamini', 'Nomusa Mkhize', 'Sipho Zuma',
            'Phumzile Ndlovu', 'Lindani Myeni', 'Thandiwe Mthembu', 'Mandla Zungu',
            'Nkosana Shabalala', 'Zandile Gumbi', 'Lunga Ngcobo', 'Ntombi Madlala',
            'Sabelo Mabaso', 'Nonhlanhla Mbatha', 'Vusi Khumalo', 'Zodwa Sibiya',
            'Jabulani Ntuli', 'Nelly Radebe', 'Prince Kunene', 'Busi Sithole',
            'Themba Vilakazi', 'Lerato Moloi'
        ];
        
        const mockCustomers = otherNames.map((name, i) => ({
            id: i + 2000,
            first_name: name.split(' ')[0],
            last_name: name.split(' ')[1] || 'User',
            email: `${name.replace(/\s+/g, '').toLowerCase()}@example.com`,
            phone: `08${Math.floor(Math.random() * 90000000 + 10000000)}`,
            total_spent: (Math.random() * 5000 + 200).toFixed(2),
            order_count: Math.floor(Math.random() * 50 + 5),
            verification_status: Math.random() > 0.3 ? 'Verified' : 'Unverified'
        }));
        
        return res.status(200).json([...customers, ...mockCustomers].sort((a, b) => b.total_spent - a.total_spent));
    }
    try {
        const [rows] = await db.query('SELECT * FROM customers ORDER BY total_spent DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
