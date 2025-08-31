"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function AdminSignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      // First, sign up the user
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/admin/login`,
        },
      })

      if (signupError) {
        console.error("Signup error:", signupError)
        setError(signupError.message || "Email already in use or signup failed")
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        setError("Failed to create user account")
        setIsLoading(false)
        return
      }

      console.log("User created successfully:", data.user.id)

      // Try to insert the user into admin_users table
      try {
        const { error: insertError } = await supabase.from("admin_users").insert([{ user_id: data.user.id }])

        if (insertError) {
          console.error("Error adding admin user:", insertError)
          setSuccess(
            `Account created, but admin privileges could not be set automatically. Please use the Manual Admin Setup page to complete the process.`,
          )
          setIsLoading(false)

          // Store the user ID in localStorage for easy access in the manual setup
          localStorage.setItem("pendingAdminUserId", data.user.id)

          // Redirect to manual setup after a delay
          setTimeout(() => {
            router.push("/admin/manual-setup")
          }, 5000)
          return
        }

        // Check if email confirmation is required
        if (data?.user?.identities && data?.user?.identities.length === 0) {
          setSuccess("Account created! Please check your email to confirm your registration before logging in.")
        } else {
          setSuccess("Admin account created successfully! You can now log in.")
        }

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/admin/login")
        }, 3000)
      } catch (insertErr) {
        console.error("Insert error:", insertErr)
        setSuccess(
          `Account created, but admin privileges could not be set automatically. Please use the Manual Admin Setup page to complete the process.`,
        )

        // Store the user ID in localStorage for easy access in the manual setup
        localStorage.setItem("pendingAdminUserId", data.user.id)

        // Redirect to manual setup after a delay
        setTimeout(() => {
          router.push("/admin/manual-setup")
        }, 5000)
      }
    } catch (error) {
      console.error("Admin signup error:", error)
      setError(`An error occurred during signup: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A1A] rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create Admin Account</h1>
            <p className="text-gray-400">Sign up for administrator access</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#252525] border-[#333] text-white"
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#252525] border-[#333] text-white"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#252525] border-[#333] text-white"
                placeholder="•••••••���"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#252525] border-[#333] text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 text-blue-300 rounded-lg">
            <p className="text-sm mb-2">
              <strong>Note:</strong> If you encounter issues with admin privileges, you can use the Manual Admin Setup
              page.
            </p>
            <Link href="/admin/manual-setup" className="text-primary hover:underline flex items-center text-sm">
              Go to Manual Admin Setup
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
