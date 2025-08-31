-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_user_admin BOOLEAN;
BEGIN
  -- Direct query to check admin status without going through RLS
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = p_user_id
  ) INTO is_user_admin;
  
  RETURN is_user_admin;
END;
$$;
