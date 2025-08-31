-- Create a function to create the stripe_keys table
CREATE OR REPLACE FUNCTION create_stripe_keys_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.stripe_keys ENABLE ROW LEVEL SECURITY;

    -- Create policy for admins
    CREATE POLICY "Admins can do everything" ON public.stripe_keys
      USING (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
      ));
  END IF;
END;
$$;
