"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/auth-context"

export default function DirectAdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    stripe_secret_key: "",
    stripe_webhook_secret: "",
  })
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)

        // Load settings without admin check
        const { data: adminSettings, error } = await supabase.from("admin_settings").select("*").single()

        if (error) {
          console.error("Error loading admin settings:", error)
          toast.error("Failed to load settings: " + error.message)
        } else if (adminSettings) {
          setSettings(adminSettings)
        }
      } catch (error) {
        console.error("Error loading admin settings:", error)
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [supabase])

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      const { error } = await supabase.from("admin_settings").upsert({
        id: 1, // Assuming there's only one settings record
        ...settings,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Direct Admin Settings Access</h1>

      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
        <h3 className="font-bold">Debug Info</h3>
        <p>User ID: {user?.id || "Not logged in"}</p>
        <p>Email: {user?.email || "Not logged in"}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
          <CardDescription>Configure your Stripe API keys for payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
            <Input
              id="stripe_secret_key"
              name="stripe_secret_key"
              value={settings.stripe_secret_key}
              onChange={handleChange}
              placeholder="sk_test_..."
              type="password"
            />
            <p className="text-sm text-gray-500">Your Stripe secret key. Never share this key publicly.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_webhook_secret">Stripe Webhook Secret</Label>
            <Input
              id="stripe_webhook_secret"
              name="stripe_webhook_secret"
              value={settings.stripe_webhook_secret}
              onChange={handleChange}
              placeholder="whsec_..."
              type="password"
            />
            <p className="text-sm text-gray-500">Your Stripe webhook secret for verifying webhook events.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
