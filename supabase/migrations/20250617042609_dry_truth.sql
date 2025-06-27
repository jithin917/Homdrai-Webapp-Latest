/*
  # Add notes and follow-up functionality

  1. New Tables
    - `inquiry_notes` - Store communication logs and notes for both bulk orders and partnerships
    - `follow_ups` - Store follow-up reminders and notifications

  2. Table Structure
    - inquiry_notes:
      - id (uuid, primary key)
      - inquiry_id (uuid, references bulk_order_inquiries or stitching_partnerships)
      - inquiry_type (text, 'bulk_order' or 'partnership')
      - communication_log (text)
      - special_requirements (text)
      - invoice_details (text)
      - order_copy (text)
      - priority_level (text, default 'medium')
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - follow_ups:
      - id (uuid, primary key)
      - inquiry_id (uuid)
      - inquiry_type (text)
      - follow_up_date (timestamptz)
      - title (text)
      - description (text)
      - status (text, default 'pending')
      - created_at (timestamptz)
      - updated_at (timestamptz)

  3. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create inquiry_notes table
CREATE TABLE IF NOT EXISTS inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('bulk_order', 'partnership')),
  communication_log text DEFAULT '',
  special_requirements text DEFAULT '',
  invoice_details text DEFAULT '',
  order_copy text DEFAULT '',
  priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('bulk_order', 'partnership')),
  follow_up_date timestamptz NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Policies for inquiry_notes
CREATE POLICY "Anyone can read inquiry notes"
  ON inquiry_notes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert inquiry notes"
  ON inquiry_notes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update inquiry notes"
  ON inquiry_notes
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Policies for follow_ups
CREATE POLICY "Anyone can read follow ups"
  ON follow_ups
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert follow ups"
  ON follow_ups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update follow ups"
  ON follow_ups
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_inquiry_notes_updated_at
  BEFORE UPDATE ON inquiry_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
  BEFORE UPDATE ON follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_id ON inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_type ON inquiry_notes(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_follow_ups_inquiry_id ON follow_ups(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_follow_up_date ON follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);

-- Insert sample notes for existing data
INSERT INTO inquiry_notes (inquiry_id, inquiry_type, communication_log, special_requirements, priority_level)
SELECT 
  id,
  'bulk_order',
  'Initial inquiry received through website form. Customer interested in bulk orders for retail chain.',
  'Premium quality required for high-end retail stores. Need consistent supply chain.',
  'high'
FROM bulk_order_inquiries 
WHERE company_name = 'Fashion Forward Pvt Ltd'
ON CONFLICT DO NOTHING;

INSERT INTO inquiry_notes (inquiry_id, inquiry_type, communication_log, special_requirements, priority_level)
SELECT 
  id,
  'partnership',
  'Partnership application received. Unit has good capacity and experience.',
  'Specializes in traditional wear. Good for our bridal collection orders.',
  'medium'
FROM stitching_partnerships 
WHERE unit_name = 'Precision Stitching Works'
ON CONFLICT DO NOTHING;

-- Insert sample follow-ups for today and tomorrow
INSERT INTO follow_ups (inquiry_id, inquiry_type, follow_up_date, title, description)
SELECT 
  id,
  'bulk_order',
  CURRENT_DATE + INTERVAL '1 hour',
  'Follow up on pricing discussion',
  'Customer requested detailed pricing for 500-piece monthly orders. Need to send quotation.'
FROM bulk_order_inquiries 
WHERE company_name = 'Fashion Forward Pvt Ltd'
ON CONFLICT DO NOTHING;

INSERT INTO follow_ups (inquiry_id, inquiry_type, follow_up_date, title, description)
SELECT 
  id,
  'bulk_order',
  CURRENT_DATE + INTERVAL '1 day',
  'Schedule factory visit',
  'Customer wants to visit our facility before finalizing the partnership.'
FROM bulk_order_inquiries 
WHERE company_name = 'Global Textiles Export House'
ON CONFLICT DO NOTHING;

INSERT INTO follow_ups (inquiry_id, inquiry_type, follow_up_date, title, description)
SELECT 
  id,
  'partnership',
  CURRENT_DATE + INTERVAL '2 hours',
  'Review partnership terms',
  'Discuss payment terms and monthly capacity commitments.'
FROM stitching_partnerships 
WHERE unit_name = 'Elite Garment Manufacturing'
ON CONFLICT DO NOTHING;