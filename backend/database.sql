-- Database creation
CREATE DATABASE IF NOT EXISTS lollys_food_joint;
USE lollys_food_joint;

-- Customers table (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255), -- For registered users, nullable for guests
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    order_count INT DEFAULT 0,
    last_order_date TIMESTAMP NULL,
    favorite_item_id INT,
    notes TEXT,
    is_loyal BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    country_code VARCHAR(5) DEFAULT 'ZA',
    country_name VARCHAR(100) DEFAULT 'South Africa',
    verification_status ENUM('Unverified', 'Pending', 'Verified') DEFAULT 'Unverified',
    id_document_url VARCHAR(255),
    id_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shops / Locations Table
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'South Africa',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Shops
INSERT INTO shops (name, address, city, phone) VALUES 
('Lolly\'s Durban Central', '123 Smith Street', 'Durban', '031 000 1111'),
('Lolly\'s Umhlanga Rocks', '45 Ocean Way', 'Umhlanga', '031 000 2222'),
('Lolly\'s Florida Road', '88 Florida Rd', 'Morningside', '031 000 3333');

-- Customer Activity Logs (Persistent)
CREATE TABLE IF NOT EXISTS customer_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Customer Deposits / Wallet Transactions
CREATE TABLE IF NOT EXISTS customer_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) DEFAULT 'Card',
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_order INT DEFAULT 0
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0.00, -- Added for Profit & Loss
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    special_badge VARCHAR(50), -- e.g., 'New', 'Popular', 'Limited'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Chef', 'Cashier', 'Manager') NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('Active', 'Inactive', 'On Shift') DEFAULT 'Active',
    shift_start TIME,
    shift_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Audit Logs (For security/sensitive information access)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES staff(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT, -- Can be NULL for guest checkout
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100), -- For guest checkout
    customer_phone VARCHAR(20), -- For guest checkout
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Received', 'Preparing', 'Ready', 'Collected', 'Cancelled') DEFAULT 'Received',
    payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    payment_method ENUM('Cash', 'Online', 'Card') DEFAULT 'Cash',
    order_source ENUM('Web', 'POS') DEFAULT 'Web',
    staff_id INT, -- If POS order
    notes TEXT,
    pickup_time DATETIME,
    preparing_at TIMESTAMP NULL,
    ready_at TIMESTAMP NULL,
    collected_at TIMESTAMP NULL,
    preparation_time_mins INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Order Items table (linking orders to menu items)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Kitchen Queue / Display System Tracking
CREATE TABLE IF NOT EXISTS kitchen_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_ready_time TIMESTAMP NULL,
    urgency_level ENUM('Normal', 'High', 'Critical') DEFAULT 'Normal',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Analytics / Peak Time Logs
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    hour INT NOT NULL,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    order_count INT DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    peak_load_score INT DEFAULT 0, -- Metric for kitchen load
    UNIQUE KEY (date, hour)
);

-- Insert Menu Categories
INSERT INTO menu_categories (name, display_order) VALUES
('Daily Special Meals', 1),
('Weekly Daily Specials', 2),
('Breakfast', 3),
('Gwinya Combos', 4),
('Zulu Burger Combos', 5),
('Kota Menu', 6),
('Wings', 7),
('Sides', 8),
('Rolls', 9);

-- Insert Menu Items
INSERT INTO menu_items (category_id, name, description, price, image_url, is_featured, special_badge) VALUES
(1, 'Beef Curry', 'Delicious beef curry daily special', 81.00, 'images/beef_curry.jpg', TRUE, 'Popular'),
(1, 'Chicken Curry', 'Spicy chicken curry daily special', 81.00, 'images/chicken_curry.jpg', FALSE, NULL),
(2, 'Mutton Curry', 'Monday Special Mutton Curry', 88.00, 'images/mutton_curry.jpg', FALSE, 'Monday Only'),
(2, 'Chicken Biryani', 'Tuesday Special Chicken Biryani', 81.00, 'images/chicken_biryani.jpg', TRUE, 'Tuesday Only'),
(3, 'Classic Breakfast', 'Eggs, toast, bacon', 80.00, 'images/breakfast.jpg', FALSE, NULL),
(4, 'Gwinya Vetkoek', 'Traditional vetkoek', 7.00, 'images/gwinya.jpg', FALSE, NULL),
(4, 'Gwinya & Polony', 'Vetkoek with polony', 10.00, 'images/gwinya_polony.jpg', FALSE, NULL),
(4, 'Gwinya & Cheese', 'Vetkoek with cheese', 12.00, 'images/gwinya_cheese.jpg', FALSE, NULL),
(5, 'Zulu Burger', 'Traditional Zulu burger', 22.00, 'images/zulu_burger.jpg', FALSE, NULL),
(6, 'Kota 1', 'Standard Kota', 37.00, 'images/kota1.jpg', FALSE, NULL),
(6, 'Last Number Kota', 'Fully loaded Kota', 81.00, 'images/last_number_kota.jpg', TRUE, 'Best Seller'),
(7, 'Fried Wings', 'Crispy fried wings', 206.00, 'images/wings.jpg', FALSE, NULL),
(8, 'Fried Chips', 'Crispy potato chips', 21.00, 'images/chips.jpg', FALSE, NULL),
(9, 'Cheese Russian Roll', 'Roll with cheese and russian', 44.00, 'images/russian_roll.jpg', FALSE, NULL);
