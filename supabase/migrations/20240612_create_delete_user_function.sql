-- Create a function to delete users (requires admin privileges)
CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Check if the calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = calling_user_id
  ) INTO is_admin;
  
  -- Only allow admins to delete users
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;
  
  -- Don't allow deleting yourself
  IF calling_user_id = user_id THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;
  
  -- Don't allow deleting other admins
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = user_id) THEN
    RAISE EXCEPTION 'Cannot delete administrator accounts';
  END IF;
  
  -- Delete the user from auth.users
  -- This will cascade to delete related data due to foreign key constraints
  DELETE FROM auth.users WHERE id = user_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.delete_user IS 'Allows administrators to delete user accounts';
