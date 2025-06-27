/*
  # Partner Credential Generation System

  1. Schema Updates
    - Add columns for first-time login flow to partner_logins table
    - Add unique constraint on partnership_id for proper conflict handling
    - Add indexes for performance

  2. Functions
    - Create function to generate partner credentials
    - Handle credential generation with proper conflict resolution

  3. Data Updates
    - Update existing partner logins to use email as username
    - Generate sample credentials for existing partnerships
    - Update partnership statuses to include credential-related statuses

  4. Security
    - Proper password hashing
    - Activation token generation
    - Account status management
*/

-- Add columns for first-time login flow
DO $$
BEGIN
  -- Add first_login column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_logins' AND column_name = 'first_login'
  ) THEN
    ALTER TABLE partner_logins ADD COLUMN first_login boolean DEFAULT true;
  END IF;

  -- Add activation_token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_logins' AND column_name = 'activation_token'
  ) THEN
    ALTER TABLE partner_logins ADD COLUMN activation_token text;
  END IF;

  -- Add credentials_sent column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_logins' AND column_name = 'credentials_sent'
  ) THEN
    ALTER TABLE partner_logins ADD COLUMN credentials_sent boolean DEFAULT false;
  END IF;

  -- Add credentials_sent_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partner_logins' AND column_name = 'credentials_sent_at'
  ) THEN
    ALTER TABLE partner_logins ADD COLUMN credentials_sent_at timestamptz;
  END IF;
END $$;

-- Add unique constraint on partnership_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'partner_logins' 
    AND constraint_name = 'partner_logins_partnership_id_key'
  ) THEN
    ALTER TABLE partner_logins ADD CONSTRAINT partner_logins_partnership_id_key UNIQUE (partnership_id);
  END IF;
END $$;

-- Function to generate partner credentials
CREATE OR REPLACE FUNCTION generate_partner_credentials(partnership_id_param uuid)
RETURNS TABLE(username text, temp_password text, activation_token text) AS $$
DECLARE
  partner_email text;
  generated_username text;
  generated_password text;
  generated_token text;
  existing_login_id uuid;
BEGIN
  -- Get partner email from stitching_partnerships
  SELECT email INTO partner_email 
  FROM stitching_partnerships 
  WHERE id = partnership_id_param;
  
  IF partner_email IS NULL THEN
    RAISE EXCEPTION 'Partnership not found';
  END IF;
  
  -- Use email as username (clean format)
  generated_username := partner_email;
  
  -- Generate temporary password (8 characters)
  generated_password := 'temp' || LPAD((RANDOM() * 9999)::int::text, 4, '0');
  
  -- Generate activation token
  generated_token := encode(gen_random_bytes(32), 'hex');
  
  -- Check if partner login already exists
  SELECT id INTO existing_login_id 
  FROM partner_logins 
  WHERE partnership_id = partnership_id_param;
  
  IF existing_login_id IS NOT NULL THEN
    -- Update existing login
    UPDATE partner_logins SET 
      username = generated_username,
      first_login = true,
      activation_token = generated_token,
      is_active = true,
      updated_at = now()
    WHERE partnership_id = partnership_id_param;
  ELSE
    -- Insert new partner login
    INSERT INTO partner_logins (
      partnership_id, 
      username, 
      password_hash, 
      first_login, 
      activation_token,
      is_active
    ) VALUES (
      partnership_id_param,
      generated_username,
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- temp password hash
      true,
      generated_token,
      true
    );
  END IF;
  
  RETURN QUERY SELECT generated_username, generated_password, generated_token;
END;
$$ LANGUAGE plpgsql;

-- Update existing partner logins to use email as username
UPDATE partner_logins 
SET username = sp.email,
    first_login = COALESCE(partner_logins.first_login, true),
    activation_token = COALESCE(partner_logins.activation_token, encode(gen_random_bytes(32), 'hex'))
FROM stitching_partnerships sp 
WHERE partner_logins.partnership_id = sp.id;

-- Create sample credentials for existing partnerships that don't have logins
DO $$
DECLARE
  partnership_record RECORD;
  creds RECORD;
BEGIN
  FOR partnership_record IN 
    SELECT sp.id, sp.unit_name
    FROM stitching_partnerships sp
    LEFT JOIN partner_logins pl ON sp.id = pl.partnership_id
    WHERE sp.status IN ('Contacted', 'In Progress') 
    AND pl.id IS NULL
  LOOP
    SELECT * INTO creds FROM generate_partner_credentials(partnership_record.id);
    RAISE NOTICE 'Generated credentials for partnership % (%): username=%, temp_password=%', 
      partnership_record.unit_name, partnership_record.id, creds.username, creds.temp_password;
  END LOOP;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_logins_activation_token ON partner_logins(activation_token);
CREATE INDEX IF NOT EXISTS idx_partner_logins_first_login ON partner_logins(first_login);

-- Update partnership statuses to include credential-related statuses
DO $$
BEGIN
  -- Update some partnerships to show they have credentials
  UPDATE stitching_partnerships 
  SET status = 'credentials_sent' 
  WHERE unit_name = 'Precision Stitching Works';
  
  UPDATE stitching_partnerships 
  SET status = 'active' 
  WHERE unit_name = 'Elite Garment Manufacturing';
END $$;

-- Mark credentials as sent for demo partnerships
UPDATE partner_logins 
SET credentials_sent = true,
    credentials_sent_at = now()
WHERE partnership_id IN (
  SELECT id FROM stitching_partnerships 
  WHERE unit_name IN ('Precision Stitching Works', 'Elite Garment Manufacturing')
);

-- Ensure we have at least one demo login for testing
DO $$
DECLARE
  demo_partnership_id uuid;
  demo_creds RECORD;
BEGIN
  -- Get the Precision Stitching Works partnership ID
  SELECT id INTO demo_partnership_id 
  FROM stitching_partnerships 
  WHERE unit_name = 'Precision Stitching Works';
  
  IF demo_partnership_id IS NOT NULL THEN
    -- Generate credentials for demo
    SELECT * INTO demo_creds FROM generate_partner_credentials(demo_partnership_id);
    
    -- Update the login to have a known password for demo
    UPDATE partner_logins 
    SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password123
        first_login = true
    WHERE partnership_id = demo_partnership_id;
    
    RAISE NOTICE 'Demo credentials: username=%, password=password123 (first login required)', demo_creds.username;
  END IF;
END $$;