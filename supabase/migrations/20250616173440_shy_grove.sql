/*
  # Create stitching partnerships table

  1. New Tables
    - `stitching_partnerships`
      - `id` (uuid, primary key)
      - `unit_name` (text)
      - `owner_name` (text)
      - `email` (text)
      - `phone` (text)
      - `unit_address` (text)
      - `city` (text)
      - `state` (text)
      - `established_year` (integer)
      - `total_workers` (text)
      - `machine_capacity` (text)
      - `monthly_capacity` (text)
      - `specializations` (text)
      - `quality_certifications` (text, optional)
      - `current_clients` (text, optional)
      - `average_order_value` (text, optional)
      - `payment_terms` (text)
      - `working_hours` (text)
      - `quality_control_process` (text)
      - `sample_capability` (text)
      - `business_references` (text, optional)
      - `submission_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `stitching_partnerships` table
    - Add policy for anonymous users to insert applications
    - Add policy for authenticated users to read all applications
    - Add policy for authenticated users to update applications
*/

CREATE TABLE IF NOT EXISTS stitching_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  unit_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  established_year integer NOT NULL,
  total_workers text NOT NULL,
  machine_capacity text NOT NULL,
  monthly_capacity text NOT NULL,
  specializations text NOT NULL,
  quality_certifications text,
  current_clients text,
  average_order_value text,
  payment_terms text NOT NULL,
  working_hours text NOT NULL,
  quality_control_process text NOT NULL,
  sample_capability text NOT NULL,
  business_references text,
  submission_date timestamptz DEFAULT now(),
  status text DEFAULT 'New',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stitching_partnerships ENABLE ROW LEVEL SECURITY;

-- Policy for public users to insert stitching partnership applications
CREATE POLICY "Anyone can insert stitching partnerships"
  ON stitching_partnerships
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated users (admin) to read all stitching partnerships
CREATE POLICY "Authenticated users can read all stitching partnerships"
  ON stitching_partnerships
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users (admin) to update stitching partnerships
CREATE POLICY "Authenticated users can update stitching partnerships"
  ON stitching_partnerships
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_stitching_partnerships_updated_at
  BEFORE UPDATE ON stitching_partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();