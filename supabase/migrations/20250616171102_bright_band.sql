/*
  # Create bulk order inquiries table

  1. New Tables
    - `bulk_order_inquiries`
      - `id` (uuid, primary key)
      - `company_name` (text, required)
      - `contact_person` (text, required)
      - `designation` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `company_address` (text, required)
      - `city` (text, required)
      - `state` (text, required)
      - `country` (text, required)
      - `website` (text, optional)
      - `business_type` (text, required)
      - `product_category` (text, required)
      - `order_quantity` (text, required)
      - `order_frequency` (text, required)
      - `target_price` (text, optional)
      - `quality_requirements` (text, required)
      - `delivery_timeline` (text, required)
      - `packaging_requirements` (text, optional)
      - `certification_needs` (text, optional)
      - `additional_requirements` (text, optional)
      - `submission_date` (timestamptz, default now)
      - `status` (text, default 'New')
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `bulk_order_inquiries` table
    - Add policy for authenticated users to read all data
    - Add policy for public users to insert data
*/

CREATE TABLE IF NOT EXISTS bulk_order_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  designation text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL,
  website text,
  business_type text NOT NULL,
  product_category text NOT NULL,
  order_quantity text NOT NULL,
  order_frequency text NOT NULL,
  target_price text,
  quality_requirements text NOT NULL,
  delivery_timeline text NOT NULL,
  packaging_requirements text,
  certification_needs text,
  additional_requirements text,
  submission_date timestamptz DEFAULT now(),
  status text DEFAULT 'New',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bulk_order_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy for public users to insert bulk order inquiries
CREATE POLICY "Anyone can insert bulk order inquiries"
  ON bulk_order_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated users (admin) to read all bulk order inquiries
CREATE POLICY "Authenticated users can read all bulk order inquiries"
  ON bulk_order_inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users (admin) to update bulk order inquiries
CREATE POLICY "Authenticated users can update bulk order inquiries"
  ON bulk_order_inquiries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bulk_order_inquiries_updated_at
  BEFORE UPDATE ON bulk_order_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();