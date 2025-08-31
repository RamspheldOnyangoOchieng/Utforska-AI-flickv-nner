"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@supabase/supabase-js"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManualSQLPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [serviceRoleKey, setServiceRoleKey] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any }>(null)

  const executeSQL = async () => {
    if (!supabaseUrl || !serviceRoleKey || !sqlQuery) {
      setResult({
        success: false,
        message: "Please provide Supabase URL, Service Role Key, and SQL query",
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

      // Execute the SQL query
      const { data, error } = await supabaseAdmin.rpc("execute_sql", {
        sql_query: sqlQuery,
      })

      if (error) throw error

      setResult({
        success: true,
        message: "SQL query executed successfully!",
        data,
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
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manual SQL Execution</CardTitle>
          <CardDescription>
            Enter your Supabase credentials and SQL query to execute custom SQL statements.
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
            <Label htmlFor="sqlQuery">SQL Query</Label>
            <Textarea
              id="sqlQuery"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;"
              rows={5}
            />
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
              {result.data && (
                <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={executeSQL} disabled={isLoading}>
            {isLoading ? "Executing..." : "Execute SQL"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
