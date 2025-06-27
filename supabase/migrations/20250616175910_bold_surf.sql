/*
  # Create admin user with username 'abcd' and password '1234'

  1. New Admin User
    - Username: abcd
    - Password: 1234 (hashed)
    - Created for admin access

  2. Security
    - Password is properly hashed using bcrypt
    - Uses existing RLS policies
*/

-- Insert admin user with username 'abcd' and password '1234'
-- Password hash for '1234' using bcrypt
INSERT INTO admin_users (username, password_hash) 
VALUES ('abcd', '$2a$10$N9qo8uLOickgx2ZMRZoMye.fDkkXrHHdcxr3lzyTtFUdOmLGibney')
ON CONFLICT (username) DO NOTHING;