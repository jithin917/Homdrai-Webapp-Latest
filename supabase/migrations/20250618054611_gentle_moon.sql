/*
  # Insert Sample Data for OMS

  1. Sample Data
    - Demo stores (Kochi, Trivandrum)
    - Demo users (admin, store managers, sales staff)
    - Sample products
    - Demo customers
    - Sample orders with different statuses

  2. Purpose
    - Provide realistic test data
    - Demonstrate system functionality
    - Enable immediate testing of features
*/

-- Insert sample stores
INSERT INTO oms_stores (id, code, name, address_street, address_city, address_state, address_pin_code, phone, email, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'KCH', 'Homdrai Kochi', 'MG Road, Ernakulam', 'Kochi', 'Kerala', '682001', '+919567199924', 'kochi@homdrai.com', true),
('550e8400-e29b-41d4-a716-446655440002', 'TVM', 'Homdrai Trivandrum', 'Statue Junction', 'Trivandrum', 'Kerala', '695001', '+919567199925', 'trivandrum@homdrai.com', true),
('550e8400-e29b-41d4-a716-446655440003', 'CLT', 'Homdrai Calicut', 'SM Street', 'Calicut', 'Kerala', '673001', '+919567199926', 'calicut@homdrai.com', true);

-- Insert sample users
INSERT INTO oms_users (id, username, email, phone, password_hash, role, store_id, is_active) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440010', 'admin', 'admin@homdrai.com', '+919567199920', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, true),

