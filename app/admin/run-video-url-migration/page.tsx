"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database } from "lucide-react"

export default function RunMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/run-video-url-migration")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: "Failed to run migration" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Video URL Column
          </CardTitle>
          <CardDescription>Run this migration to add the video_url column to the characters table</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will add a new column called <code className="bg-muted px-1 py-0.5 rounded">video_url</code> to the
            characters table in your Supabase database. This column is needed for the character hover video feature.
          </p>

          {result && (
            <Alert
              className={
                result.success
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
              }
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runMigration} disabled={isLoading} className="w-full btn-primary-gradient">
            {isLoading ? "Running Migration..." : "Run Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
