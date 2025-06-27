/*
  # Document Review System Enhancement

  1. Tables Enhancement
    - Ensure all document-related tables exist with proper structure
    - Add missing indexes and constraints
    - Create sample document data for testing

  2. New Features
    - Document review workflow
    - Review history tracking
    - Status management
    - Admin review interface support

  3. Sample Data
    - Create sample documents for existing partnerships
    - Add review history examples
    - Set up different document statuses for testing
*/

-- Ensure partner_documents table has all required columns
DO $$
BEGIN
  -- Add any missing columns to partner_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN document_type text NOT NULL DEFAULT 'general';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'document_name'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN document_name text NOT NULL DEFAULT 'Document';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'document_url'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN document_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN mime_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'is_required'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN is_required boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'is_submitted'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN is_submitted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'submission_date'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN submission_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'admin_review_status'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN admin_review_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'admin_comments'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN admin_comments text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN reviewed_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_documents' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- Add constraint for admin_review_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'partner_documents_admin_review_status_check'
  ) THEN
    ALTER TABLE partner_documents 
    ADD CONSTRAINT partner_documents_admin_review_status_check 
    CHECK (admin_review_status IN ('pending', 'approved', 'rejected', 'needs_revision'));
  END IF;
END $$;

-- Ensure document_reviews table exists
CREATE TABLE IF NOT EXISTS document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES partner_documents(id) ON DELETE CASCADE,
  partnership_id uuid NOT NULL REFERENCES stitching_partnerships(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  review_status text NOT NULL CHECK (review_status IN ('approved', 'rejected', 'needs_revision')),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on document_reviews if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'document_reviews' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for document_reviews if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'document_reviews' 
    AND policyname = 'Anyone can read document reviews'
  ) THEN
    CREATE POLICY "Anyone can read document reviews"
      ON document_reviews
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'document_reviews' 
    AND policyname = 'Anyone can insert document reviews'
  ) THEN
    CREATE POLICY "Anyone can insert document reviews"
      ON document_reviews
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_partnership_id ON document_reviews(partnership_id);

-- Insert required document types for all partnerships that don't have them
INSERT INTO partner_documents (partnership_id, document_type, document_name, is_required)
SELECT DISTINCT
  sp.id,
  'business_registration',
  'Business Registration Certificate',
  true
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'business_registration'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'gst_certificate',
  'GST Registration Certificate',
  true
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'gst_certificate'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'quality_certificates',
  'Quality Certifications (ISO, etc.)',
  false
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'quality_certificates'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'factory_photos',
  'Factory/Unit Photographs',
  true
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'factory_photos'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'sample_work',
  'Sample Work Portfolio',
  true
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'sample_work'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'bank_details',
  'Bank Account Details',
  true
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'bank_details'
)
UNION ALL
SELECT DISTINCT
  sp.id,
  'insurance_certificate',
  'Insurance Certificate',
  false
FROM stitching_partnerships sp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_documents pd 
  WHERE pd.partnership_id = sp.id 
  AND pd.document_type = 'insurance_certificate'
);

-- Mark some documents as submitted for demo purposes
UPDATE partner_documents 
SET 
  is_submitted = true,
  submission_date = now() - INTERVAL '3 days',
  document_url = 'https://example.com/documents/' || document_type || '_' || partnership_id || '.pdf',
  file_size = 1024000 + (RANDOM() * 2048000)::bigint,
  mime_type = 'application/pdf',
  admin_review_status = 'pending'
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships WHERE unit_name = 'Elite Garment Manufacturing'
) AND document_type IN ('business_registration', 'gst_certificate', 'factory_photos', 'sample_work');

-- Mark some documents as submitted for Precision Stitching Works
UPDATE partner_documents 
SET 
  is_submitted = true,
  submission_date = now() - INTERVAL '1 day',
  document_url = 'https://example.com/documents/' || document_type || '_' || partnership_id || '.pdf',
  file_size = 512000 + (RANDOM() * 1024000)::bigint,
  mime_type = 'application/pdf',
  admin_review_status = 'pending'
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships WHERE unit_name = 'Precision Stitching Works'
) AND document_type IN ('business_registration', 'factory_photos');

-- Add some approved documents
UPDATE partner_documents 
SET 
  admin_review_status = 'approved',
  admin_comments = 'Document verified and approved. All details are correct and meet our requirements.',
  reviewed_by = 'Admin User',
  reviewed_at = now() - INTERVAL '1 day'
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships WHERE unit_name = 'Elite Garment Manufacturing'
) AND document_type = 'business_registration';

-- Add some documents that need revision
UPDATE partner_documents 
SET 
  admin_review_status = 'needs_revision',
  admin_comments = 'Please provide a clearer image of the certificate. The current image is blurry and some text is not readable.',
  reviewed_by = 'Admin User',
  reviewed_at = now() - INTERVAL '2 hours'
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships WHERE unit_name = 'Elite Garment Manufacturing'
) AND document_type = 'gst_certificate';

