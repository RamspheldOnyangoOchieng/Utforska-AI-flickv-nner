CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON settings FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.email IN (
      SELECT email FROM admin_users
    )
  ));