-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can do everything" ON public.stripe_keys;

-- Create a new policy
CREATE POLICY "Admins can do everything" ON public.stripe_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );
