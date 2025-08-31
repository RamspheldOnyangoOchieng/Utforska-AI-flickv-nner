"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { createAdminClient } from "@/lib/supabase-admin"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TestRLSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }

    checkAuth()
  }, [])

  const testRLS = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabase = createClient()
      const supabaseAdmin = await createAdminClient()

      // Test 1: Get current user's images with client
      const { data: clientImages, error: clientError } = await supabase.from("generated_images").select("*").limit(5)

      // Test 2: Get all images with admin
      const { data: adminImages, error: adminError } = await supabaseAdmin
        .from("generated_images")
        .select("*")
        .limit(100)

      // Test 3: Get current user's collections with client
      const { data: clientCollections, error: clientCollError } = await supabase
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
          <CardTitle>Test Row Level Security</CardTitle>
          <CardDescription>This will test if your RLS policies are working correctly.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Current user ID: {userId || "Not signed in"}</p>

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
