-- Drop any existing SELECT policy on the characters table
DROP POLICY IF EXISTS "Allow read access to all users" ON public.characters;

-- Create a new policy that allows read access to everyone
CREATE POLICY "Allow read access to all users"
ON public.characters FOR SELECT
USING (true);