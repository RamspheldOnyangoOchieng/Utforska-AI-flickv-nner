"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createAdminClient } from "@/lib/supabase-admin"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ExecuteSQLPage() {
  const [sql, setSql] = useState<string>(`-- Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;

-- Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id);`)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const executeSql = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const supabaseAdmin = await createAdminClient()
      if (!supabaseAdmin) {
        throw new Error("Failed to create Supabase admin client")
      }

      // Split the SQL into individual statements
      const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

      for (const statement of statements) {
        await supabaseAdmin.rpc("execute_sql", {
          sql_query: statement.trim() + ";",
        })
      }

      setResult({
        success: true,
        message: "SQL executed successfully!",
      })
    } catch (error) {
      console.error("Error executing SQL:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Execute SQL</CardTitle>
          <CardDescription>Run SQL statements directly against your Supabase database.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="font-mono h-96"
            placeholder="Enter SQL statements here..."
          />

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={executeSql} disabled={isLoading}>
            {isLoading ? "Executing..." : "Execute SQL"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
