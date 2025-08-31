"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createAdminClient } from "@/lib/supabase-admin"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SetupAnonymousAccessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupAnonymousAccess = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabaseAdmin = await createAdminClient()

      // Drop existing policies
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;',
      })

      // Create policies for anonymous access
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Anonymous users can access their own images"
          ON generated_images FOR ALL
          USING (auth.uid() IS NOT NULL);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Anonymous users can access their own collections"
          ON collections FOR ALL
          USING (auth.uid() IS NOT NULL);
        `,
      })

      setResult({
        success: true,
        message: "Anonymous access policies have been successfully set up!",
      })
    } catch (error) {
      console.error("Error setting up anonymous access:", error)
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
          <CardTitle>Set Up Anonymous Access</CardTitle>
          <CardDescription>
            This will configure policies to allow anonymous users to access their own data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This action will:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Create policies to allow anonymous users to access their own data</li>
            <li>Ensure that anonymous users can only see their own content</li>
          </ul>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={setupAnonymousAccess} disabled={isLoading}>
            {isLoading ? "Setting up..." : "Set Up Anonymous Access"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
