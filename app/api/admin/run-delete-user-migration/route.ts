import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get the session to verify admin status
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase.from("admin_users").select("*").eq("user_id", session.user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // SQL to create the delete_user function
    const sql = `
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
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error creating delete_user function:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in run-delete-user-migration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
