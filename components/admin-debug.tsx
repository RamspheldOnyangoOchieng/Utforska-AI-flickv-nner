"use client"

import { useAuth } from "@/components/auth-context"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function AdminDebug() {
  const { user } = useAuth()
  const [adminStatus, setAdminStatus] = useState<string>("Checking...")
  const supabase = createClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminStatus("No user logged in")
        return
      }

      try {
        // Check admin status directly from the database
        const { data, error } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

        if (error) {
          console.error("Error checking admin status:", error)
          setAdminStatus(`Error: ${error.message}`)
          return
        }

        setAdminStatus(data ? "Admin user found in database" : "Not an admin in database")
      } catch (error) {
        console.error("Error in admin check:", error)
        setAdminStatus(`Exception: ${error}`)
      }
    }

    checkAdminStatus()
  }, [user?.id]) // Only depend on user ID, not the whole user object or supabase

  if (!user) return null

  return (
    <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
      <h3 className="font-bold">Admin Debug Info</h3>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>isAdmin from context: {isAdmin ? "Yes" : "No"}</p>
      <p>Database check: {adminStatus}</p>
    </div>
  )
}
