/*
  # OMS Utility Functions and Views

  1. Utility Functions
    - Customer search and management
    - Order tracking and management
    - Dashboard statistics
    - Notification management

  2. Views
    - Order summary view
    - Customer summary view
    - Dashboard statistics view

  3. Additional Features
    - Order tracking by phone
    - Customer lookup functions
    - Revenue calculations
*/

-- Function to search customers
CREATE OR REPLACE FUNCTION search_customers(
  search_term text DEFAULT NULL,
  phone_number text DEFAULT NULL,
  email_address text DEFAULT NULL
)
RETURNS TABLE(
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  total_orders bigint,
  total_spent numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent
  FROM oms_customers c
  LEFT JOIN oms_orders o ON c.id = o.customer_id
  WHERE 
    (search_term IS NULL OR 
     c.name ILIKE '%' || search_term || '%' OR
     c.email ILIKE '%' || search_term || '%' OR
     c.phone ILIKE '%' || search_term || '%')
    AND (phone_number IS NULL OR c.phone = phone_number)
    AND (email_address IS NULL OR c.email = email_address)
  GROUP BY c.id, c.name, c.email, c.phone
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to track order by order ID and phone
CREATE OR REPLACE FUNCTION track_order_by_phone(
  order_id_param text,
  phone_param text
)
RETURNS TABLE(
  order_id text,
  customer_name text,
  order_status order_status,
  order_type order_type,
  garment_type text,
  total_amount numeric,
  advance_paid numeric,
  balance_amount numeric,
  order_date timestamptz,
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  store_name text,
  store_phone text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    c.name,
    o.status,
    o.type,
    o.garment_type,
    o.total_amount,
    o.advance_paid,
    o.balance_amount,
    o.order_date,
    o.expected_delivery_date,
    o.actual_delivery_date,
    s.name,
    s.phone
  FROM oms_orders o
  JOIN oms_customers c ON o.customer_id = c.id
  JOIN oms_stores s ON o.store_id = s.id
  WHERE o.id = order_id_param 
    AND c.phone = phone_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  store_id_param uuid DEFAULT NULL,
  date_from timestamptz DEFAULT NULL,
  date_to timestamptz DEFAULT NULL
)
RETURNS TABLE(
  total_orders bigint,
  pending_orders bigint,
  in_progress_orders bigint,
  completed_orders bigint,
  total_revenue numeric,
  monthly_revenue numeric,
  customer_count bigint,
  average_order_value numeric
) AS $$
DECLARE
  start_of_month timestamptz;
  end_of_month timestamptz;
BEGIN
  -- Set default date range to current month if not provided
  IF date_from IS NULL THEN
    start_of_month := date_trunc('month', now());
  ELSE
    start_of_month := date_from;
  END IF;
  
  IF date_to IS NULL THEN
    end_of_month := date_trunc('month', now()) + interval '1 month' - interval '1 day';
  ELSE
    end_of_month := date_to;
  END IF;

  RETURN QUERY
  SELECT 
    -- Total orders
    (SELECT COUNT(*) FROM oms_orders o 
     WHERE (store_id_param IS NULL OR o.store_id = store_id_param))::bigint,
    
    -- Pending orders
    (SELECT COUNT(*) FROM oms_orders o 
     WHERE o.status = 'pending' 
     AND (store_id_param IS NULL OR o.store_id = store_id_param))::bigint,
    
    -- In progress orders
    (SELECT COUNT(*) FROM oms_orders o 
     WHERE o.status IN ('confirmed', 'in_progress', 'fitting_scheduled') 
     AND (store_id_param IS NULL OR o.store_id = store_id_param))::bigint,
    
    -- Completed orders
    (SELECT COUNT(*) FROM oms_orders o 
     WHERE o.status = 'delivered' 
     AND (store_id_param IS NULL OR o.store_id = store_id_param))::bigint,
    
    -- Total revenue
    (SELECT COALESCE(SUM(o.total_amount), 0) FROM oms_orders o 
     WHERE (store_id_param IS NULL OR o.store_id = store_id_param)),
    
    -- Monthly revenue
    (SELECT COALESCE(SUM(o.total_amount), 0) FROM oms_orders o 
     WHERE o.order_date >= start_of_month 
     AND o.order_date <= end_of_month
     AND (store_id_param IS NULL OR o.store_id = store_id_param)),
    
    -- Customer count
    (SELECT COUNT(DISTINCT o.customer_id) FROM oms_orders o 
     WHERE (store_id_param IS NULL OR o.store_id = store_id_param))::bigint,
    
    -- Average order value
    (SELECT COALESCE(AVG(o.total_amount), 0) FROM oms_orders o 
     WHERE (store_id_param IS NULL OR o.store_id = store_id_param));
END;
$$ LANGUAGE plpgsql;

-- Function to get store performance
CREATE OR REPLACE FUNCTION get_store_performance()
RETURNS TABLE(
  store_id uuid,
  store_name text,
  store_code text,
  order_count bigint,
  revenue numeric,
  average_order_value numeric,
  completion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.code,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total_amount), 0) as revenue,
    CASE 
      WHEN COUNT(o.id) > 0 THEN COALESCE(SUM(o.total_amount), 0) / COUNT(o.id)
      ELSE 0
    END as average_order_value,
    CASE 
      WHEN COUNT(o.id) > 0 THEN 
        (COUNT(CASE WHEN o.status = 'delivered' THEN 1 END)::numeric / COUNT(o.id)::numeric) * 100
      ELSE 0
    END as completion_rate
  FROM oms_stores s
  LEFT JOIN oms_orders o ON s.id = o.store_id
  WHERE s.is_active = true
  GROUP BY s.id, s.name, s.code
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get order details with customer and store info
CREATE OR REPLACE FUNCTION get_order_details(order_id_param text)
RETURNS TABLE(
  order_id text,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  store_name text,
  store_phone text,
  assigned_staff text,
  order_type order_type,
  order_status order_status,
  priority priority_level,
  garment_type text,
  fabric_type text,
  fabric_color text,
  total_amount numeric,
  advance_paid numeric,
  balance_amount numeric,
  order_date timestamptz,
  expected_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  special_instructions text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    c.id,
    c.name,
    c.email,
    c.phone,
    s.name,
    s.phone,
    u.username,
    o.type,
    o.status,
    o.priority,
    o.garment_type,
    o.fabric_type,
    o.fabric_color,
    o.total_amount,
    o.advance_paid,
    o.balance_amount,
    o.order_date,
    o.expected_delivery_date,
    o.actual_delivery_date,
    o.special_instructions
  FROM oms_orders o
  JOIN oms_customers c ON o.customer_id = c.id
  JOIN oms_stores s ON o.store_id = s.id
  LEFT JOIN oms_users u ON o.assigned_to = u.id
  WHERE o.id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  notification_type notification_type,
  recipient_param text,
  subject_param text,
  message_param text,
  order_id_param text DEFAULT NULL,
  customer_id_param text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO oms_notifications (
    type,
    recipient,
    subject,
    message,
    order_id,
    customer_id
  ) VALUES (
    notification_type,
    recipient_param,
    subject_param,
    message_param,
    order_id_param,
    customer_id_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status with notification
CREATE OR REPLACE FUNCTION update_order_status_with_notification(
  order_id_param text,
  new_status order_status,
  notes_param text DEFAULT NULL,
  updated_by_param uuid DEFAULT NULL,
  send_notification boolean DEFAULT true
)
RETURNS boolean AS $$
DECLARE
  customer_record RECORD;
  notification_message text;
  notification_subject text;
BEGIN
  -- Update order status
  UPDATE oms_orders 
  SET status = new_status, updated_at = now()
  WHERE id = order_id_param;
  
  -- Get customer details for notification
  SELECT c.name, c.email, c.phone, c.communication_email, c.communication_sms
  INTO customer_record
  FROM oms_customers c
  JOIN oms_orders o ON c.id = o.customer_id
  WHERE o.id = order_id_param;
  
  -- Send notifications if requested
  IF send_notification AND customer_record IS NOT NULL THEN
    -- Prepare notification content based on status
    CASE new_status
      WHEN 'confirmed' THEN
        notification_subject := 'Order Confirmed - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your order ' || order_id_param || ' has been confirmed. We will start working on it soon.';
      WHEN 'in_progress' THEN
        notification_subject := 'Order In Progress - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your order ' || order_id_param || ' is now in progress. Our team is working on it.';
      WHEN 'fitting_scheduled' THEN
        notification_subject := 'Fitting Scheduled - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your fitting for order ' || order_id_param || ' has been scheduled. Please contact us for details.';
      WHEN 'ready' THEN
        notification_subject := 'Order Ready - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your order ' || order_id_param || ' is ready for pickup. Please visit our store.';
      WHEN 'delivered' THEN
        notification_subject := 'Order Delivered - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your order ' || order_id_param || ' has been delivered successfully. Thank you for choosing Homdrai!';
      ELSE
        notification_subject := 'Order Update - ' || order_id_param;
        notification_message := 'Dear ' || customer_record.name || ', your order ' || order_id_param || ' status has been updated to ' || new_status || '.';
    END CASE;
    
    -- Send email notification
    IF customer_record.communication_email AND customer_record.email IS NOT NULL THEN
      PERFORM create_notification(
        'email',
        customer_record.email,
        notification_subject,
        notification_message,
        order_id_param,
        (SELECT customer_id FROM oms_orders WHERE id = order_id_param)
      );
    END IF;
    
    -- Send SMS notification
    IF customer_record.communication_sms THEN
      PERFORM create_notification(
        'sms',
        customer_record.phone,
        NULL,
        'Homdrai: ' || notification_message,
        order_id_param,
        (SELECT customer_id FROM oms_orders WHERE id = order_id_param)
      );
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create views for easier data access

-- Order Summary View
CREATE OR REPLACE VIEW oms_order_summary AS
SELECT 
  o.id as order_id,
  o.customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  s.name as store_name,
  s.code as store_code,
  u.username as assigned_staff,
  o.type as order_type,
  o.status as order_status,
  o.priority,
  o.garment_type,
  o.total_amount,
  o.advance_paid,
  o.balance_amount,
  o.order_date,
  o.expected_delivery_date,
  o.actual_delivery_date,
  CASE 
    WHEN o.status = 'delivered' THEN 'Completed'
    WHEN o.status = 'cancelled' THEN 'Cancelled'
    WHEN o.expected_delivery_date < now() AND o.status NOT IN ('delivered', 'cancelled') THEN 'Overdue'
    ELSE 'On Track'
  END as delivery_status
FROM oms_orders o
JOIN oms_customers c ON o.customer_id = c.id
JOIN oms_stores s ON o.store_id = s.id
LEFT JOIN oms_users u ON o.assigned_to = u.id;

-- Customer Summary View
CREATE OR REPLACE VIEW oms_customer_summary AS
SELECT 
  c.id as customer_id,
  c.name as customer_name,
  c.email,
  c.phone,
  c.address_city,
  c.address_state,
  COUNT(o.id) as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_spent,
  COALESCE(SUM(o.advance_paid), 0) as total_paid,
  COALESCE(SUM(o.balance_amount), 0) as total_balance,
  MAX(o.order_date) as last_order_date,
  COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN o.status IN ('pending', 'confirmed', 'in_progress', 'fitting_scheduled', 'ready') THEN 1 END) as active_orders
FROM oms_customers c
LEFT JOIN oms_orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email, c.phone, c.address_city, c.address_state;

-- Daily Sales Summary View
CREATE OR REPLACE VIEW oms_daily_sales AS
SELECT 
  DATE(o.order_date) as order_date,
  s.name as store_name,
  s.code as store_code,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_revenue,
  SUM(o.advance_paid) as total_advance,
  AVG(o.total_amount) as average_order_value,
  COUNT(CASE WHEN o.type = 'new_stitching' THEN 1 END) as new_stitching_orders,
  COUNT(CASE WHEN o.type = 'alterations' THEN 1 END) as alteration_orders
FROM oms_orders o
JOIN oms_stores s ON o.store_id = s.id
GROUP BY DATE(o.order_date), s.name, s.code
ORDER BY order_date DESC, store_name;

-- Pending Orders View
CREATE OR REPLACE VIEW oms_pending_orders AS
SELECT 
  o.id as order_id,
  c.name as customer_name,
  c.phone as customer_phone,
  s.name as store_name,
  o.garment_type,
  o.priority,
  o.order_date,
  o.expected_delivery_date,
  EXTRACT(DAY FROM (o.expected_delivery_date - now())) as days_until_delivery,
  CASE 
    WHEN o.expected_delivery_date < now() THEN 'Overdue'
    WHEN o.expected_delivery_date < now() + interval '3 days' THEN 'Due Soon'
    ELSE 'On Track'
  END as urgency_status
FROM oms_orders o
JOIN oms_customers c ON o.customer_id = c.id
JOIN oms_stores s ON o.store_id = s.id
WHERE o.status IN ('pending', 'confirmed', 'in_progress', 'fitting_scheduled', 'ready')
ORDER BY o.expected_delivery_date ASC;