-- Store managers
('550e8400-e29b-41d4-a716-446655440011', 'manager_kochi', 'manager.kochi@homdrai.com', '+919567199921', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'store_manager', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440012', 'manager_tvm', 'manager.tvm@homdrai.com', '+919567199922', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'store_manager', '550e8400-e29b-41d4-a716-446655440002', true),

-- Sales staff
('550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', 'staff1.kochi@homdrai.com', '+919567199923', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_staff', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', 'staff2.kochi@homdrai.com', '+919567199924', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_staff', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', 'staff1.tvm@homdrai.com', '+919567199925', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_staff', '550e8400-e29b-41d4-a716-446655440002', true);

-- Update store managers
UPDATE oms_stores SET manager_id = '550e8400-e29b-41d4-a716-446655440011' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE oms_stores SET manager_id = '550e8400-e29b-41d4-a716-446655440012' WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert sample products
INSERT INTO oms_products (id, name, description, category, base_price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Designer Blouse', 'Custom designer blouse with intricate work', 'Blouses', 650.00, true),
('550e8400-e29b-41d4-a716-446655440021', 'Lehenga Set', 'Traditional lehenga with choli and dupatta', 'Lehengas', 2500.00, true),
('550e8400-e29b-41d4-a716-446655440022', 'Anarkali Suit', 'Flowing anarkali with churidar and dupatta', 'Suits', 2200.00, true),
('550e8400-e29b-41d4-a716-446655440023', 'Designer Gown', 'Elegant evening gown', 'Gowns', 3500.00, true),
('550e8400-e29b-41d4-a716-446655440024', 'Bridal Lehenga', 'Heavy work bridal lehenga', 'Bridal', 15000.00, true),
('550e8400-e29b-41d4-a716-446655440025', 'Churidar Set', 'Complete churidar with dupatta', 'Suits', 1200.00, true),
('550e8400-e29b-41d4-a716-446655440026', 'Saree Blouse', 'Custom saree blouse', 'Blouses', 450.00, true),
('550e8400-e29b-41d4-a716-446655440027', 'Alteration Service', 'Garment alteration and fitting', 'Alterations', 200.00, true);

-- Insert sample customers
INSERT INTO oms_customers (id, name, email, phone, address_street, address_city, address_state, address_pin_code) VALUES
('CUST-2025-00001', 'Priya Sharma', 'priya.sharma@email.com', '+919876543210', '123 Marine Drive', 'Kochi', 'Kerala', '682001'),
('CUST-2025-00002', 'Meera Nair', 'meera.nair@email.com', '+919876543211', '456 MG Road', 'Kochi', 'Kerala', '682002'),
('CUST-2025-00003', 'Anjali Menon', 'anjali.menon@email.com', '+919876543212', '789 Statue Road', 'Trivandrum', 'Kerala', '695001'),
('CUST-2025-00004', 'Kavya Krishnan', 'kavya.krishnan@email.com', '+919876543213', '321 Palace Road', 'Trivandrum', 'Kerala', '695002'),
('CUST-2025-00005', 'Divya Raj', 'divya.raj@email.com', '+919876543214', '654 Beach Road', 'Kochi', 'Kerala', '682003');

-- Insert sample customer measurements
INSERT INTO oms_customer_measurements (id, customer_id, unit, top_fl, top_sh, top_sl, top_ch, top_wr, top_hip, notes) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'CUST-2025-00001', 'cm', 42.0, 15.0, 24.0, 36.0, 32.0, 38.0, 'Regular fit preferred'),
('550e8400-e29b-41d4-a716-446655440031', 'CUST-2025-00002', 'cm', 40.0, 14.5, 22.0, 34.0, 30.0, 36.0, 'Slightly loose fit'),
('550e8400-e29b-41d4-a716-446655440032', 'CUST-2025-00003', 'cm', 44.0, 16.0, 26.0, 38.0, 34.0, 40.0, 'Fitted style preferred');

-- Insert sample orders
INSERT INTO oms_orders (
  id, customer_id, store_id, assigned_to, type, status, priority,
  garment_type, fabric_type, fabric_color, total_amount, advance_paid, balance_amount,
  order_date, expected_delivery_date, measurement_id, special_instructions
) VALUES
-- Recent orders with different statuses
('ORD-KCH-20250117-001', 'CUST-2025-00001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 'new_stitching', 'confirmed', 'medium', 'Designer Blouse', 'Silk', 'Red', 850.00, 400.00, 450.00, now() - interval '2 days', now() + interval '5 days', '550e8400-e29b-41d4-a716-446655440030', 'Heavy embroidery work required'),

('ORD-KCH-20250117-002', 'CUST-2025-00002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', 'new_stitching', 'in_progress', 'high', 'Lehenga Set', 'Georgette', 'Blue', 3200.00, 1500.00, 1700.00, now() - interval '5 days', now() + interval '8 days', '550e8400-e29b-41d4-a716-446655440031', 'Wedding function - urgent delivery'),

('ORD-TVM-20250117-001', 'CUST-2025-00003', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440015', 'new_stitching', 'fitting_scheduled', 'medium', 'Anarkali Suit', 'Cotton', 'Green', 2400.00, 1000.00, 1400.00, now() - interval '8 days', now() + interval '4 days', '550e8400-e29b-41d4-a716-446655440032', 'First fitting scheduled for tomorrow'),

('ORD-KCH-20250116-001', 'CUST-2025-00004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 'alterations', 'ready', 'low', 'Saree Blouse', 'Silk', 'Gold', 300.00, 150.00, 150.00, now() - interval '10 days', now() - interval '1 day', NULL, 'Simple alteration - size adjustment'),

('ORD-KCH-20250115-001', 'CUST-2025-00005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', 'new_stitching', 'delivered', 'medium', 'Designer Gown', 'Velvet', 'Black', 4200.00, 2000.00, 2200.00, now() - interval '15 days', now() - interval '3 days', NULL, 'Cocktail party gown - delivered successfully'),

('ORD-TVM-20250116-001', 'CUST-2025-00001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440015', 'new_stitching', 'pending', 'urgent', 'Bridal Lehenga', 'Silk', 'Red', 18000.00, 8000.00, 10000.00, now() - interval '1 day', now() + interval '20 days', '550e8400-e29b-41d4-a716-446655440030', 'Bridal order - heavy zardozi work required');

-- Insert order items for the orders
INSERT INTO oms_order_items (order_id, product_id, item_name, quantity, unit_price, subtotal) VALUES
-- Order 1 items
('ORD-KCH-20250117-001', '550e8400-e29b-41d4-a716-446655440020', 'Designer Blouse', 1, 650.00, 650.00),
('ORD-KCH-20250117-001', NULL, 'Heavy Embroidery Work', 1, 200.00, 200.00),

-- Order 2 items
('ORD-KCH-20250117-002', '550e8400-e29b-41d4-a716-446655440021', 'Lehenga Set', 1, 2500.00, 2500.00),
('ORD-KCH-20250117-002', NULL, 'Premium Finishing', 1, 700.00, 700.00),

-- Order 3 items
('ORD-TVM-20250117-001', '550e8400-e29b-41d4-a716-446655440022', 'Anarkali Suit', 1, 2200.00, 2200.00),
('ORD-TVM-20250117-001', NULL, 'Custom Embroidery', 1, 200.00, 200.00),

-- Order 4 items
('ORD-KCH-20250116-001', '550e8400-e29b-41d4-a716-446655440027', 'Alteration Service', 1, 200.00, 200.00),
('ORD-KCH-20250116-001', NULL, 'Size Adjustment', 1, 100.00, 100.00),

-- Order 5 items
('ORD-KCH-20250115-001', '550e8400-e29b-41d4-a716-446655440023', 'Designer Gown', 1, 3500.00, 3500.00),
('ORD-KCH-20250115-001', NULL, 'Premium Fabric Upgrade', 1, 700.00, 700.00),

-- Order 6 items
('ORD-TVM-20250116-001', '550e8400-e29b-41d4-a716-446655440024', 'Bridal Lehenga', 1, 15000.00, 15000.00),
('ORD-TVM-20250116-001', NULL, 'Zardozi Work', 1, 3000.00, 3000.00);

-- Insert initial status history for orders (this will be done automatically by trigger for future orders)
INSERT INTO oms_order_status_history (order_id, status, notes, updated_by, updated_by_name, timestamp) VALUES
-- Order 1 history
('ORD-KCH-20250117-001', 'pending', 'Order created', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '2 days'),
('ORD-KCH-20250117-001', 'confirmed', 'Order confirmed after measurement', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '1 day 12 hours'),

-- Order 2 history
('ORD-KCH-20250117-002', 'pending', 'Order created', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '5 days'),
('ORD-KCH-20250117-002', 'confirmed', 'Order confirmed', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '4 days'),
('ORD-KCH-20250117-002', 'in_progress', 'Stitching started', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '2 days'),

-- Order 3 history
('ORD-TVM-20250117-001', 'pending', 'Order created', '550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', now() - interval '8 days'),
('ORD-TVM-20250117-001', 'confirmed', 'Order confirmed', '550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', now() - interval '7 days'),
('ORD-TVM-20250117-001', 'in_progress', 'Stitching in progress', '550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', now() - interval '4 days'),
('ORD-TVM-20250117-001', 'fitting_scheduled', 'First fitting scheduled', '550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', now() - interval '1 day'),

-- Order 4 history
('ORD-KCH-20250116-001', 'pending', 'Alteration request received', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '10 days'),
('ORD-KCH-20250116-001', 'confirmed', 'Alteration confirmed', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '9 days'),
('ORD-KCH-20250116-001', 'in_progress', 'Alteration in progress', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '7 days'),
('ORD-KCH-20250116-001', 'ready', 'Alteration completed', '550e8400-e29b-41d4-a716-446655440013', 'staff_kochi_1', now() - interval '1 day'),

-- Order 5 history
('ORD-KCH-20250115-001', 'pending', 'Order created', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '15 days'),
('ORD-KCH-20250115-001', 'confirmed', 'Order confirmed', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '14 days'),
('ORD-KCH-20250115-001', 'in_progress', 'Stitching started', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '10 days'),
('ORD-KCH-20250115-001', 'fitting_scheduled', 'Fitting completed', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '6 days'),
('ORD-KCH-20250115-001', 'ready', 'Order ready for delivery', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '4 days'),
('ORD-KCH-20250115-001', 'delivered', 'Order delivered successfully', '550e8400-e29b-41d4-a716-446655440014', 'staff_kochi_2', now() - interval '3 days'),

-- Order 6 history
('ORD-TVM-20250116-001', 'pending', 'Bridal order received', '550e8400-e29b-41d4-a716-446655440015', 'staff_tvm_1', now() - interval '1 day');

-- Insert sample notifications
INSERT INTO oms_notifications (type, recipient, subject, message, status, order_id, customer_id, sent_at) VALUES
('email', 'priya.sharma@email.com', 'Order Confirmation - ORD-KCH-20250117-001', 'Your order for Designer Blouse has been confirmed. Expected delivery: 5 days.', 'sent', 'ORD-KCH-20250117-001', 'CUST-2025-00001', now() - interval '1 day 12 hours'),
('sms', '+919876543210', NULL, 'Homdrai: Your order ORD-KCH-20250117-001 is confirmed. Expected delivery in 5 days.', 'sent', 'ORD-KCH-20250117-001', 'CUST-2025-00001', now() - interval '1 day 12 hours'),
('email', 'meera.nair@email.com', 'Order In Progress - ORD-KCH-20250117-002', 'Your Lehenga Set order is now in progress. We will update you on the fitting schedule.', 'sent', 'ORD-KCH-20250117-002', 'CUST-2025-00002', now() - interval '2 days'),
('email', 'anjali.menon@email.com', 'Fitting Scheduled - ORD-TVM-20250117-001', 'Your first fitting for Anarkali Suit is scheduled for tomorrow at 2 PM.', 'sent', 'ORD-TVM-20250117-001', 'CUST-2025-00003', now() - interval '1 day'),
('email', 'divya.raj@email.com', 'Order Delivered - ORD-KCH-20250115-001', 'Your Designer Gown has been delivered successfully. Thank you for choosing Homdrai!', 'sent', 'ORD-KCH-20250115-001', 'CUST-2025-00005', now() - interval '3 days');

-- Update order totals (this will be done automatically by trigger for future orders)
UPDATE oms_orders SET 
  total_amount = (SELECT SUM(subtotal) FROM oms_order_items WHERE order_id = oms_orders.id),
  balance_amount = total_amount - advance_paid;