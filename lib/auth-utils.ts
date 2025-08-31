"use server"

import { createClient } from "@/lib/supabase/client"

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Check admin status directly from the admin_users table
    const { data, error } = await supabase.from("admin_users").select("id").eq("user_id", userId).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in isAdmin:", error)
    return false
  }
}
