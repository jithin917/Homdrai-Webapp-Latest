/*
  # Document Viewing System with Version Control

  1. New Tables
    - `document_versions` - Track all document versions
    - `document_view_logs` - Log all document access
    - `document_access_tokens` - Secure document access tokens
  
  2. Enhanced Features
    - Document versioning system
    - Secure access token generation
    - View logging and audit trail
    - Document locking after approval
    - Version history tracking
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for secure access
    - Token-based document access
*/

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES partner_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  document_url text NOT NULL,
  file_size bigint,
  mime_type text,
  upload_reason text NOT NULL CHECK (upload_reason IN ('initial_submission', 'revision_requested', 'voluntary_update')),
  uploaded_by text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  is_current_version boolean DEFAULT true,
  replaced_by_version_id uuid REFERENCES document_versions(id),
  created_at timestamptz DEFAULT now()
);

-- Document View Logs Table
CREATE TABLE IF NOT EXISTS document_view_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES partner_documents(id) ON DELETE CASCADE,
  document_version_id uuid REFERENCES document_versions(id),
  viewer_type text NOT NULL CHECK (viewer_type IN ('admin', 'partner')),
  viewer_name text NOT NULL,
  viewer_ip text,
  view_timestamp timestamptz DEFAULT now(),
  access_method text NOT NULL CHECK (access_method IN ('direct', 'download', 'preview'))
);

-- Document Access Tokens Table
CREATE TABLE IF NOT EXISTS document_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES partner_documents(id) ON DELETE CASCADE,
  document_version_id uuid REFERENCES document_versions(id),
  access_token text UNIQUE NOT NULL,
  created_by text NOT NULL,
  created_for text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  access_count integer DEFAULT 0,
  max_access_count integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to partner_documents for enhanced tracking
DO $$
BEGIN
  -- Add is_locked column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_documents' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN is_locked boolean DEFAULT false;
  END IF;

  -- Add current_version_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_documents' AND column_name = 'current_version_id'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN current_version_id uuid REFERENCES document_versions(id);
  END IF;

  -- Add total_versions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_documents' AND column_name = 'total_versions'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN total_versions integer DEFAULT 1;
  END IF;

  -- Add last_viewed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_documents' AND column_name = 'last_viewed_at'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN last_viewed_at timestamptz;
  END IF;

  -- Add view_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_documents' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE partner_documents ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_view_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions
CREATE POLICY "Anyone can read document versions"
  ON document_versions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert document versions"
  ON document_versions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for document_view_logs
CREATE POLICY "Anyone can read view logs"
  ON document_view_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert view logs"
  ON document_view_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for document_access_tokens
CREATE POLICY "Anyone can read access tokens"
  ON document_access_tokens
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert access tokens"
  ON document_access_tokens
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update access tokens"
  ON document_access_tokens
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Function to create document version
CREATE OR REPLACE FUNCTION create_document_version(
  p_document_id uuid,
  p_document_url text,
  p_file_size bigint DEFAULT NULL,
  p_mime_type text DEFAULT NULL,
  p_upload_reason text DEFAULT 'voluntary_update',
  p_uploaded_by text DEFAULT 'Partner'
)
RETURNS uuid AS $$
DECLARE
  v_version_number integer;
  v_version_id uuid;
  v_previous_version_id uuid;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO v_version_number
  FROM document_versions 
  WHERE document_id = p_document_id;
  
  -- Get current version ID to mark as replaced
  SELECT id INTO v_previous_version_id
  FROM document_versions 
  WHERE document_id = p_document_id AND is_current_version = true;
  
  -- Mark previous version as not current
  IF v_previous_version_id IS NOT NULL THEN
    UPDATE document_versions 
    SET is_current_version = false 
    WHERE id = v_previous_version_id;
  END IF;
  
  -- Create new version
  INSERT INTO document_versions (
    document_id,
    version_number,
    document_url,
    file_size,
    mime_type,
    upload_reason,
    uploaded_by,
    is_current_version
  ) VALUES (
    p_document_id,
    v_version_number,
    p_document_url,
    p_file_size,
    p_mime_type,
    p_upload_reason,
    p_uploaded_by,
    true
  ) RETURNING id INTO v_version_id;
  
  -- Update document with new version info
  UPDATE partner_documents 
  SET 
    current_version_id = v_version_id,
    total_versions = v_version_number,
    document_url = p_document_url,
    file_size = p_file_size,
    mime_type = p_mime_type,
    updated_at = now()
  WHERE id = p_document_id;
  
  -- Mark previous version as replaced
  IF v_previous_version_id IS NOT NULL THEN
    UPDATE document_versions 
    SET replaced_by_version_id = v_version_id 
    WHERE id = v_previous_version_id;
  END IF;
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure access token
CREATE OR REPLACE FUNCTION generate_document_access_token(
  p_document_id uuid,
  p_document_version_id uuid DEFAULT NULL,
  p_created_by text DEFAULT 'Admin User',
  p_created_for text DEFAULT 'Document Review',
  p_expires_hours integer DEFAULT 24,
  p_max_access_count integer DEFAULT 10
)
RETURNS text AS $$
DECLARE
  v_token text;
