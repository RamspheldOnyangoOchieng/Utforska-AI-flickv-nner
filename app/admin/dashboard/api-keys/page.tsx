"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { Home, Eye, EyeOff, Save, Check, AlertTriangle } from "lucide-react"
import { getApiKey, setApiKey } from "@/lib/db-init"

export default function AdminApiKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [novitaApiKey, setNovitaApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  // Load API key on mount
  useEffect(() => {
    async function loadApiKey() {
      const key = await getApiKey("novita_api_key")
      if (key) {
        setNovitaApiKey(key)
      }
    }

    if (user?.isAdmin) {
      loadApiKey()
    }
  }, [user])

  const handleSaveApiKey = async () => {
    setIsSaving(true)
    setSaveStatus("idle")
    setStatusMessage("")

    try {
      const success = await setApiKey("novita_api_key", novitaApiKey)

      if (success) {
        setSaveStatus("success")
        setStatusMessage("API key saved successfully!")
      } else {
        setSaveStatus("error")
        setStatusMessage("Failed to save API key. Please try again.")
      }
    } catch (error) {
      console.error("Error saving API key:", error)
      setSaveStatus("error")
      setStatusMessage("An error occurred while saving the API key.")
    } finally {
      setIsSaving(false)

      // Clear status message after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
        setStatusMessage("")
      }, 3000)
    }
  }

  if (isLoading) {
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
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">API Key Management</h2>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Novita AI API Key</h3>

              <p className="text-gray-400 mb-6">
                Enter your Novita AI API key below. This key is used for generating character descriptions and system
                prompts. You can get a key from the{" "}
                <a
                  href="https://novita.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Novita AI website
                </a>
                .
              </p>

              {saveStatus === "success" && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-800 text-green-300 rounded-lg flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  {statusMessage}
                </div>
              )}

              {saveStatus === "error" && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {statusMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={novitaApiKey}
                    onChange={(e) => setNovitaApiKey(e.target.value)}
                    placeholder="Enter your Novita AI API key"
                    className="bg-[#252525] border-[#333] text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save API Key
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 text-blue-300 rounded-lg">
                <h4 className="font-medium mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your API key is stored securely in the database and is only accessible to administrators.</li>
                  <li>The API key will be used for all AI-powered features in the application.</li>
                  <li>
                    If you don't have a Novita AI API key, the application will use a demo key with limited
                    functionality.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
