-- This is a manual migration script that can be run in the Supabase SQL editor
-- if the automatic migration fails

-- Create the stripe_keys table
CREATE TABLE IF NOT EXISTS public.stripe_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_publishable_key TEXT,
  test_secret_key TEXT,
  live_publishable_key TEXT,
  live_secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security
ALTER TABLE public.stripe_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all rows
CREATE POLICY IF NOT EXISTS admin_all ON public.stripe_keys
  USING (EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  ));
  
-- Grant permissions to authenticated users (RLS will restrict access)
GRANT ALL ON public.stripe_keys TO authenticated;
