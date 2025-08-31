ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for profile_pic_url"
ON auth.users FOR SELECT
USING ( true );