-- Add review history for approved documents
INSERT INTO document_reviews (document_id, partnership_id, reviewer_name, review_status, comments)
SELECT 
  pd.id,
  pd.partnership_id,
  'Admin User',
  'approved',
  'Document verified and approved. All details are correct and meet our requirements.'
FROM partner_documents pd
JOIN stitching_partnerships sp ON pd.partnership_id = sp.id
WHERE sp.unit_name = 'Elite Garment Manufacturing' 
AND pd.document_type = 'business_registration'
AND pd.admin_review_status = 'approved'
ON CONFLICT DO NOTHING;

-- Add review history for documents needing revision
INSERT INTO document_reviews (document_id, partnership_id, reviewer_name, review_status, comments)
SELECT 
  pd.id,
  pd.partnership_id,
  'Admin User',
  'needs_revision',
  'Please provide a clearer image of the certificate. The current image is blurry and some text is not readable.'
FROM partner_documents pd
JOIN stitching_partnerships sp ON pd.partnership_id = sp.id
WHERE sp.unit_name = 'Elite Garment Manufacturing' 
AND pd.document_type = 'gst_certificate'
AND pd.admin_review_status = 'needs_revision'
ON CONFLICT DO NOTHING;

-- Update partnership statuses based on document submission
UPDATE stitching_partnerships 
SET status = 'documents_submitted'
WHERE id IN (
  SELECT DISTINCT partnership_id 
  FROM partner_documents 
  WHERE is_submitted = true
  GROUP BY partnership_id
  HAVING COUNT(*) >= 3  -- At least 3 documents submitted
);

-- Create a function to get document review summary
CREATE OR REPLACE FUNCTION get_partnership_document_summary(partnership_id_param uuid)
RETURNS TABLE(
  total_documents bigint,
  required_documents bigint,
  submitted_documents bigint,
  approved_documents bigint,
  pending_documents bigint,
  revision_needed bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE is_required = true) as required_documents,
    COUNT(*) FILTER (WHERE is_submitted = true) as submitted_documents,
    COUNT(*) FILTER (WHERE admin_review_status = 'approved') as approved_documents,
    COUNT(*) FILTER (WHERE admin_review_status = 'pending') as pending_documents,
    COUNT(*) FILTER (WHERE admin_review_status = 'needs_revision') as revision_needed
  FROM partner_documents
  WHERE partnership_id = partnership_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add some sample data to show different document statuses
DO $$
DECLARE
  precision_partnership_id uuid;
  elite_partnership_id uuid;
BEGIN
  -- Get partnership IDs
  SELECT id INTO precision_partnership_id FROM stitching_partnerships WHERE unit_name = 'Precision Stitching Works';
  SELECT id INTO elite_partnership_id FROM stitching_partnerships WHERE unit_name = 'Elite Garment Manufacturing';
  
  -- Add a rejected document for demonstration
  IF elite_partnership_id IS NOT NULL THEN
    UPDATE partner_documents 
    SET 
      admin_review_status = 'rejected',
      admin_comments = 'This document appears to be expired. Please submit a current version dated within the last 12 months.',
      reviewed_by = 'Senior Admin',
      reviewed_at = now() - INTERVAL '6 hours'
    WHERE partnership_id = elite_partnership_id 
    AND document_type = 'insurance_certificate'
    AND is_submitted = false;
    
    -- Mark it as submitted first
    UPDATE partner_documents 
    SET 
      is_submitted = true,
      submission_date = now() - INTERVAL '1 day',
      document_url = 'https://example.com/documents/insurance_certificate_' || elite_partnership_id || '.pdf',
      file_size = 256000,
      mime_type = 'application/pdf'
    WHERE partnership_id = elite_partnership_id 
    AND document_type = 'insurance_certificate';
    
    -- Add review history for rejected document
    INSERT INTO document_reviews (document_id, partnership_id, reviewer_name, review_status, comments)
    SELECT 
      pd.id,
      pd.partnership_id,
      'Senior Admin',
      'rejected',
      'This document appears to be expired. Please submit a current version dated within the last 12 months.'
    FROM partner_documents pd
    WHERE pd.partnership_id = elite_partnership_id 
    AND pd.document_type = 'insurance_certificate'
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Final status update based on document review completion
UPDATE stitching_partnerships 
SET status = 'documents_approved'
WHERE id IN (
  SELECT partnership_id 
  FROM partner_documents 
  WHERE is_required = true
  GROUP BY partnership_id
  HAVING COUNT(*) = COUNT(*) FILTER (WHERE admin_review_status = 'approved')
  AND COUNT(*) > 0
);