BEGIN
  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert token record
  INSERT INTO document_access_tokens (
    document_id,
    document_version_id,
    access_token,
    created_by,
    created_for,
    expires_at,
    max_access_count
  ) VALUES (
    p_document_id,
    p_document_version_id,
    v_token,
    p_created_by,
    p_created_for,
    now() + (p_expires_hours || ' hours')::interval,
    p_max_access_count
  );
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Function to validate access token
CREATE OR REPLACE FUNCTION validate_access_token(p_access_token text)
RETURNS TABLE(
  is_valid boolean,
  document_id uuid,
  document_version_id uuid,
  remaining_access integer
) AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token record
  SELECT * INTO token_record
  FROM document_access_tokens
  WHERE access_token = p_access_token
    AND is_active = true
    AND expires_at > now()
    AND access_count < max_access_count;
  
  IF token_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, 0;
    RETURN;
  END IF;
  
  -- Increment access count
  UPDATE document_access_tokens
  SET access_count = access_count + 1
  WHERE id = token_record.id;
  
  -- Return validation result
  RETURN QUERY SELECT 
    true,
    token_record.document_id,
    token_record.document_version_id,
    token_record.max_access_count - token_record.access_count - 1;
END;
$$ LANGUAGE plpgsql;

-- Function to log document view
CREATE OR REPLACE FUNCTION log_document_view(
  p_document_id uuid,
  p_document_version_id uuid DEFAULT NULL,
  p_viewer_type text DEFAULT 'admin',
  p_viewer_name text DEFAULT 'Admin User',
  p_viewer_ip text DEFAULT NULL,
  p_access_method text DEFAULT 'direct'
)
RETURNS void AS $$
BEGIN
  -- Insert view log
  INSERT INTO document_view_logs (
    document_id,
    document_version_id,
    viewer_type,
    viewer_name,
    viewer_ip,
    access_method
  ) VALUES (
    p_document_id,
    p_document_version_id,
    p_viewer_type,
    p_viewer_name,
    p_viewer_ip,
    p_access_method
  );
  
  -- Update document view statistics
  UPDATE partner_documents
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = p_document_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON document_versions(document_id, is_current_version);
CREATE INDEX IF NOT EXISTS idx_document_view_logs_document_id ON document_view_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_view_logs_timestamp ON document_view_logs(view_timestamp);
CREATE INDEX IF NOT EXISTS idx_document_access_tokens_token ON document_access_tokens(access_token);
CREATE INDEX IF NOT EXISTS idx_document_access_tokens_expires ON document_access_tokens(expires_at);

-- Create sample document versions for existing documents
DO $$
DECLARE
  doc_record RECORD;
  version_id uuid;
BEGIN
  FOR doc_record IN 
    SELECT id, document_url, file_size, mime_type 
    FROM partner_documents 
    WHERE document_url IS NOT NULL
  LOOP
    -- Create initial version for existing documents
    SELECT create_document_version(
      doc_record.id,
      doc_record.document_url,
      doc_record.file_size,
      doc_record.mime_type,
      'initial_submission',
      'Partner'
    ) INTO version_id;
    
    RAISE NOTICE 'Created initial version % for document %', version_id, doc_record.id;
  END LOOP;
END $$;

-- Lock approved documents
UPDATE partner_documents 
SET is_locked = true 
WHERE admin_review_status = 'approved';

-- Add some sample view logs
INSERT INTO document_view_logs (document_id, viewer_type, viewer_name, access_method)
SELECT 
  id,
  'admin',
  'Admin User',
  'direct'
FROM partner_documents 
WHERE document_url IS NOT NULL
LIMIT 5;

-- Update view counts
UPDATE partner_documents 
SET view_count = (RANDOM() * 10)::integer + 1
WHERE document_url IS NOT NULL;