"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@supabase/supabase-js"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManualRLSSetupPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [serviceRoleKey, setServiceRoleKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const setupRLS = async () => {
    if (!supabaseUrl || !serviceRoleKey) {
      setResult({
        success: false,
        message: "Please provide both Supabase URL and Service Role Key",
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

      // Create policies for anonymous access
      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;',
      })

      await supabaseAdmin.rpc("execute_sql", {
        sql_query: 'DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;',
      })

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
          <CardTitle>Manual RLS Setup</CardTitle>
          <CardDescription>
            Enter your Supabase credentials to manually set up Row Level Security policies.
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
