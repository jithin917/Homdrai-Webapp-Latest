/*
  # Order Management System (OMS) Database Schema

  1. New Tables
    - `oms_users` - System users (admin, store managers, sales staff)
    - `oms_stores` - Store locations and details
    - `oms_customers` - Customer information and profiles
    - `oms_customer_measurements` - Customer measurement records
    - `oms_orders` - Main orders table
    - `oms_order_items` - Individual items within orders
    - `oms_products` - Product catalog
    - `oms_order_status_history` - Order status change tracking
    - `oms_notifications` - Email/SMS/WhatsApp notifications

  2. Relationships
    - One-to-many: Customers → Orders
    - One-to-many: Orders → Order Items
    - One-to-many: Products → Order Items
    - One-to-many: Orders → Order Status History
    - One-to-many: Stores → Orders
    - One-to-many: Users → Orders (assigned staff)

  3. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Store-specific data isolation

  4. Indexes and Constraints
    - Foreign key constraints
    - Performance indexes
    - Unique constraints where needed
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'store_manager', 'sales_staff');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_progress', 'fitting_scheduled', 'ready', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('new_stitching', 'alterations');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'whatsapp');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE measurement_unit AS ENUM ('cm', 'inches');

-- OMS Users Table
CREATE TABLE IF NOT EXISTS oms_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_staff',
  store_id uuid,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Stores Table
CREATE TABLE IF NOT EXISTS oms_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- Used in order ID generation (e.g., 'KCH', 'TVM')
  name text NOT NULL,
  address_street text NOT NULL,
  address_city text NOT NULL,
  address_state text NOT NULL,
  address_pin_code text NOT NULL,
  address_country text NOT NULL DEFAULT 'India',
  phone text NOT NULL,
  email text NOT NULL,
  manager_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Customers Table
CREATE TABLE IF NOT EXISTS oms_customers (
  id text PRIMARY KEY, -- Format: CUST-YYYY-XXXXX
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  address_street text,
  address_city text,
  address_state text,
  address_pin_code text,
  address_country text DEFAULT 'India',
  communication_email boolean DEFAULT true,
  communication_sms boolean DEFAULT true,
  communication_whatsapp boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Customer Measurements Table
CREATE TABLE IF NOT EXISTS oms_customer_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES oms_customers(id) ON DELETE CASCADE,
  unit measurement_unit NOT NULL DEFAULT 'cm',
  
  -- Top measurements
  top_fl numeric(5,2), -- Full Length
  top_sh numeric(5,2), -- Shoulder
  top_sl numeric(5,2), -- Sleeve Length
  top_sr numeric(5,2), -- Sleeve Round
  top_mr numeric(5,2), -- Mid Round
  top_ah numeric(5,2), -- Arm Hole
  top_ch numeric(5,2), -- Chest
  top_br numeric(5,2), -- Bust Round
  top_wr numeric(5,2), -- Waist Round
  top_hip numeric(5,2), -- Hip
  top_slit numeric(5,2), -- Slit
  top_fn numeric(5,2), -- Front Neck
  top_bn numeric(5,2), -- Back Neck
  top_dp numeric(5,2), -- Dart Point
  top_pp numeric(5,2), -- Princess Panel
  
  -- Bottom measurements
  bottom_fl numeric(5,2), -- Full Length
  bottom_wr numeric(5,2), -- Waist Round
  bottom_sr numeric(5,2), -- Seat Round
  bottom_tr numeric(5,2), -- Thigh Round
  bottom_lr numeric(5,2), -- Leg Round
  bottom_ar numeric(5,2), -- Ankle Round
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Products Table
CREATE TABLE IF NOT EXISTS oms_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Orders Table
CREATE TABLE IF NOT EXISTS oms_orders (
  id text PRIMARY KEY, -- Format: ORD-STORECODE-YYYYMMDD-XXX
  customer_id text NOT NULL REFERENCES oms_customers(id),
  store_id uuid NOT NULL REFERENCES oms_stores(id),
  assigned_to uuid REFERENCES oms_users(id),
  
  -- Order details
  type order_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  
  -- Garment specifications
  garment_type text NOT NULL,
  style_images text[], -- Array of image URLs
  fabric_images text[], -- Array of fabric image URLs
  fabric_type text,
  fabric_color text,
  fabric_quantity numeric(8,2),
  fabric_unit text DEFAULT 'meters',
  
  -- Measurements
  measurement_id uuid REFERENCES oms_customer_measurements(id),
  special_instructions text,
  
  -- Dates
  order_date timestamptz NOT NULL DEFAULT now(),
  expected_delivery_date timestamptz NOT NULL,
  actual_delivery_date timestamptz,
  fitting_date timestamptz,
  
  -- Financial
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  advance_paid numeric(10,2) NOT NULL DEFAULT 0,
  balance_amount numeric(10,2) NOT NULL DEFAULT 0,
  advance_paid_date timestamptz,
  balance_paid_date timestamptz,
  
  -- Additional fields
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Order Items Table
CREATE TABLE IF NOT EXISTS oms_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES oms_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES oms_products(id),
  item_name text NOT NULL, -- For custom items not in products table
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OMS Order Status History Table
CREATE TABLE IF NOT EXISTS oms_order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES oms_orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes text,
  updated_by uuid REFERENCES oms_users(id),
  updated_by_name text NOT NULL, -- Store name for reference even if user is deleted
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- OMS Notifications Table
CREATE TABLE IF NOT EXISTS oms_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  recipient text NOT NULL, -- Email/phone number
  subject text,
  message text NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  order_id text REFERENCES oms_orders(id),
  customer_id text REFERENCES oms_customers(id),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE oms_users ADD CONSTRAINT fk_users_store 
  FOREIGN KEY (store_id) REFERENCES oms_stores(id);

ALTER TABLE oms_stores ADD CONSTRAINT fk_stores_manager 
  FOREIGN KEY (manager_id) REFERENCES oms_users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oms_users_store_id ON oms_users(store_id);
CREATE INDEX IF NOT EXISTS idx_oms_users_role ON oms_users(role);
CREATE INDEX IF NOT EXISTS idx_oms_users_email ON oms_users(email);

CREATE INDEX IF NOT EXISTS idx_oms_customers_phone ON oms_customers(phone);
CREATE INDEX IF NOT EXISTS idx_oms_customers_email ON oms_customers(email);
CREATE INDEX IF NOT EXISTS idx_oms_customers_name ON oms_customers(name);

CREATE INDEX IF NOT EXISTS idx_oms_measurements_customer_id ON oms_customer_measurements(customer_id);

CREATE INDEX IF NOT EXISTS idx_oms_orders_customer_id ON oms_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_oms_orders_store_id ON oms_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_oms_orders_status ON oms_orders(status);
CREATE INDEX IF NOT EXISTS idx_oms_orders_type ON oms_orders(type);
CREATE INDEX IF NOT EXISTS idx_oms_orders_assigned_to ON oms_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_oms_orders_order_date ON oms_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_oms_orders_expected_delivery ON oms_orders(expected_delivery_date);

CREATE INDEX IF NOT EXISTS idx_oms_order_items_order_id ON oms_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_oms_order_items_product_id ON oms_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_oms_status_history_order_id ON oms_order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_oms_status_history_timestamp ON oms_order_status_history(timestamp);

CREATE INDEX IF NOT EXISTS idx_oms_notifications_order_id ON oms_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_oms_notifications_customer_id ON oms_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_oms_notifications_status ON oms_notifications(status);
CREATE INDEX IF NOT EXISTS idx_oms_notifications_type ON oms_notifications(type);

-- Enable Row Level Security
ALTER TABLE oms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_customer_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oms_users
CREATE POLICY "Users can read own profile"
  ON oms_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users"
  ON oms_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users"
  ON oms_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for oms_stores
CREATE POLICY "Users can read stores"
  ON oms_stores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stores"
  ON oms_stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for oms_customers
CREATE POLICY "Staff can read customers"
  ON oms_customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create customers"
  ON oms_customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update customers"
  ON oms_customers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Public access for order tracking
CREATE POLICY "Public can read customers for tracking"
  ON oms_customers
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for oms_customer_measurements
CREATE POLICY "Staff can manage measurements"
  ON oms_customer_measurements
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for oms_products
CREATE POLICY "Everyone can read products"
  ON oms_products
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON oms_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for oms_orders
CREATE POLICY "Staff can read orders from their store"
  ON oms_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users u
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'admin' OR u.store_id = oms_orders.store_id)
    )
  );

CREATE POLICY "Staff can create orders"
  ON oms_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM oms_users u
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'admin' OR u.store_id = store_id)
    )
  );

CREATE POLICY "Staff can update orders from their store"
  ON oms_orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users u
      WHERE u.id::text = auth.uid()::text
      AND (u.role = 'admin' OR u.store_id = oms_orders.store_id)
    )
  );

-- Public access for order tracking
CREATE POLICY "Public can read orders for tracking"
  ON oms_orders
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for oms_order_items
CREATE POLICY "Staff can manage order items"
  ON oms_order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_orders o
      JOIN oms_users u ON (u.role = 'admin' OR u.store_id = o.store_id)
      WHERE o.id = oms_order_items.order_id
      AND u.id::text = auth.uid()::text
    )
  );

-- Public access for order tracking
CREATE POLICY "Public can read order items for tracking"
  ON oms_order_items
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for oms_order_status_history
CREATE POLICY "Staff can read status history"
  ON oms_order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_orders o
      JOIN oms_users u ON (u.role = 'admin' OR u.store_id = o.store_id)
      WHERE o.id = oms_order_status_history.order_id
      AND u.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Staff can create status history"
  ON oms_order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM oms_orders o
      JOIN oms_users u ON (u.role = 'admin' OR u.store_id = o.store_id)
      WHERE o.id = order_id
      AND u.id::text = auth.uid()::text
    )
  );

-- Public access for order tracking
CREATE POLICY "Public can read status history for tracking"
  ON oms_order_status_history
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for oms_notifications
CREATE POLICY "Staff can read notifications"
  ON oms_notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create notifications"
  ON oms_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON oms_notifications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oms_users_updated_at
  BEFORE UPDATE ON oms_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_stores_updated_at
  BEFORE UPDATE ON oms_stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_customers_updated_at
  BEFORE UPDATE ON oms_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_customer_measurements_updated_at
  BEFORE UPDATE ON oms_customer_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_products_updated_at
  BEFORE UPDATE ON oms_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_orders_updated_at
  BEFORE UPDATE ON oms_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_order_items_updated_at
  BEFORE UPDATE ON oms_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper Functions

-- Function to generate customer ID
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  new_id text;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::text;
  
  -- Get next sequence number for the year
  SELECT LPAD((
    COALESCE(
      MAX(CAST(SUBSTRING(id FROM 'CUST-\d{4}-(\d{5})') AS INTEGER)), 
      0
    ) + 1
  )::text, 5, '0')
  INTO sequence_part
  FROM oms_customers
  WHERE id LIKE 'CUST-' || year_part || '-%';
  
  new_id := 'CUST-' || year_part || '-' || sequence_part;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order ID
CREATE OR REPLACE FUNCTION generate_order_id(store_code text)
RETURNS text AS $$
DECLARE
  date_part text;
  sequence_part text;
  new_id text;
BEGIN
  date_part := TO_CHAR(now(), 'YYYYMMDD');
  
  -- Get next sequence number for the store and date
  SELECT LPAD((
    COALESCE(
      MAX(CAST(SUBSTRING(id FROM store_code || '-\d{8}-(\d{3})') AS INTEGER)), 
      0
    ) + 1
  )::text, 3, '0')
  INTO sequence_part
  FROM oms_orders
  WHERE id LIKE 'ORD-' || store_code || '-' || date_part || '-%';
  
  new_id := 'ORD-' || store_code || '-' || date_part || '-' || sequence_part;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate delivery date
CREATE OR REPLACE FUNCTION calculate_delivery_date(
  order_type order_type,
  priority priority_level
)
RETURNS timestamptz AS $$
DECLARE
  base_days integer;
  priority_multiplier numeric;
  delivery_date timestamptz;
BEGIN
  -- Set base days based on order type
  CASE order_type
    WHEN 'alterations' THEN base_days := 3;
    WHEN 'new_stitching' THEN base_days := 14;
    ELSE base_days := 7;
  END CASE;
  
  -- Adjust based on priority
  CASE priority
    WHEN 'urgent' THEN priority_multiplier := 0.5;
    WHEN 'high' THEN priority_multiplier := 0.7;
    WHEN 'medium' THEN priority_multiplier := 1.0;
    WHEN 'low' THEN priority_multiplier := 1.5;
    ELSE priority_multiplier := 1.0;
  END CASE;
  
  delivery_date := now() + (base_days * priority_multiplier || ' days')::interval;
  
  RETURN delivery_date;
END;
$$ LANGUAGE plpgsql;

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order total when order items change
  UPDATE oms_orders
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM oms_order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ),
  balance_amount = total_amount - advance_paid
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order totals
CREATE TRIGGER update_order_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON oms_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_totals();

-- Function to create status history entry
CREATE OR REPLACE FUNCTION create_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history entry if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO oms_order_status_history (
      order_id,
      status,
      notes,
      updated_by,
      updated_by_name
    ) VALUES (
      NEW.id,
      NEW.status,
      'Status updated to ' || NEW.status,
      NEW.assigned_to,
      COALESCE(
        (SELECT username FROM oms_users WHERE id = NEW.assigned_to),
        'System'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create status history
CREATE TRIGGER create_status_history_trigger
  AFTER UPDATE ON oms_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_status_history();