-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: First temporarily disable RLS to allow initial setup
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Create a view for listing users with admin status
CREATE OR REPLACE VIEW users_view AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'username' as username,
  (admin.id IS NOT NULL) as is_admin
FROM 
  auth.users au
LEFT JOIN 
  admin_users admin ON au.id = admin.user_id;

-- After setting up initial admin users, you can re-enable RLS with:
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- And then create appropriate policies:
-- CREATE POLICY "Allow admins to manage admin_users"
--   ON admin_users FOR ALL
--   USING (auth.role() = 'service_role');
