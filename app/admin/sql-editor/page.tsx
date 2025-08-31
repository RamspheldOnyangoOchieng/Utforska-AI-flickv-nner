"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Play, Database } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

export default function SqlEditorPage() {
  const [sql, setSql] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")

  const executeSQL = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setError("Supabase URL and Service Role Key are required")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data, error } = await supabase.rpc("exec_sql", { query: sql })

      if (error) throw error

      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred while executing the SQL")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="h-8 w-8" />
        SQL Editor
      </h1>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This tool allows you to execute SQL directly against your Supabase database. Use with caution as it can modify
          your database structure and data.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="supabaseUrl" className="block text-sm font-medium mb-1">
            Supabase URL
          </label>
          <input
            id="supabaseUrl"
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="supabaseKey" className="block text-sm font-medium mb-1">
            Service Role Key
          </label>
          <input
            id="supabaseKey"
            type="password"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            placeholder="your-service-role-key"
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
          <CardDescription>Enter your SQL query below and click Execute to run it.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="SELECT * FROM your_table;"
            className="font-mono text-sm h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={executeSQL} disabled={loading || !sql.trim()} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            {loading ? "Executing..." : "Execute SQL"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px] text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
