-- Function to create the stripe_keys table if it doesn't exist
CREATE OR REPLACE FUNCTION create_stripe_keys_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'stripe_keys'
  ) THEN
    -- Create the table
    CREATE TABLE public.stripe_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      test_publishable_key TEXT,
      test_secret_key TEXT,
      live_publishable_key TEXT,
      live_secret_key TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE public.stripe_keys ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for admins
    CREATE POLICY "Admins can do anything with stripe_keys"
      ON public.stripe_keys
      USING (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
      ));
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
