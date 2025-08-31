-- Function to check RLS policies for the stripe_keys table
CREATE OR REPLACE FUNCTION check_stripe_keys_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'stripe_keys'
  ) THEN
    RETURN jsonb_build_object(
      'error', 'Table does not exist',
      'table_exists', false
    );
  END IF;
  
  -- Check if RLS is enabled
  SELECT jsonb_build_object(
    'table_exists', true,
    'rls_enabled', relrowsecurity
  ) INTO result
  FROM pg_class
  WHERE oid = 'public.stripe_keys'::regclass;
  
  -- Get policies
  WITH policies AS (
    SELECT
      polname,
      polcmd,
      polpermissive,
      polroles,
      pg_get_expr(polqual, 'public.stripe_keys'::regclass) AS using_expr,
      pg_get_expr(polwithcheck, 'public.stripe_keys'::regclass) AS with_check_expr
    FROM pg_policy
    WHERE polrelid = 'public.stripe_keys'::regclass
  )
  SELECT 
    result || jsonb_build_object(
      'policies', jsonb_agg(
        jsonb_build_object(
          'name', polname,
          'command', polcmd,
          'permissive', polpermissive,
          'roles', polroles,
          'using_expr', using_expr,
          'with_check_expr', with_check_expr
        )
      )
    ) INTO result
  FROM policies;
  
  -- Check if the current user has admin rights
  SELECT 
    result || jsonb_build_object(
      'is_admin', EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
      )
    ) INTO result;
  
  RETURN result;
END;
$$;
