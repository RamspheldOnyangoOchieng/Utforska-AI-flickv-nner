"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Copy, Check, ArrowLeft, ExternalLink } from "lucide-react"
import supabase from "@/lib/supabase"

export default function ManualMigrationPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SQL to create the delete_user function
  const migrationSQL = `
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
`.trim()

  // Redirect if not admin
  if (!isLoading && (!user || !user.isAdmin)) {
    router.push("/admin/login")
    return null
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    toast({
      title: "SQL copied to clipboard",
      description: "You can now paste it into the SQL editor.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  // Try to run the migration directly from the client
  const runMigrationDirectly = async () => {
    setIsRunning(true)
    setError(null)

    try {
      // Execute the SQL directly
      const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL })

      if (error) {
        throw new Error(error.message)
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
      <div className="max-w-3xl mx-auto bg-[#1A1A1A] rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Manual Migration Setup</h1>
        </div>

        <p className="mb-6 text-gray-400">
          You can run the migration manually by executing the following SQL in the Supabase SQL Editor or by using the
          direct execution button below.
        </p>

        <div className="mb-6">
          <div className="flex justify-between items-center bg-[#252525] p-3 rounded-t-md border border-b-0 border-[#333]">
            <span className="text-sm font-mono text-gray-400">SQL Migration</span>
            <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="bg-[#0D0D0D] p-4 rounded-b-md border border-[#333] overflow-x-auto text-sm text-gray-300 font-mono">
            {migrationSQL}
          </pre>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Option 1: Run Directly</h2>
            <p className="text-gray-400 text-sm mb-4">
              Try running the migration directly from this page. This might work if you have the right permissions.
            </p>

            {error && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400">Error</h4>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isComplete ? (
              <div className="bg-green-900/20 border border-green-900/30 rounded-md p-4 flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400" />
                <p className="text-green-400">Migration completed successfully! Redirecting...</p>
              </div>
            ) : (
              <Button
                onClick={runMigrationDirectly}
                disabled={isRunning}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Running...
                  </>
                ) : (
                  "Run Migration Directly"
                )}
              </Button>
            )}
          </div>

          <div className="border-t border-[#252525] pt-6">
            <h2 className="text-lg font-medium mb-2">Option 2: Run in Supabase SQL Editor</h2>
            <p className="text-gray-400 text-sm mb-4">
              If the direct method doesn't work, you can run the SQL in the Supabase SQL Editor:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm mb-4">
              <li>Copy the SQL above using the copy button</li>
              <li>
                Go to the{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Select your project</li>
              <li>Go to the SQL Editor tab</li>
              <li>Create a new query</li>
              <li>Paste the SQL</li>
              <li>Click "Run" to execute the query</li>
            </ol>
          </div>

          <div className="border-t border-[#252525] pt-6">
            <h2 className="text-lg font-medium mb-2">Option 3: Alternative Method</h2>
            <p className="text-gray-400 text-sm mb-4">
              If you're still having issues, you can try this simpler approach that doesn't require the function:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
              <li>Go to the Supabase Dashboard</li>
              <li>Navigate to Authentication → Users</li>
              <li>Find the user you want to delete</li>
              <li>Click the three dots menu and select "Delete user"</li>
              <li>
                Note: This method bypasses some of the safety checks in our function, so be careful not to delete admin
                users
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#252525]">
          <Button variant="outline" onClick={() => router.push("/admin/dashboard/users")} className="border-[#333]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </div>
    </div>
  )
}
