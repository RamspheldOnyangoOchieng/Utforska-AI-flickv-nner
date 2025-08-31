-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Anyone can insert images" ON generated_images;

-- Disable RLS temporarily to allow the admin client to work
ALTER TABLE generated_images DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role to do anything
CREATE POLICY "Service role can do anything"
ON generated_images
USING (true)
WITH CHECK (true);
