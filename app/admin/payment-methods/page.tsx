"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Info, RefreshCw, Database, PenToolIcon as Tool, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import supabase from "@/lib/supabase"

export default function PaymentMethodsPage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading, refreshSession } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [liveMode, setLiveMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRunningMigration, setIsRunningMigration] = useState(false)
  const [isFixingTable, setIsFixingTable] = useState(false)
  const [isCleaningSettings, setIsCleaningSettings] = useState(false)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, authLoading, router])

  const fetchCurrentMode = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      // If we're forcing a refresh, refresh the session first
      if (forceRefresh) {
        setIsRefreshing(true)
        await refreshSession()
        setIsRefreshing(false)
      }

      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session && retryCount < 3) {
        // Try to refresh the session and retry
        console.log("No session found, attempting to refresh...")
        const refreshed = await refreshSession()
        if (refreshed) {
          setRetryCount(retryCount + 1)
          return fetchCurrentMode(false) // Retry without forcing another refresh
        }
      }

      // Fetch the current mode from the API
      const response = await fetch("/api/admin/stripe-mode", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include the user ID and admin status in headers as a backup
          "X-User-Id": user?.id || "",
          "X-User-Email": user?.email || "",
          "X-User-Admin": user?.isAdmin ? "true" : "false",
        },
        credentials: "include", // Important for cookies
      })

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Non-JSON response: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()

      if (!response.ok) {
        // If we get a 401/403 and haven't retried too many times, try refreshing the session
        if ((response.status === 401 || response.status === 403) && retryCount < 3) {
          console.log(`Got ${response.status}, attempting to refresh session...`)
          setRetryCount(retryCount + 1)
          return fetchCurrentMode(true) // Retry with forced refresh
        }

        throw new Error(data.error || `Failed to fetch mode: ${response.status}`)
      }

      console.log("Fetched mode data:", data)
      setDebugInfo(data)

      // Make sure we're setting the state correctly from the response
      if (data.liveMode !== undefined) {
        console.log("Setting liveMode to:", data.liveMode)
        setLiveMode(data.liveMode)
      } else {
        console.warn("liveMode not found in response:", data)
      }

      // Reset retry count on success
      setRetryCount(0)
    } catch (error: any) {
      console.error("Error fetching mode:", error)
      setError(error.message || "Failed to load mode setting")
      toast({
        title: "Error",
        description: error.message || "Failed to load mode setting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user && user.isAdmin) {
      fetchCurrentMode()
    }
  }, [authLoading, user])

  const saveMode = async () => {
    try {
      setIsSaving(true)
      setError(null)

      console.log("Saving mode:", liveMode)

      // Save the mode setting via API
      const response = await fetch("/api/admin/stripe-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the user ID and admin status in headers as a backup
          "X-User-Id": user?.id || "",
          "X-User-Email": user?.email || "",
          "X-User-Admin": user?.isAdmin ? "true" : "false",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({
          liveMode,
          userId: user?.id, // Include user ID in body as well
          userEmail: user?.email,
        }),
      })

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Non-JSON response: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()
      console.log("Save response:", data)

      if (!response.ok) {
        // If we get an RLS error, suggest running the migration
        if (data.error && data.error.includes("row-level security")) {
          setError("Row-level security policy error. Try running the database migration.")
          return
        }

        // If we get an updated_at error, suggest fixing the table structure
        if (data.error && data.error.includes("updated_at")) {
          setError("Table structure error: Could not find the 'updated_at' column. Try fixing the table structure.")
          return
        }

        // If we get a multiple rows error, suggest cleaning up duplicate settings
        if (data.error && data.error.includes("multiple")) {
          setError("Multiple rows found for the same setting. Try cleaning up duplicate settings.")
          return
        }

        throw new Error(data.error || `Failed to save mode: ${response.status}`)
      }

      // Explicitly set the liveMode state to match what was saved
      setLiveMode(liveMode)
      setDebugInfo(data)

      toast({
        title: "Success",
        description: `Stripe is now in ${liveMode ? "live" : "test"} mode.`,
      })

      // Wait a moment before refreshing to ensure the database has updated
      setTimeout(() => {
        fetchCurrentMode()
      }, 500)
    } catch (error: any) {
      console.error("Error saving mode:", error)
      setError(error.message || "Failed to save mode setting")
      toast({
        title: "Error",
        description: error.message || "Failed to save mode setting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      const success = await refreshSession()
      if (success) {
        toast({
          title: "Session Refreshed",
          description: "Your session has been refreshed successfully.",
        })
        fetchCurrentMode()
      } else {
        toast({
          title: "Session Refresh Failed",
          description: "Unable to refresh your session. Please try logging in again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast({
        title: "Error",
        description: "Failed to refresh session. Please try logging in again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const runSettingsMigration = async () => {
    setIsRunningMigration(true)
    try {
      const response = await fetch("/api/admin/run-settings-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run migration")
      }

      toast({
        title: "Migration Successful",
        description: "Database migration completed successfully. You can now save settings.",
      })

      // Refresh the mode data
      fetchCurrentMode()
    } catch (error: any) {
      console.error("Error running migration:", error)
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to run database migration.",
        variant: "destructive",
      })
    } finally {
      setIsRunningMigration(false)
    }
  }

  const fixTableStructure = async () => {
    setIsFixingTable(true)
    try {
      const response = await fetch("/api/admin/fix-settings-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix table structure")
      }

      toast({
        title: "Table Fixed",
        description: "Settings table structure fixed successfully. You can now save settings.",
      })

      // Refresh the mode data
      fetchCurrentMode()
    } catch (error: any) {
      console.error("Error fixing table structure:", error)
      toast({
        title: "Fix Failed",
        description: error.message || "Failed to fix table structure.",
        variant: "destructive",
      })
    } finally {
      setIsFixingTable(false)
    }
  }

  const cleanSettings = async () => {
    setIsCleaningSettings(true)
    try {
      const response = await fetch("/api/admin/clean-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to clean settings")
      }

      toast({
        title: "Settings Cleaned",
        description: `Cleaned up ${data.removedCount} duplicate settings. You can now save settings.`,
      })

      // Refresh the mode data
      fetchCurrentMode()
    } catch (error: any) {
      console.error("Error cleaning settings:", error)
      toast({
        title: "Clean Failed",
        description: error.message || "Failed to clean settings.",
        variant: "destructive",
      })
    } finally {
      setIsCleaningSettings(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={cleanSettings}
              disabled={isCleaningSettings}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              {isCleaningSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Duplicates
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fixTableStructure}
              disabled={isFixingTable}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              {isFixingTable ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing Table...
                </>
              ) : (
                <>
                  <Tool className="mr-2 h-4 w-4" />
                  Fix Table
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runSettingsMigration}
              disabled={isRunningMigration}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              {isRunningMigration ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Run Migration
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSession}
              disabled={isRefreshing}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Session
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="bg-[#1A1A1A] border-[#252525]">
          <CardHeader>
            <CardTitle className="text-white">Stripe Mode</CardTitle>
            <CardDescription className="text-gray-400">
              Toggle between test and live mode for Stripe payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-white">Loading settings...</span>
              </div>
            ) : error ? (
              <div className="bg-[#2A1A1A] border border-red-800 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium">Error loading settings</h3>
                  <p className="text-red-300">{error}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchCurrentMode()}>
                      Try Again
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchCurrentMode(true)}>
                      Refresh & Try Again
                    </Button>
                    {error.includes("row-level security") && (
                      <Button variant="outline" size="sm" onClick={runSettingsMigration}>
                        Run Migration
                      </Button>
                    )}
                    {error.includes("updated_at") && (
                      <Button variant="outline" size="sm" onClick={fixTableStructure}>
                        Fix Table Structure
                      </Button>
                    )}
                    {error.includes("multiple") && (
                      <Button variant="outline" size="sm" onClick={cleanSettings}>
                        Clean Duplicates
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="live-mode" className="text-gray-300 text-lg">
                        Live Mode
                      </Label>
                      <p className="text-sm text-gray-400 mt-1">
                        When enabled, real payments will be processed. Use test mode for development.
                      </p>
                    </div>
                    <Switch
                      id="live-mode"
                      checked={liveMode}
                      onCheckedChange={setLiveMode}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <div
                    className={`rounded-md p-4 ${liveMode ? "bg-[#2A1A1A] border border-yellow-800" : "bg-[#1A2A1A] border border-green-800"}`}
                  >
                    <p className={`text-sm ${liveMode ? "text-yellow-400" : "text-green-400"}`}>
                      <strong>{liveMode ? "Warning:" : "Note:"}</strong>{" "}
                      {liveMode
                        ? "Live mode will process real payments using your live Stripe API keys. Make sure you're ready to accept real payments."
                        : "Test mode uses your Stripe test API keys. No real payments will be processed."}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={saveMode}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Setting"
                      )}
                    </Button>
                  </div>

                  {/* Debug information */}
                  {debugInfo && (
                    <div className="mt-8 p-4 bg-[#1A1A2A] border border-[#252550] rounded-md">
                      <div className="flex items-center mb-2">
                        <Info className="h-4 w-4 text-blue-400 mr-2" />
                        <h3 className="text-blue-400 text-sm font-medium">Debug Information</h3>
                      </div>
                      <pre className="text-xs text-gray-400 overflow-auto p-2 bg-[#0A0A1A] rounded">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
