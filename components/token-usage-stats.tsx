"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface UsageData {
  name: string
  tokens: number
  images: number
}

interface TokenUsageStatsProps {
  userId: string
  initialData: {
    totalImagesGenerated: number
    totalTokensSpent: number
    lastGenerationDate: string | null
  } | null
}

export function TokenUsageStats({ userId, initialData }: TokenUsageStatsProps) {
  const [timeframe, setTimeframe] = useState("week")
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsageStats() {
      setLoading(true)
      try {
        const response = await fetch(`/api/token-usage-stats?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUsageData(data.usageData || [])
          }
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (initialData) {
      const initialUsageData = [
        {
          name: "Initial",
          tokens: initialData.totalTokensSpent,
          images: initialData.totalImagesGenerated,
        },
      ]
      setUsageData(initialUsageData)
      setLoading(false)
    } else {
      fetchUsageStats()
    }
  }, [userId, timeframe, initialData])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Track your token usage over time</CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[200px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tokens" name="Tokens Used" fill="hsl(var(--primary))" />
                <Bar dataKey="images" name="Images Generated" fill="#e75275" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
