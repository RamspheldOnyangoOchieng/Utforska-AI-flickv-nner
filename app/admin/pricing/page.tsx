"use client"

import { AdminOnlyPage } from "@/components/admin-only-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PricingPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [monthlyPrice, setMonthlyPrice] = useState("")
  const [yearlyPrice, setYearlyPrice] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [tableExists, setTableExists] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPricing()
  }, [])

  const createPricingTable = async () => {
    try {
      setIsCreatingTable(true)
      setError(null)
      const supabase = createClient()

      // Create the pricing table
      const { error: createError } = await supabase.rpc("create_pricing_table")

      if (createError) {
        // If RPC doesn't exist, try direct SQL (for development)
        const { error: sqlError } = await supabase.from("pricing").insert([
          {
            id: "1",
            monthly_price: 9.99,
            yearly_price: 99.99,
            currency: "USD",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (sqlError && sqlError.message.includes("does not exist")) {
          throw new Error("Unable to create pricing table automatically. Please create it manually.")
        } else if (sqlError) {
          throw sqlError
        }
      }

      toast({
        title: "Success",
        description: "Pricing table created successfully.",
      })

      setTableExists(true)
      fetchPricing()
    } catch (error) {
      console.error("Error creating pricing table:", error)
      setError(error instanceof Error ? error.message : "Unknown error creating pricing table")
      toast({
        title: "Error",
        description: "Failed to create pricing table. See console for details.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTable(false)
    }
  }

  const fetchPricing = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      // First check if the table exists
      const { error: checkError } = await supabase.from("pricing").select("count").limit(1)

      if (checkError && checkError.message.includes("does not exist")) {
        console.log("Pricing table does not exist")
        setTableExists(false)
        return
      }

      const { data, error } = await supabase.from("pricing").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setMonthlyPrice(data.monthly_price?.toString() || "")
        setYearlyPrice(data.yearly_price?.toString() || "")
        setCurrency(data.currency || "USD")
      }
    } catch (error) {
      console.error("Error fetching pricing:", error)
      setError(error instanceof Error ? error.message : "Unknown error fetching pricing")
      toast({
        title: "Error",
        description: "Failed to load pricing information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const savePricing = async () => {
    try {
      setIsSaving(true)
      setError(null)
      const supabase = createClient()

      // Check if record exists
      const { data: existingData } = await supabase.from("pricing").select("id").single()

      const pricingData = {
        monthly_price: Number.parseFloat(monthlyPrice) || 0,
        yearly_price: Number.parseFloat(yearlyPrice) || 0,
        currency,
        updated_at: new Date().toISOString(),
      }

      let result

      if (existingData) {
        // Update existing record
        result = await supabase.from("pricing").update(pricingData).eq("id", existingData.id)
      } else {
        // Insert new record
        result = await supabase.from("pricing").insert([
          {
            ...pricingData,
            id: "1", // Use a fixed ID for simplicity
            created_at: new Date().toISOString(),
          },
        ])
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: "Success",
        description: "Pricing information saved successfully.",
      })
    } catch (error) {
      console.error("Error saving pricing:", error)
      setError(error instanceof Error ? error.message : "Unknown error saving pricing")
      toast({
        title: "Error",
        description: "Failed to save pricing information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const content = tableExists ? (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Pricing</CardTitle>
        <CardDescription>
          Configure the pricing for premium subscriptions. These settings will be used for payment processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-price">Monthly Price</Label>
              <div className="flex items-center">
                <span className="mr-2">
                  {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "¥"}
                </span>
                <Input
                  id="monthly-price"
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  placeholder="9.99"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearly-price">Yearly Price</Label>
              <div className="flex items-center">
                <span className="mr-2">
                  {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "¥"}
                </span>
                <Input
                  id="yearly-price"
                  type="number"
                  value={yearlyPrice}
                  onChange={(e) => setYearlyPrice(e.target.value)}
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Typically, yearly plans offer a discount compared to paying monthly for 12 months.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={savePricing} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Pricing"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Table Not Found</CardTitle>
        <CardDescription>
          The pricing table does not exist in your database. You need to create it before you can configure pricing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p>
            Click the button below to create the pricing table with default values. You can then update the pricing as
            needed.
          </p>
          <div className="flex justify-end">
            <Button onClick={createPricingTable} disabled={isCreatingTable}>
              {isCreatingTable ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Table...
                </>
              ) : (
                "Create Pricing Table"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return <AdminOnlyPage title="Pricing">{content}</AdminOnlyPage>
}
