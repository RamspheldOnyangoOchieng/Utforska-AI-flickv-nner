"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type PremiumUser = {
  id: string
  email?: string
  name?: string
  full_name?: string
  subscription_status?: string
  is_premium?: boolean
  subscription_start?: string
  created_at?: string
  updated_at?: string
  last_payment_date?: string
  last_payment_amount?: number
}

export function PremiumUsersList() {
  const [users, setUsers] = useState<PremiumUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPremiumUsers() {
      try {
        setLoading(true)

        // First, check which tables exist
        const { data: tables } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

        const tableNames = tables?.map((t) => t.tablename) || []
        const hasProfiles = tableNames.includes("profiles")
        const hasUsers = tableNames.includes("users")
        const hasPayments = tableNames.includes("payments")

        let data: PremiumUser[] = []

        // Try to get premium users from profiles table first
        if (hasProfiles) {
          // First, check which columns exist in the profiles table
          const { data: profileColumns } = await supabase
            .from("information_schema.columns")
            .select("column_name")
            .eq("table_name", "profiles")
            .eq("table_schema", "public")

          const columnNames = profileColumns?.map((c) => c.column_name) || []
          const hasUpdatedAt = columnNames.includes("updated_at")
          const hasCreatedAt = columnNames.includes("created_at")

          // Build the select query based on available columns
          let selectQuery = "id, full_name, is_premium"
          if (columnNames.includes("email")) selectQuery += ", email"
          if (columnNames.includes("subscription_status")) selectQuery += ", subscription_status"
          if (columnNames.includes("subscription_start")) selectQuery += ", subscription_start"
          if (hasCreatedAt) selectQuery += ", created_at"
          if (hasUpdatedAt) selectQuery += ", updated_at"

          // Determine which column to use for ordering
          const orderColumn = hasUpdatedAt ? "updated_at" : hasCreatedAt ? "created_at" : "id"

          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select(selectQuery)
            .eq("is_premium", true)
            .order(orderColumn, { ascending: false })

          if (profilesError) {
            console.error("Error fetching from profiles:", profilesError)
          } else if (profilesData && profilesData.length > 0) {
            // Process the data to ensure consistent structure
            data = profilesData.map((profile) => ({
              ...profile,
              subscription_status: profile.subscription_status || (profile.is_premium ? "active" : "inactive"),
              // Use created_at as fallback for subscription_start if needed
              subscription_start: profile.subscription_start || profile.created_at,
            }))
          }
        }

        // If no data from profiles, try users table
        if (data.length === 0 && hasUsers) {
          // Check columns in users table
          const { data: userColumns } = await supabase
            .from("information_schema.columns")
            .select("column_name")
            .eq("table_name", "users")
            .eq("table_schema", "public")

          const columnNames = userColumns?.map((c) => c.column_name) || []

          // Build select query based on available columns
          let selectQuery = "id"
          if (columnNames.includes("email")) selectQuery += ", email"
          if (columnNames.includes("full_name")) selectQuery += ", full_name"
          if (columnNames.includes("subscription_status")) selectQuery += ", subscription_status"
          if (columnNames.includes("subscription_start")) selectQuery += ", subscription_start"
          if (columnNames.includes("last_payment_date")) selectQuery += ", last_payment_date"
          if (columnNames.includes("last_payment_amount")) selectQuery += ", last_payment_amount"
          if (columnNames.includes("created_at")) selectQuery += ", created_at"

          // Determine which column to use for filtering premium users
          const premiumFilter = columnNames.includes("subscription_status")
            ? "subscription_status.eq.active"
            : columnNames.includes("is_premium")
              ? "is_premium.eq.true"
              : null

          if (premiumFilter) {
            const { data: usersData, error: usersError } = await supabase
              .from("users")
              .select(selectQuery)
              .or(premiumFilter)

            if (usersError) {
              console.error("Error fetching from users:", usersError)
            } else if (usersData && usersData.length > 0) {
              data = usersData
            }
          }
        }

        // If still no data, try payments table
        if (data.length === 0 && hasPayments) {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("payments")
            .select("user_id, amount, created_at")
            .order("created_at", { ascending: false })

          if (paymentsError) {
            console.error("Error fetching from payments:", paymentsError)
          } else if (paymentsData && paymentsData.length > 0) {
            // Get unique user IDs from payments
            const userIds = [...new Set(paymentsData.map((p) => p.user_id))]

            // Create simplified user objects from payment data
            data = userIds.map((id) => {
              const userPayments = paymentsData.filter((p) => p.user_id === id)
              return {
                id,
                subscription_status: "active", // Assume active if they have payments
                subscription_start: userPayments[userPayments.length - 1]?.created_at, // First payment date
                last_payment_date: userPayments[0]?.created_at, // Most recent payment
                last_payment_amount: userPayments[0]?.amount,
              }
            })
          }
        }

        // If we still have no data, show an error
        if (data.length === 0) {
          setError("No premium users found or unable to access premium user data")
        } else {
          setUsers(data)
        }
      } catch (err) {
        console.error("Error fetching premium users:", err)
        setError("Failed to load premium users")
      } finally {
        setLoading(false)
      }
    }

    fetchPremiumUsers()
  }, []) // Remove supabase from dependencies

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A"
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "USD" }).format(amount)
  }

  const getUserName = (user: PremiumUser) => {
    if (user.full_name) return user.full_name
    if (user.name) return user.name
    return user.id.substring(0, 8) + "..."
  }

  const getUserEmail = (user: PremiumUser) => {
    return user.email || "No email available"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Last Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No premium users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getUserName(user)}</TableCell>
                    <TableCell>{getUserEmail(user)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.subscription_status === "active" || user.is_premium ? "default" : "secondary"}
                      >
                        {user.subscription_status || (user.is_premium ? "Active" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.subscription_start)}</TableCell>
                    <TableCell>
                      {user.last_payment_date ? (
                        <div>
                          <div>{formatDate(user.last_payment_date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(user.last_payment_amount)}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
