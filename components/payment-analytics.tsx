"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function PaymentAnalytics({ transactions }) {
  const [timeframe, setTimeframe] = useState("monthly")

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.status === "paid" || t.status === "success")
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  }, [transactions])

  // Calculate successful transactions count
  const successfulTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === "paid" || t.status === "success").length
  }, [transactions])

  // Calculate conversion rate (success page visits that resulted in payment)
  const conversionRate = useMemo(() => {
    const successPageVisits = transactions.filter((t) => t.metadata?.successPageVisited).length
    const paidAfterVisit = transactions.filter(
      (t) => t.metadata?.successPageVisited && (t.status === "paid" || t.status === "success"),
    ).length

    return successPageVisits > 0 ? (paidAfterVisit / successPageVisits) * 100 : 0
  }, [transactions])

  // Group transactions by status
  const statusData = useMemo(() => {
    const statusCounts = {}

    transactions.forEach((t) => {
      const status = t.status || "unknown"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [transactions])

  // Group transactions by payment method
  const paymentMethodData = useMemo(() => {
    const methodCounts = {}

    transactions.forEach((t) => {
      const method = t.payment_method || "unknown"
      methodCounts[method] = (methodCounts[method] || 0) + 1
    })

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }))
  }, [transactions])

  // Group transactions by time period
  const timeSeriesData = useMemo(() => {
    const groupedData = {}

    transactions.forEach((t) => {
      if (!t.created_at) return

      const date = new Date(t.created_at)
      let period

      if (timeframe === "daily") {
        period = date.toISOString().split("T")[0] // YYYY-MM-DD
      } else if (timeframe === "weekly") {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        period = `${date.getFullYear()}-W${weekNum}`
      } else {
        // monthly
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      if (!groupedData[period]) {
        groupedData[period] = {
          period,
          count: 0,
          revenue: 0,
          success: 0,
          pending: 0,
          failed: 0,
        }
      }

      groupedData[period].count += 1
      groupedData[period].revenue += t.amount || 0

      if (t.status === "paid" || t.status === "success") {
        groupedData[period].success += 1
      } else if (t.status === "pending" || t.status === "processing") {
        groupedData[period].pending += 1
      } else {
        groupedData[period].failed += 1
      }
    })

    // Convert to array and sort by period
    return Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period))
  }, [transactions, timeframe])

  // Format for tooltip
  const formatTooltip = (value, name) => {
    if (name === "revenue") {
      return [`$${value.toFixed(2)}`, "Revenue"]
    }
    return [value, name]
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {successfulTransactions} successful transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((successfulTransactions / (transactions.length || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {successfulTransactions} of {transactions.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Page Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of users who visited the success page</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Trends</CardTitle>
          <CardDescription>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Transactions" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Distribution of transaction statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
