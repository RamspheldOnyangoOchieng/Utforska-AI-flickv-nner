"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Check, AlertTriangle, Code, ArrowLeft } from "lucide-react"

export default function RunDeleteUserMigration() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not admin
  if (!isLoading && (!user || !user.isAdmin)) {
    router.push("/admin/login")
    return null
  }

  const runMigration = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/run-delete-user-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run migration")
      }

      setIsComplete(true)

      toast({
        title: "Migration successful",
        description: "The delete user function has been created.",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/dashboard/users")
      }, 2000)
    } catch (error) {
      console.error("Error running migration:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")

      toast({
        title: "Migration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <div className="max-w-2xl mx-auto bg-[#1A1A1A] rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Setup User Management</h1>
        </div>

        <p className="mb-6 text-gray-400">
          This will create a database function that allows administrators to delete users. This is required for the user
          management functionality.
        </p>

        <div className="bg-[#252525] p-4 rounded-md border border-[#333] mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-400">One-time setup</h4>
              <p className="text-xs text-gray-400 mt-1">
                This migration only needs to be run once. After running, you'll be able to delete users from the admin
                dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#252525] p-4 rounded-md border border-[#333] mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <Code className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400">What this does</h4>
              <p className="text-xs text-gray-400 mt-1">
                This migration creates a secure database function called <code>delete_user</code> that:
              </p>
              <ul className="text-xs text-gray-400 mt-2 list-disc list-inside space-y-1">
                <li>Allows administrators to delete user accounts</li>
                <li>Prevents deletion of administrator accounts</li>
                <li>Prevents users from deleting their own accounts</li>
                <li>Ensures only administrators can delete users</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400">Error</h4>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isComplete ? (
          <div className="bg-green-900/20 border border-green-900/30 rounded-md p-4 flex items-center gap-3 mb-6">
            <Check className="h-5 w-5 text-green-400" />
            <p className="text-green-400">Migration completed successfully! Redirecting...</p>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button onClick={runMigration} disabled={isRunning} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Running...
                </>
              ) : (
                "Run Migration"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard/users")}
              className="border-[#333]"
              disabled={isRunning}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
