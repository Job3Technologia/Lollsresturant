const db = require('../config/db');
const { generateOrderNumber } = require('../utils/orderNumber');
const demoStore = require('../utils/demoStore');

// Create a new order
exports.createOrder = async (req, res) => {
    const { 
        customer_name, 
        customer_phone, 
        items, 
        subtotal, 
        service_fee, 
        total_amount, 
        payment_method, 
        pickup_time, 
        notes,
        order_source,
        staff_id
    } = req.body;
    
    // Handle demo mode
    if (db.isDemoMode()) {
        const order_number = 'LOLLY-' + new Date().getFullYear() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newOrder = {
            id: demoStore.orders.length + 1,
            customer_id: req.user ? req.user.id : null,
            order_number,
            customer_name: customer_name || (req.user ? req.user.name : 'Guest'),
            customer_phone: customer_phone || '0000000000',
            total_amount,
            subtotal,
            service_fee,
            status: 'Received',
            items_summary: items.map(i => `${i.quantity}x ${i.name}`).join(', '),
            payment_method: payment_method || 'Online',
            payment_status: payment_method === 'Cash' || payment_method === 'Card' ? 'Pending' : 'Paid',
            created_at: new Date(),
            items: items.map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.price, line_total: i.price * i.quantity }))
        };
        demoStore.orders.unshift(newOrder); // Add to beginning
        
        // Add to logs if user exists
        if (req.user) {
            demoStore.logs.unshift({
                id: demoStore.logs.length + 1,
                customer_id: req.user.id,
                action: 'ORDER_PLACED',
                details: `Placed order #${order_number}`,
                created_at: new Date()
            });
        }

        return res.status(201).json({ 
            message: 'Order placed successfully (DEMO MODE)', 
            orderId: newOrder.id, 
            order_number 
        });
    }

    const customer_id = req.user ? req.user.id : null; // From JWT verifyToken middleware
    
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order must contain items' });
    }

    const order_number = generateOrderNumber();
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // Insert Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (
                customer_id, order_number, customer_name, customer_phone, 
                subtotal, service_fee, total_amount, payment_method, 
                pickup_time, notes, order_source, staff_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_id || null, order_number, customer_name, customer_phone, 
                subtotal, service_fee, total_amount, payment_method, 
                pickup_time, notes, order_source || 'Web', staff_id || null
            ]
        );
        
        const orderId = orderResult.insertId;

        // Insert Order Items
        const orderItemsQueries = items.map(item => {
            return connection.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.menu_item_id, item.quantity, item.price, item.quantity * item.price]
            );
        });
        
        await Promise.all(orderItemsQueries);

        // Add to Kitchen Queue
        await connection.query(
            'INSERT INTO kitchen_queue (order_id, urgency_level) VALUES (?, ?)',
            [orderId, 'Normal']
        );

        // Update Customer Stats if customer_id exists
        if (customer_id) {
            await connection.query(
                `UPDATE customers SET 
                    total_spent = total_spent + ?, 
                    order_count = order_count + 1, 
                    last_order_date = CURRENT_TIMESTAMP 
                WHERE id = ?`,
                [total_amount, customer_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderId, order_number });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// Get all orders (Admin/Staff)
exports.getAllOrders = async (req, res) => {
    if (db.isDemoMode()) {
        return res.status(200).json(demoStore.orders);
    }
    try {
        const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get orders by customer ID
exports.getCustomerOrders = async (req, res) => {
    const customer_id = req.user.id;

    if (db.isDemoMode()) {
        const filtered = demoStore.orders.filter(o => o.customer_id === customer_id);
        return res.status(200).json(filtered);
    }

    try {
        const [rows] = await db.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [customer_id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    if (db.isDemoMode()) {
        const order = demoStore.orders.find(o => o.id == req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        return res.status(200).json(order);
    }
    try {
        const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (orderRows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const [itemRows] = await db.query(
            `SELECT oi.*, mi.name 
             FROM order_items oi 
             JOIN menu_items mi ON oi.menu_item_id = mi.id 
             WHERE oi.order_id = ?`, 
            [req.params.id]
        );
        
        const order = orderRows[0];
        order.items = itemRows;
        
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update order status (Admin/Staff)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    
    if (db.isDemoMode()) {
        const order = demoStore.orders.find(o => o.id == orderId);
        if (order) {
            order.status = status;
            return res.status(200).json({ message: `Order marked as ${status} (DEMO MODE)` });
        }
        return res.status(404).json({ message: 'Order not found' });
    }
    
    try {
        let updateQuery = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
        const queryParams = [status, orderId];

        if (status === 'Preparing') {
            updateQuery += ', preparing_at = CURRENT_TIMESTAMP';
            await db.query('UPDATE kitchen_queue SET started_at = CURRENT_TIMESTAMP WHERE order_id = ?', [orderId]);
        } else if (status === 'Ready') {
            updateQuery += ', ready_at = CURRENT_TIMESTAMP';
            await db.query('UPDATE kitchen_queue SET completed_at = CURRENT_TIMESTAMP WHERE order_id = ?', [orderId]);
            
            // Calculate preparation time
            const [orderData] = await db.query('SELECT preparing_at FROM orders WHERE id = ?', [orderId]);
            if (orderData[0] && orderData[0].preparing_at) {
                const prepTimeMins = Math.round((new Date() - new Date(orderData[0].preparing_at)) / 60000);
                updateQuery += `, preparation_time_mins = ${prepTimeMins}`;
            }
        } else if (status === 'Collected') {
            updateQuery += ', collected_at = CURRENT_TIMESTAMP';
        }

        updateQuery += ' WHERE id = ?';
        const [result] = await db.query(updateQuery, queryParams);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: `Order marked as ${status}` });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
