"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManualTestRLSPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [serviceRoleKey, setServiceRoleKey] = useState("")
  const [anonKey, setAnonKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const testRLS = async () => {
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      setResult({
        success: false,
        message: "Please provide Supabase URL, Service Role Key, and Anon Key",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Create a Supabase admin client with the provided credentials
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Create a regular client with anon key
      const supabaseClient = createClient(supabaseUrl, anonKey)

      // Get current user's session
      const {
        data: { session },
      } = await supabaseClient.auth.getSession()
      const userId = session?.user?.id || null

      // Test 1: Get current user's images with client
      const { data: clientImages, error: clientError } = await supabaseClient
        .from("generated_images")
        .select("*")
        .limit(5)

      // Test 2: Get all images with admin
      const { data: adminImages, error: adminError } = await supabaseAdmin
        .from("generated_images")
        .select("*")
        .limit(100)

      // Test 3: Get current user's collections with client
      const { data: clientCollections, error: clientCollError } = await supabaseClient
        .from("collections")
        .select("*")
        .limit(5)

      // Test 4: Get all collections with admin
      const { data: adminCollections, error: adminCollError } = await supabaseAdmin
        .from("collections")
        .select("*")
        .limit(100)

      setResult({
        success: true,
        message: "RLS tests completed successfully!",
        details: {
          userId,
          clientImages: {
            count: clientImages?.length || 0,
            error: clientError?.message,
          },
          adminImages: {
            count: adminImages?.length || 0,
            error: adminError?.message,
          },
          clientCollections: {
            count: clientCollections?.length || 0,
            error: clientCollError?.message,
          },
          adminCollections: {
            count: adminCollections?.length || 0,
            error: adminCollError?.message,
          },
        },
      })
    } catch (error) {
      console.error("Error testing RLS:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manual RLS Testing</CardTitle>
          <CardDescription>
            Enter your Supabase credentials to manually test Row Level Security policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input
              id="supabaseUrl"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceRoleKey">Service Role Key</Label>
            <Input
              id="serviceRoleKey"
              value={serviceRoleKey}
              onChange={(e) => setServiceRoleKey(e.target.value)}
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-sm text-muted-foreground">
              You can find this in your Supabase dashboard under Project Settings &gt; API &gt; Service Role Key
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anonKey">Anon Key</Label>
            <Input
              id="anonKey"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-sm text-muted-foreground">
              You can find this in your Supabase dashboard under Project Settings &gt; API &gt; Anon Key
            </p>
          </div>

          {result && (
            <div className="mt-4 space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {result.details && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Test Results:</h3>
                  <ul className="space-y-2">
                    <li>
                      <strong>User ID:</strong> {result.details.userId || "Not signed in"}
                    </li>
                    <li>
                      <strong>Client Images:</strong> {result.details.clientImages.count}
                      {result.details.clientImages.error && ` (Error: ${result.details.clientImages.error})`}
                    </li>
                    <li>
                      <strong>Admin Images:</strong> {result.details.adminImages.count}
                      {result.details.adminImages.error && ` (Error: ${result.details.adminImages.error})`}
                    </li>
                    <li>
                      <strong>Client Collections:</strong> {result.details.clientCollections.count}
                      {result.details.clientCollections.error && ` (Error: ${result.details.clientCollections.error})`}
                    </li>
                    <li>
                      <strong>Admin Collections:</strong> {result.details.adminCollections.count}
                      {result.details.adminCollections.error && ` (Error: ${result.details.adminCollections.error})`}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testRLS} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test RLS Policies"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
