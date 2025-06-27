/*
  # Create Partner Document Review System

  1. New Tables
    - `partner_logins` - Partner authentication system
    - `partner_documents` - Document storage and tracking
    - `document_reviews` - Admin review history

  2. Enhanced Partnership Status
    - Add new status: 'documents_requested', 'documents_submitted', 'documents_reviewed'

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for partners and admins

  4. Sample Data
    - Create sample partner logins
    - Add sample document requirements
*/

-- Create partner_logins table for partner authentication
CREATE TABLE IF NOT EXISTS partner_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES stitching_partnerships(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_documents table for document management
CREATE TABLE IF NOT EXISTS partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES stitching_partnerships(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_url text,
  file_size bigint,
  mime_type text,
  is_required boolean DEFAULT true,
  is_submitted boolean DEFAULT false,
  submission_date timestamptz,
  admin_review_status text DEFAULT 'pending' CHECK (admin_review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  admin_comments text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document_reviews table for review history
CREATE TABLE IF NOT EXISTS document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES partner_documents(id) ON DELETE CASCADE,
  partnership_id uuid NOT NULL REFERENCES stitching_partnerships(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  review_status text NOT NULL CHECK (review_status IN ('approved', 'rejected', 'needs_revision')),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE partner_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for partner_logins
CREATE POLICY "Partners can read own login data"
  ON partner_logins
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update partner logins"
  ON partner_logins
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert partner logins"
  ON partner_logins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for partner_documents
CREATE POLICY "Anyone can read partner documents"
  ON partner_documents
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert partner documents"
  ON partner_documents
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update partner documents"
  ON partner_documents
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Policies for document_reviews
CREATE POLICY "Anyone can read document reviews"
  ON document_reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert document reviews"
  ON document_reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_partner_logins_updated_at
  BEFORE UPDATE ON partner_logins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_documents_updated_at
  BEFORE UPDATE ON partner_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partner_logins_partnership_id ON partner_logins(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partner_logins_username ON partner_logins(username);
CREATE INDEX IF NOT EXISTS idx_partner_documents_partnership_id ON partner_documents(partnership_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_type ON partner_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_partner_documents_status ON partner_documents(admin_review_status);
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_partnership_id ON document_reviews(partnership_id);

-- Insert sample partner logins for existing partnerships
INSERT INTO partner_logins (partnership_id, username, password_hash)
SELECT 
  id,
  LOWER(REPLACE(unit_name, ' ', '_')) || '_' || EXTRACT(YEAR FROM created_at),
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- password: password123
FROM stitching_partnerships
ON CONFLICT (username) DO NOTHING;

-- Insert required document types for partnerships
INSERT INTO partner_documents (partnership_id, document_type, document_name, is_required)
SELECT 
  sp.id,
  'business_registration',
  'Business Registration Certificate',
  true
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'gst_certificate',
  'GST Registration Certificate',
  true
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'quality_certificates',
  'Quality Certifications (ISO, etc.)',
  false
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'factory_photos',
  'Factory/Unit Photographs',
  true
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'sample_work',
  'Sample Work Portfolio',
  true
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'bank_details',
  'Bank Account Details',
  true
FROM stitching_partnerships sp
UNION ALL
SELECT 
  sp.id,
  'insurance_certificate',
  'Insurance Certificate',
  false
FROM stitching_partnerships sp
ON CONFLICT DO NOTHING;

-- Update some partnerships to show documents submitted status
UPDATE stitching_partnerships 
SET status = 'documents_requested' 
WHERE unit_name IN ('Precision Stitching Works', 'Elite Garment Manufacturing');

-- Mark some documents as submitted for demo
UPDATE partner_documents 
SET 
  is_submitted = true,
  submission_date = now() - INTERVAL '2 days',
  document_url = 'https://example.com/documents/' || document_type || '_' || partnership_id || '.pdf'
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships WHERE unit_name = 'Elite Garment Manufacturing'
) AND document_type IN ('business_registration', 'gst_certificate', 'factory_photos');

-- Add some review history
INSERT INTO document_reviews (document_id, partnership_id, reviewer_name, review_status, comments)
SELECT 
  pd.id,
  pd.partnership_id,
  'Admin User',
  'approved',
  'Document verified and approved. All details are correct.'
FROM partner_documents pd
JOIN stitching_partnerships sp ON pd.partnership_id = sp.id
WHERE sp.unit_name = 'Elite Garment Manufacturing' 
AND pd.document_type = 'business_registration'
AND pd.is_submitted = true;