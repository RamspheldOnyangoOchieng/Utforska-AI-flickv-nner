"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export function PaymentTransactionsDashboard() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/payment-transactions")
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const syncTransactionsWithStripe = async () => {
    try {
      setIsSyncing(true)
      // For each transaction, sync with Stripe
      for (const transaction of transactions) {
        await fetch(`/api/sync-stripe-transactions?session_id=${transaction.stripe_session_id}`)
      }
      // Refresh transactions
      await fetchTransactions()
    } catch (error) {
      console.error("Error syncing transactions:", error)
      setError(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleViewDetails = async (transaction) => {
    try {
      // Fetch metadata for this transaction
      const response = await fetch(`/api/payment-metadata?session_id=${transaction.stripe_session_id}`)
      const data = await response.json()

      setSelectedTransaction({
        ...transaction,
        metadata: data.metadata || {},
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching transaction metadata:", error)
      setSelectedTransaction(transaction)
      setIsDialogOpen(true)
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "User ID",
      "Session ID",
      "Amount",
      "Status",
      "Payment Method",
      "Created At",
      "Plan Name",
      "Plan Duration",
    ]

    const rows = transactions.map((tx) => [
      tx.id,
      tx.user_id,
      tx.stripe_session_id,
      tx.amount,
      tx.status,
      tx.payment_method,
      tx.created_at,
      tx.metadata?.planName || "",
      tx.metadata?.planDuration || "",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payment-transactions-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500"
      case "unpaid":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Transactions</CardTitle>
        <CardDescription>View and manage payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-4 flex justify-between">
              <Button onClick={fetchTransactions} variant="outline">
                Refresh
              </Button>
              <div className="space-x-2">
                <Button onClick={syncTransactionsWithStripe} disabled={isSyncing} variant="outline">
                  {isSyncing ? "Syncing..." : "Sync with Stripe"}
                </Button>
                <Button onClick={exportToCSV} variant="outline">
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          {transaction.user_id ? transaction.user_id.substring(0, 8) + "..." : "N/A"}
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status}</Badge>
                        </TableCell>
                        <TableCell>{transaction.metadata?.planName || "N/A"}</TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">Total: {transactions.length} transactions</div>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this payment transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{selectedTransaction.id}</div>

                <div className="font-semibold">User ID:</div>
                <div className="break-all">{selectedTransaction.user_id || "N/A"}</div>

                <div className="font-semibold">Session ID:</div>
                <div className="break-all">{selectedTransaction.stripe_session_id}</div>

                <div className="font-semibold">Amount:</div>
                <div>{formatCurrency(selectedTransaction.amount)}</div>

                <div className="font-semibold">Status:</div>
                <div>
                  <Badge className={getStatusBadgeColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>

                <div className="font-semibold">Payment Method:</div>
                <div>{selectedTransaction.payment_method}</div>

                <div className="font-semibold">Created At:</div>
                <div>{formatDate(selectedTransaction.created_at)}</div>

                {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                  <>
                    <div className="col-span-2 font-semibold mt-4">Metadata:</div>
                    {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <div className="font-semibold pl-2">{key}:</div>
                        <div className="break-all">{String(value)}</div>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
