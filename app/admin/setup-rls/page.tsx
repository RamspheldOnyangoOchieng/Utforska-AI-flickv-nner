"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createAdminClient } from "@/lib/supabase-admin"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SetupRLSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupRLS = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabaseAdmin = await createAdminClient()

      // Enable RLS on tables
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: "ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;",
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: "ALTER TABLE collections ENABLE ROW LEVEL SECURITY;",
      })

      // Drop existing policies
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;',
      })

      // Create policies for generated_images
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only see their own images"
          ON generated_images FOR SELECT
          USING (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only insert their own images"
          ON generated_images FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only update their own images"
          ON generated_images FOR UPDATE
          USING (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only delete their own images"
          ON generated_images FOR DELETE
          USING (auth.uid() = user_id);
        `,
      })

      // Create policies for collections
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only see their own collections"
          ON collections FOR SELECT
          USING (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only insert their own collections"
          ON collections FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only update their own collections"
          ON collections FOR UPDATE
          USING (auth.uid() = user_id);
        `,
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE POLICY "Users can only delete their own collections"
          ON collections FOR DELETE
          USING (auth.uid() = user_id);
        `,
      })

      setResult({
        success: true,
        message: "Row Level Security policies have been successfully set up!",
      })
    } catch (error) {
      console.error("Error setting up RLS:", error)
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
          <CardTitle>Set Up Row Level Security</CardTitle>
          <CardDescription>
            This will configure Row Level Security policies to ensure users can only access their own data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This action will:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Enable Row Level Security on the generated_images and collections tables</li>
            <li>Create policies to ensure users can only see, create, update, and delete their own data</li>
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
          <Button onClick={setupRLS} disabled={isLoading}>
            {isLoading ? "Setting up..." : "Set Up RLS Policies"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
