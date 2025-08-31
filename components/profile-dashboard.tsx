"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, CreditCard, TrendingUp, User, Calendar, ImageIcon } from "lucide-react"
import { TokenTransactionHistory } from "./token-transaction-history"
import { TokenUsageStats } from "./token-usage-stats"
import { UserProfileInfo } from "./user-profile-info"
import Link from "next/link"


interface ProfileDashboardProps {
  userId: string
}

interface TokenBalance {
  balance: number
}

interface UserStats {
  totalImagesGenerated: number
  totalTokensSpent: number
  lastGenerationDate: string | null
}

export function ProfileDashboard({ userId }: ProfileDashboardProps) {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get authentication headers
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        let headers: HeadersInit = {
          "Content-Type": "application/json",
        }

        // Try to get access token, with fallback to user ID
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        } else {
          // Fallback to user ID header
          headers["X-User-ID"] = userId
        }

        // Fetch token balance for the given userId
        const balanceResponse = await fetch(`/api/user-token-balance?userId=${encodeURIComponent(userId)}`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setTokenBalance(balanceData);
        }

        // Fetch user stats with authentication
        const statsResponse = await fetch("/api/user-usage-stats", {
          headers
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setUserStats(statsData);
        } else {
          console.error("Failed to fetch user stats:", statsResponse.status, statsResponse.statusText);
        }

        // Fetch subscriptions enabled setting
        const settingsResponse = await fetch("/api/settings/subscriptions_enabled");
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSubscriptionsEnabled(settingsData.value);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account, view your token balance, and track your usage.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <div className="text-2xl font-bold text-primary">{tokenBalance?.balance || 0}</div>
          </div>
          <Button asChild>
            <Link href="/premium">
              <CreditCard className="mr-2 h-4 w-4" />
              Top Up Tokens
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-lg border">
          <TabsTrigger value="status">Token Status</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Token Status</CardTitle>
              <CardDescription>Your current token balance and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Balance:</span>
                <Badge variant="secondary" className="text-primary">
                  {tokenBalance?.balance || 0} tokens
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Images Available:</span>
                <span className="font-medium">~{Math.floor((tokenBalance?.balance || 0) / 5)} images</span>
              </div>
              {(tokenBalance?.balance || 0) < 25 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Low token balance! Consider purchasing more tokens to continue generating images.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <TokenUsageStats userId={userId} initialData={userStats} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileInfo userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
