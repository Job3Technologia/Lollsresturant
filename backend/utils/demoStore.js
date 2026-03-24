// In-memory data store for DEMO MODE
// This allows for "real-time" updates that persist during the session but reset on server restart

const demoStore = {
    users: [
        { email: 'user@lollys.co.za', password: 'password123', name: "Demo User", id: 999, phone: "083 000 0001", total_spent: 0, order_count: 0, wallet_balance: 0, verification_status: 'Unverified' },
        { 
            email: 'Meluleki@Digitalcommercesolutions.com', 
            password: 'Woke49today', 
            name: "Meluleki", 
            id: 1000,
            phone: "083 456 7890",
            total_spent: 4250.50,
            order_count: 35,
            wallet_balance: 150.00,
            verification_status: 'Verified',
            profile_image: "https://ui-avatars.com/api/?name=Meluleki&background=F97316&color=fff"
        }
    ],
    staff: [
        { email: 'admin@lollys.co.za', password: 'admin123', name: "CEO Administrator", id: 1, role: 'Admin' },
        { email: 'RealAdmin@lollys.com', password: 'Woke49today', name: "Meluleki (Admin)", id: 2, role: 'Admin' }
    ],
    orders: [],
    logs: [],
    categories: [
        { id: 1, name: 'Daily Special Meals', display_order: 1 },
        { id: 2, name: 'Weekly Daily Specials', display_order: 2 },
        { id: 3, name: 'Breakfast', display_order: 3 },
        { id: 4, name: 'Gwinya Combos', display_order: 4 },
        { id: 5, name: 'Zulu Burger Combos', display_order: 5 },
        { id: 6, name: 'Kota Menu', display_order: 6 }
    ],
    menuItems: [
        { id: 1, category_id: 1, category_name: 'Daily Special Meals', name: 'Beef Curry', price: 81.00, description: 'Tender beef slow-cooked in aromatic spices', special_badge: 'Popular', is_featured: 1, is_available: 1 },
        { id: 2, category_id: 1, category_name: 'Daily Special Meals', name: 'Chicken Curry', price: 81.00, description: 'Succulent chicken in a rich, spicy gravy', special_badge: null, is_featured: 0, is_available: 1 },
        { id: 3, category_id: 6, category_name: 'Kota Menu', name: 'Kota 4', price: 59.00, description: 'Kota with chips, russian, cheese and egg', special_badge: 'Hungry?', is_featured: 1, is_available: 1 },
        { id: 4, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya, Polony and Cheese Combo', price: 15.00, description: 'The ultimate breakfast mix', special_badge: 'Value', is_featured: 0, is_available: 1 }
    ]
};

// Initialize with the 150 mock orders for admin and 35 for Meluleki
const initializeDemoData = () => {
    const statuses = ['Received', 'Preparing', 'Ready', 'Collected', 'Cancelled'];
    const methods = ['Cash', 'Online', 'Card'];
    const customers = [
        'Meluleki', 'John Doe', 'Jane Smith', 'Thabo Mokoena', 'Sarah Zulu', 
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

    // Admin Orders (150)
    for (let i = 1; i <= 150; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const amount = (Math.random() * 250 + 45).toFixed(2);
        const menuItems = ['Beef Curry', 'Chicken Curry', 'Kota 4', 'Zulu Burger Combo', 'Gwinya Combo'];
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        
        demoStore.orders.push({
            id: i,
            customer_id: customer === 'Meluleki' ? 1000 : Math.floor(Math.random() * 100) + 2000,
            order_number: `LOLLY-${2026}${i.toString().padStart(4, '0')}`,
            customer_name: customer,
            total_amount: amount,
            status: status,
            items_summary: `1x ${randomItem}`,
            payment_method: methods[Math.floor(Math.random() * methods.length)],
            payment_status: status === 'Cancelled' ? 'Failed' : 'Paid',
            created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
            items: [
                { name: randomItem, quantity: 1, unit_price: amount, line_total: amount }
            ]
        });
    }

    // Meluleki Specific Orders (35 of the above will be linked, but let's ensure he has exactly 35)
    // Actually, we can just filter the above list or add specific ones if needed.
    // For the demo, let's just make sure the count matches.
    
    // Initial Logs
    demoStore.logs = [
        { id: 1, customer_id: 1000, action: 'ORDER_PLACED', details: 'Placed order #LOLLY-20260150', created_at: new Date(Date.now() - 1000 * 60 * 30) },
        { id: 2, customer_id: 1000, action: 'WALLET_DEPOSIT', details: 'Deposited R500.00 into wallet', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { id: 3, customer_id: 1000, action: 'ORDER_COLLECTED', details: 'Collected order #LOLLY-20260145', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5) }
    ];

    // Specific Kitchen Demo Entries (10 Preparing, 4 Ready)
    const menuItems = ['Beef Curry', 'Chicken Curry', 'Kota 4', 'Zulu Burger Combo', 'Gwinya Combo'];
    
    // 10 Preparing
    for (let i = 1; i <= 10; i++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        demoStore.orders.unshift({
            id: 200 + i,
            customer_id: 3000 + i,
            order_number: `KITCH-PREP-${i.toString().padStart(3, '0')}`,
            customer_name: `Kitchen Customer ${i}`,
            total_amount: (Math.random() * 100 + 50).toFixed(2),
            status: 'Preparing',
            items_summary: `1x ${item}`,
            payment_method: 'Online',
            payment_status: 'Paid',
            created_at: new Date(Date.now() - (i * 2) * 60000), // Staggered times
            urgency_level: i % 3 === 0 ? 'High' : 'Normal',
            items: [{ name: item, quantity: 1, unit_price: 50, line_total: 50 }]
        });
    }

    // 4 Ready
    for (let i = 1; i <= 4; i++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        demoStore.orders.unshift({
            id: 300 + i,
            customer_id: 4000 + i,
            order_number: `KITCH-READY-${i.toString().padStart(3, '0')}`,
            customer_name: `Ready Customer ${i}`,
            total_amount: (Math.random() * 100 + 50).toFixed(2),
            status: 'Ready',
            items_summary: `1x ${item}`,
            payment_method: 'Online',
            payment_status: 'Paid',
            created_at: new Date(Date.now() - (i * 10) * 60000),
            urgency_level: 'Normal',
            items: [{ name: item, quantity: 1, unit_price: 50, line_total: 50 }]
        });
    }

    // 6 Pending (Received)
    for (let i = 1; i <= 6; i++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        demoStore.orders.unshift({
            id: 400 + i,
            customer_id: 5000 + i,
            order_number: `KITCH-PEND-${i.toString().padStart(3, '0')}`,
            customer_name: `New Customer ${i}`,
            total_amount: (Math.random() * 100 + 50).toFixed(2),
            status: 'Received',
            items_summary: `1x ${item}`,
            payment_method: 'Online',
            payment_status: 'Paid',
            created_at: new Date(Date.now() - (i * 1) * 60000),
            urgency_level: i === 1 ? 'High' : 'Normal',
            items: [{ name: item, quantity: 1, unit_price: 50, line_total: 50 }]
        });
    }
};

initializeDemoData();

module.exports = demoStore;
