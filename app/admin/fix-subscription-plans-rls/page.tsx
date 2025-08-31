"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FixSubscriptionPlansRLSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/fix-subscription-plans-rls")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error running migration:", error)
      setResult({ error: "Failed to run migration" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fix Subscription Plans RLS Policies</CardTitle>
          <CardDescription>
            This will update the row-level security policies for the subscription_plans table to allow admin users to
            manage subscription plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runMigration} disabled={isLoading}>
            {isLoading ? "Running Migration..." : "Run Migration"}
          </Button>

          {result && (
            <div className="mt-4 p-4 rounded-md border">
              {result.success ? (
                <p className="text-green-500">{result.message}</p>
              ) : (
                <p className="text-red-500">{result.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
