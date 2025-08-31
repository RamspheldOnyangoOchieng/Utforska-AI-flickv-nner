-- Create a function to create a debug test table
CREATE OR REPLACE FUNCTION create_debug_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a simple test table if it doesn't exist
  CREATE TABLE IF NOT EXISTS debug_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Make sure it's accessible
  ALTER TABLE debug_test ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Public access to debug_test" ON debug_test;
  
  -- Create a policy that allows anyone to insert and select
  CREATE POLICY "Public access to debug_test" 
  ON debug_test 
  USING (true) 
  WITH CHECK (true);
END;
$$;
