/*
  # Add Order Measurements and Make Store Optional

  1. Schema Updates
    - Modify oms_orders table to make store_id nullable
    - Create new order_measurements table for detailed measurements
    - Add user store preferences

  2. New Tables
    - `order_measurements` - Store detailed measurements for orders
      - `id` (uuid, primary key)
      - `order_id` (text, references oms_orders)
      - `unit` (measurement_unit)
      - Various measurement fields for top and bottom
      - `custom_measurements` (jsonb for flexible additional measurements)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Table Modifications
    - Make store_id nullable in oms_orders
    - Add default_store_id to oms_users

  4. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Make store_id nullable in oms_orders
ALTER TABLE oms_orders ALTER COLUMN store_id DROP NOT NULL;

-- Add default_store_id to oms_users
ALTER TABLE oms_users ADD COLUMN default_store_id uuid REFERENCES oms_stores(id);

-- Create order_measurements table
CREATE TABLE IF NOT EXISTS order_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES oms_orders(id) ON DELETE CASCADE,
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
  
  -- Additional flexible measurements
  custom_measurements jsonb,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_measurements_order_id ON order_measurements(order_id);

-- Enable RLS on order_measurements
ALTER TABLE order_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for order_measurements
CREATE POLICY "Anyone can manage order measurements"
  ON order_measurements
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_order_measurements_updated_at
  BEFORE UPDATE ON order_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing users with default store
UPDATE oms_users
SET default_store_id = (
  SELECT id FROM oms_stores 
  WHERE code = 'KCH' 
  LIMIT 1
)
WHERE role = 'sales_staff' AND store_id IS NOT NULL;

-- Function to get measurements for an order
CREATE OR REPLACE FUNCTION get_order_measurements(order_id_param text)
RETURNS TABLE(
  id uuid,
  order_id text,
  unit measurement_unit,
  top_measurements jsonb,
  bottom_measurements jsonb,
  custom_measurements jsonb,
  notes text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.order_id,
    m.unit,
    jsonb_build_object(
      'FL', m.top_fl,
      'SH', m.top_sh,
      'SL', m.top_sl,
      'SR', m.top_sr,
      'MR', m.top_mr,
      'AH', m.top_ah,
      'CH', m.top_ch,
      'BR', m.top_br,
      'WR', m.top_wr,
      'HIP', m.top_hip,
      'SLIT', m.top_slit,
      'FN', m.top_fn,
      'BN', m.top_bn,
      'DP', m.top_dp,
      'PP', m.top_pp
    ) as top_measurements,
    jsonb_build_object(
      'FL', m.bottom_fl,
      'WR', m.bottom_wr,
      'SR', m.bottom_sr,
      'TR', m.bottom_tr,
      'LR', m.bottom_lr,
      'AR', m.bottom_ar
    ) as bottom_measurements,
    m.custom_measurements,
    m.notes,
    m.created_at
  FROM order_measurements m
  WHERE m.order_id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Update order_summary view to include store information as optional
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
LEFT JOIN oms_stores s ON o.store_id = s.id
LEFT JOIN oms_users u ON o.assigned_to = u.id;