"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { Coins } from "lucide-react"

interface TokenBalanceDisplayProps {
  className?: string
  showIcon?: boolean
  iconSize?: number
  textSize?: "xs" | "sm" | "base" | "lg" | "xl"
  refreshInterval?: number | null
}

export function TokenBalanceDisplay({
  className = "",
  showIcon = true,
  iconSize = 16,
  textSize = "sm",
  refreshInterval = 60000, // 1 minute by default, null for no refresh
}: TokenBalanceDisplayProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const fetchBalance = async () => {
    if (!user) {
      setBalance(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user-token-balance")

      if (!response.ok) {
        throw new Error("Failed to fetch token balance")
      }

      const data = await response.json()

      if (data.success) {
        setBalance(data.balance)
      } else {
        console.error("Error fetching token balance:", data.error)
        setBalance(null)
      }
    } catch (error) {
      console.error("Error fetching token balance:", error)
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()

    // Set up refresh interval if specified
    let intervalId: NodeJS.Timeout | null = null

    if (refreshInterval && user) {
      intervalId = setInterval(fetchBalance, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [user?.id, refreshInterval])

  // Text size classes
  const textSizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[textSize]

  if (!user || balance === null) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
  {showIcon && <Coins size={iconSize} className="text-primary" />}
      <span className={`font-medium ${textSizeClass}`}>{isLoading ? "..." : balance} tokens</span>
    </div>
  )
}
