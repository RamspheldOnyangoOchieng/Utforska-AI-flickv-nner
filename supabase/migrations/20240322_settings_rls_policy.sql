-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin users to manage settings" ON settings;
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;

-- Create policy for admin users to have full access
CREATE POLICY "Allow admin users to manage settings" 
ON settings 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Create policy for public read access to certain settings
CREATE POLICY "Allow public read access to settings" 
ON settings 
FOR SELECT
USING (
  key IN ('public_settings', 'app_name', 'app_description')
);

-- Insert default settings if they don't exist
INSERT INTO settings (key, value)
VALUES ('stripe_mode', '{"live": false}')
ON CONFLICT (key) DO NOTHING;
