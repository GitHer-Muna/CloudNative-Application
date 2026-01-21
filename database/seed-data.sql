-- Sample data for Inventory Management System

USE inventory_db;

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Furniture', 'Office and home furniture'),
('Stationery', 'Office supplies and stationery items'),
('Hardware', 'Tools and hardware supplies'),
('Software', 'Software licenses and digital products');

-- Insert warehouses
INSERT INTO warehouses (name, location, capacity, manager_name, contact_email) VALUES
('Main Warehouse', '123 Industrial Blvd, New York, NY 10001', 10000, 'John Smith', 'john.smith@inventory.com'),
('West Coast Hub', '456 Logistics Ave, Los Angeles, CA 90001', 8000, 'Sarah Johnson', 'sarah.johnson@inventory.com'),
('East Coast Hub', '789 Distribution Dr, Boston, MA 02101', 7500, 'Michael Brown', 'michael.brown@inventory.com');

-- Insert products
INSERT INTO products (name, description, sku, category_id, unit_price, reorder_level) VALUES
('Laptop Dell XPS 15', '15-inch high-performance laptop', 'ELEC-LAP-001', 1, 1299.99, 10),
('Wireless Mouse Logitech', 'Ergonomic wireless mouse', 'ELEC-MOU-001', 1, 29.99, 50),
('Office Desk Oak Wood', 'Solid oak office desk 60x30', 'FURN-DSK-001', 2, 399.99, 5),
('Ergonomic Office Chair', 'Adjustable ergonomic chair with lumbar support', 'FURN-CHR-001', 2, 249.99, 15),
('A4 Printer Paper Box', 'Box of 5000 sheets A4 paper', 'STAT-PAP-001', 3, 45.99, 20),
('Blue Ballpoint Pens', 'Pack of 50 blue pens', 'STAT-PEN-001', 3, 12.99, 100),
('Cordless Drill Kit', 'Professional cordless drill with accessories', 'HARD-DRL-001', 4, 159.99, 8),
('Hammer Set', 'Set of 3 hammers various sizes', 'HARD-HAM-001', 4, 34.99, 25),
('Microsoft Office 365', 'Annual subscription license', 'SOFT-OFF-001', 5, 99.99, 0),
('Adobe Creative Suite', 'Creative Cloud annual license', 'SOFT-ADB-001', 5, 599.99, 0);

-- Insert inventory for products across warehouses
INSERT INTO product_inventory (product_id, warehouse_id, quantity) VALUES
-- Main Warehouse
(1, 1, 25),
(2, 1, 150),
(3, 1, 12),
(4, 1, 30),
(5, 1, 45),
(6, 1, 200),
(7, 1, 18),
(8, 1, 40),
-- West Coast Hub
(1, 2, 18),
(2, 2, 120),
(3, 2, 8),
(4, 2, 22),
(5, 2, 35),
(6, 2, 180),
(7, 2, 15),
(8, 2, 35),
-- East Coast Hub
(1, 3, 22),
(2, 3, 95),
(3, 3, 10),
(4, 3, 28),
(5, 3, 40),
(6, 3, 160),
(7, 3, 12),
(8, 3, 30);

-- Insert a default admin user (password: Admin123!)
-- Note: In production, use bcrypt to hash passwords
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@inventory.com', '$2a$10$rQ3K7X8Y9Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', 'admin'),
('manager1', 'manager@inventory.com', '$2a$10$rQ3K7X8Y9Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', 'manager'),
('staff1', 'staff@inventory.com', '$2a$10$rQ3K7X8Y9Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2', 'staff');

-- Insert sample inventory transactions
INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity, reference_number, notes, user_id) VALUES
(1, 1, 'IN', 25, 'PO-2024-001', 'Initial stock purchase', 1),
(2, 1, 'IN', 150, 'PO-2024-002', 'Bulk order for Q1', 1),
(1, 1, 'OUT', 5, 'SO-2024-001', 'Sold to corporate client', 2),
(2, 2, 'IN', 120, 'PO-2024-003', 'West coast restocking', 1),
(3, 1, 'IN', 12, 'PO-2024-004', 'New furniture line', 1);
