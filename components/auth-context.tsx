"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase"
import { signIn, signUp, signOut, getCurrentUser, getCurrentSession, refreshAuthSession, isAdmin } from "@/lib/auth"

export type User = {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<boolean>
  isLoading: boolean
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string; needsMigration?: boolean }>
  checkDeleteUserFunction: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple debounce function to prevent too many requests
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const fetchingUsers = useRef(false)
  const lastFetchTime = useRef(0)

  // Check if user is logged in on mount
  useEffect(() => {
    async function loadUser() {
      setIsLoading(true)
      try {
        // First try to get the current session
        const session = await getCurrentSession()

        if (!session) {
          // If no session, try to refresh it, but don't throw an error if it fails
          const refreshed = await refreshAuthSession()
          if (!refreshed) {
            console.log("No active session found and refresh failed")
            setUser(null)
            setIsLoading(false)
            return
          }
        }

        // Now get the user
        const user = await getCurrentUser()
        if (!user) {
          console.log("No user found after session check")
          setUser(null)
          setIsLoading(false)
          return
        }

        // Check if the user is an admin
        const adminStatus = await isAdmin(user.id)

        setUser({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
          email: user.email || "",
          isAdmin: adminStatus,
          createdAt: user.created_at || new Date().toISOString(),
          avatar: user.user_metadata?.avatar_url,
        })
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Load users from database when admin is logged in
  useEffect(() => {
    // Debounced fetch function to prevent too many requests
    const debouncedFetchUsers = debounce(async () => {
      if (!user?.isAdmin || fetchingUsers.current) return

      // Rate limiting - only fetch once every 10 seconds
      const now = Date.now()
      if (now - lastFetchTime.current < 10000) return

      fetchingUsers.current = true
      lastFetchTime.current = now

      try {
        // Fetch users from auth.users via Supabase functions or API
        const { data, error } = await supabase.from("users_view").select("*")

        if (error) {
          console.error("Error fetching users:", error)
          return
        }

        if (data) {
          // Transform the data to match our User type
          const formattedUsers = data.map((u) => ({
            id: u.id,
            username: u.username || u.email.split("@")[0],
            email: u.email,
            isAdmin: u.is_admin || false,
            createdAt: u.created_at,
          }))

          setUsers(formattedUsers)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        fetchingUsers.current = false
      }
    }, 300)

    if (user?.isAdmin) {
      debouncedFetchUsers()
    }
  }, [user?.isAdmin, user?.id])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Updated to handle the new return format from signIn
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Login error:", error.message)
        return false
      }

      if (data?.user) {
        // Check admin status directly
        const adminStatus = await isAdmin(data.user.id)
        console.log("Admin status check result:", adminStatus)

        setUser({
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
          email: data.user.email || "",
          isAdmin: adminStatus,
          createdAt: data.user.created_at || new Date().toISOString(),
          avatar: data.user.user_metadata?.avatar_url,
        })

        // Store user in localStorage for persistence
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
            email: data.user.email || "",
            isAdmin: adminStatus,
            createdAt: data.user.created_at || new Date().toISOString(),
          }),
        )

        // Clear anonymous user ID on login to prevent mixing guest and user images
        try {
          const { clearAnonymousUserId } = await import("@/lib/anonymous-user")
          clearAnonymousUserId()
        } catch (e) {
          console.error("Failed to clear anonymous user ID on login", e)
        }

        // Force a reload to ensure session/user state is refreshed and only correct images are shown
        window.location.reload()
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await signUp(email, password)

      if (error) {
        console.error("Signup error:", error.message)
        return false
      }

      if (data?.user) {
        // Update user metadata to include username
        await supabase.auth.updateUser({
          data: { username },
        })

        // Note: We don't set the user here because they need to confirm their email first
        // or log in after signup
        return true
      }

      return false
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      localStorage.removeItem("currentUser")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const checkDeleteUserFunction = async (): Promise<boolean> => {
    try {
      // First try to check if the function exists in the database directly
      const { data, error: functionCheckError } = await supabase.rpc("exec_sql", {
        sql: "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_user')",
      })

      if (data && data[0] && data[0].exists) {
        return true
      }

      // Fallback: Try to call the function with a non-existent user ID
      // This will fail with a specific error if the function exists
      const { error } = await supabase.rpc("delete_user", { user_id: "00000000-0000-0000-0000-000000000000" })

      // If we get an error about the user not existing or admin permissions, the function exists
      if (
        error &&
        (error.message.includes("User not found") ||
          error.message.includes("Cannot delete administrator accounts") ||
          error.message.includes("Only administrators can delete users"))
      ) {
        return true
      }

      // If we get an error about the function not existing, it doesn't exist
      if (error && error.message.includes("Could not find the function")) {
        return false
      }

      // Default to true if we're not sure - better to enable than disable
      return true
    } catch (error) {
      console.error("Error checking delete_user function:", error)
      // Default to true if there's an error - better to enable than disable
      return true
    }
  }

  const deleteUser = async (id: string) => {
    try {
      // First check if the user exists
      const { data: userData, error: userError } = await supabase.from("users_view").select("*").eq("id", id).single()

      if (userError || !userData) {
        console.error("Error finding user:", userError)
        return { success: false, error: "User not found" }
      }

      // Don't allow deleting admin users
      if (userData.is_admin) {
        return { success: false, error: "Cannot delete administrator accounts" }
      }

      // Delete the user from auth.users via admin API
      // Update the parameter name from user_id to target_user_id
      const { error } = await supabase.rpc("delete_user", { target_user_id: id })

      if (error) {
        console.error("Error deleting user:", error)

        // Check if this is a function not found error
        if (error.message.includes("Could not find the function")) {
          return {
            success: false,
            error: "The delete_user function does not exist. Please run the migration first.",
            needsMigration: true,
          }
        }

        return { success: false, error: error.message }
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== id))
      return { success: true }
    } catch (error) {
      console.error("Error in deleteUser:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      // Check if this is a function not found error
      if (errorMessage.includes("Could not find the function")) {
        return {
          success: false,
          error: "The delete_user function does not exist. Please run the migration first.",
          needsMigration: true,
        }
      }

      return { success: false, error: errorMessage }
    }
  }

  // Add this function to the AuthProvider component
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
        // If refresh fails, log the user out
        await logout()
        return false
      }
      return true
    } catch (error) {
      console.error("Error refreshing session:", error)
      return false
    }
  }

  // Add refreshSession to the context value
  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        signup,
        logout,
        refreshSession,
        isLoading,
        deleteUser,
        checkDeleteUserFunction,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
