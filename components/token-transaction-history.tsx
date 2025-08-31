"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Transaction {
  id: string
  amount: number
  type: "purchase" | "usage" | "refund" | "bonus"
  description: string
  created_at: string
}

interface TokenTransactionHistoryProps {
  userId: string
  limit?: number
}

export function TokenTransactionHistory({ userId, limit = 10 }: TokenTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true)
      try {
        const response = await fetch(`/api/token-transactions?userId=${encodeURIComponent(userId)}&page=${page}&limit=${limit}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTransactions(data.transactions || [])
            setTotalPages(Math.ceil(data.total / limit) || 1)
          }
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId, page, limit])

  // For demo purposes, generate some sample transactions if none exist
  useEffect(() => {
    if (!loading && transactions.length === 0) {
      const sampleTransactions: Transaction[] = [
        {
          id: "1",
          amount: 200,
          type: "purchase",
          description: "Purchased 200 tokens",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: "2",
          amount: -5,
          type: "usage",
          description: "Generated 1 image",
          created_at: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
        },
        {
          id: "3",
          amount: -20,
          type: "usage",
          description: "Generated 4 images",
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        },
        {
          id: "4",
          amount: 50,
          type: "bonus",
          description: "Welcome bonus",
          created_at: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
        },
        {
          id: "5",
          amount: 5,
          type: "refund",
          description: "Refund for failed generation",
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
      ]
      setTransactions(sampleTransactions)
    }
  }, [loading, transactions])

  function getTypeColor(type: string) {
    switch (type) {
      case "purchase":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "usage":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "refund":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "bonus":
  return "bg-primary/10 text-primary hover:bg-primary/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your token purchase and usage history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)} variant="outline">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink onClick={() => setPage(p)} isActive={page === p}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
