-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON faqs;
DROP POLICY IF EXISTS "Allow admin users full access" ON faqs;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON faqs;

-- Create simple policies
-- Allow anyone to read FAQs
CREATE POLICY "Allow public read access" 
  ON faqs FOR SELECT 
  USING (true);

-- Allow service role to do anything (for admin API routes)
CREATE POLICY "Allow service role full access" 
  ON faqs FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');
