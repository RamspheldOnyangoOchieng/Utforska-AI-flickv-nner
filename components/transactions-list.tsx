"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Search, Filter, RefreshCw } from "lucide-react"

type Transaction = {
  id: string
  user_id: string
  stripe_session_id?: string
  amount?: number
  status?: string
  payment_method?: string
  created_at?: string
  user_email?: string
  user_name?: string
  plan_name?: string
  plan_duration?: number
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date_desc")
  const supabase = createClientComponentClient()

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, check which tables exist
      const { data: tables } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")
      const tableNames = tables?.map((t) => t.tablename) || []

      const hasPayments = tableNames.includes("payments")
      const hasPremiumProfiles = tableNames.includes("premium_profiles")
      const hasProfiles = tableNames.includes("profiles")
      const hasUsers = tableNames.includes("users")
      const hasSubscriptionPlans = tableNames.includes("subscription_plans")

      let transactionsData: Transaction[] = []

      // Try to get data from payments table first
      if (hasPayments) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError)
        } else if (paymentsData && paymentsData.length > 0) {
          // Enrich payment data with user information if possible
          const userIds = [...new Set(paymentsData.map((p) => p.user_id))]

          const userMap: Record<string, { email?: string; name?: string }> = {}

          // Try to get user emails from profiles
          if (hasProfiles) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, email, full_name, username")
              .in("id", userIds)

            if (profilesData) {
              profilesData.forEach((profile) => {
                userMap[profile.id] = {
                  email: profile.email,
                  name: profile.full_name || profile.username,
                }
              })
            }
          }

          // If we couldn't get all users from profiles, try the users table
          if (hasUsers && Object.keys(userMap).length < userIds.length) {
            const { data: usersData } = await supabase
              .from("users")
              .select("id, email, user_metadata")
              .in("id", userIds)

            if (usersData) {
              usersData.forEach((user) => {
                if (!userMap[user.id]) {
                  userMap[user.id] = {
                    email: user.email,
                    name: user.user_metadata?.full_name || user.user_metadata?.name,
                  }
                }
              })
            }
          }

          // Try to get plan information from premium_profiles
          const planMap: Record<string, { plan_name?: string; plan_duration?: number }> = {}

          if (hasPremiumProfiles) {
            const { data: premiumData } = await supabase
              .from("premium_profiles")
              .select("user_id, plan_name, plan_duration")
              .in("user_id", userIds)

            if (premiumData) {
              premiumData.forEach((profile) => {
                planMap[profile.user_id] = {
                  plan_name: profile.plan_name,
                  plan_duration: profile.plan_duration,
                }
              })
            }
          }

          // Map the payment data with user information
          transactionsData = paymentsData.map((payment) => ({
            ...payment,
            user_email: userMap[payment.user_id]?.email,
            user_name: userMap[payment.user_id]?.name,
            plan_name: planMap[payment.user_id]?.plan_name,
            plan_duration: planMap[payment.user_id]?.plan_duration,
          }))
        }
      }

      // If no data from payments, try premium_profiles
      if (transactionsData.length === 0 && hasPremiumProfiles) {
        const { data: premiumData, error: premiumError } = await supabase
          .from("premium_profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (premiumError) {
          console.error("Error fetching premium profiles:", premiumError)
        } else if (premiumData && premiumData.length > 0) {
          // Try to get user information
          const userIds = [...new Set(premiumData.map((p) => p.user_id))]

          const userMap: Record<string, { email?: string; name?: string }> = {}

          if (hasProfiles || hasUsers) {
            const { data: profilesData } = hasProfiles
              ? await supabase.from("profiles").select("id, email, full_name, username").in("id", userIds)
              : { data: null }

            const { data: usersData } = hasUsers
              ? await supabase.from("users").select("id, email, user_metadata").in("id", userIds)
              : { data: null }

            if (profilesData) {
              profilesData.forEach((profile) => {
                userMap[profile.id] = {
                  email: profile.email,
                  name: profile.full_name || profile.username,
                }
              })
            }

            if (usersData) {
              usersData.forEach((user) => {
                if (!userMap[user.id]) {
                  userMap[user.id] = {
                    email: user.email,
                    name: user.user_metadata?.full_name || user.user_metadata?.name,
                  }
                }
              })
            }
          }

          // Map premium profiles to transaction format
          transactionsData = premiumData.map((profile) => ({
            id: `premium_${profile.id}`,
            user_id: profile.user_id,
            amount: null, // We don't have amount in premium_profiles
            status: profile.is_premium ? "completed" : "inactive",
            payment_method: "unknown",
            created_at: profile.created_at,
            user_email: userMap[profile.user_id]?.email,
            user_name: userMap[profile.user_id]?.name,
            plan_name: profile.plan_name,
            plan_duration: profile.plan_duration,
          }))
        }
      }

      // If we still have no data, show an error
      if (transactionsData.length === 0) {
        setError("No transaction data found. Please make sure your payment tables are set up correctly.")
      } else {
        setTransactions(transactionsData)
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transaction data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A"
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "USD" }).format(amount)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "secondary"
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
      case "paid":
        return "success"
      case "pending":
      case "processing":
        return "warning"
      case "failed":
      case "canceled":
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    // Apply status filter
    if (statusFilter !== "all" && transaction.status?.toLowerCase() !== statusFilter) {
      return false
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.user_email?.toLowerCase().includes(searchLower) ||
        transaction.user_name?.toLowerCase().includes(searchLower) ||
        transaction.user_id.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.stripe_session_id?.toLowerCase().includes(searchLower) ||
        transaction.plan_name?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Apply sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      case "date_desc":
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case "amount_asc":
        return (a.amount || 0) - (b.amount || 0)
      case "amount_desc":
        return (b.amount || 0) - (a.amount || 0)
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    }
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "User ID",
      "User Email",
      "User Name",
      "Amount",
      "Status",
      "Payment Method",
      "Plan",
      "Duration",
      "Date",
      "Stripe Session ID",
    ]
    const rows = sortedTransactions.map((t) => [
      t.id,
      t.user_id,
      t.user_email || "N/A",
      t.user_name || "N/A",
      t.amount !== undefined && t.amount !== null ? t.amount.toString() : "N/A",
      t.status || "N/A",
      t.payment_method || "N/A",
      t.plan_name || "N/A",
      t.plan_duration?.toString() || "N/A",
      t.created_at || "N/A",
      t.stripe_session_id || "N/A",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payment-transactions-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>{transactions.length} total transactions</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={fetchTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={transactions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="amount_desc">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount_asc">Amount (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.user_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.user_email || transaction.user_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.plan_name ? (
                            <div>
                              <div>{transaction.plan_name}</div>
                              {transaction.plan_duration && (
                                <div className="text-sm text-muted-foreground">
                                  {transaction.plan_duration} {transaction.plan_duration === 1 ? "month" : "months"}
                                </div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status) as any}>
                            {transaction.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.payment_method || "Unknown"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          <span title={transaction.stripe_session_id || transaction.id}>
                            {transaction.stripe_session_id || transaction.id}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
