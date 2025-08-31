"use client"

import { useState, useEffect } from "react"
import { Coins } from "lucide-react"

interface UserTokenBalanceProps {
    userId: string
    className?: string
    showIcon?: boolean
    iconSize?: number
    textSize?: "xs" | "sm" | "base" | "lg" | "xl"
}

export function UserTokenBalance({
    userId,
    className = "",
    showIcon = true,
    iconSize = 16,
    textSize = "sm",
}: UserTokenBalanceProps) {
    const [balance, setBalance] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBalance = async () => {
            if (!userId) {
                setBalance(null)
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`/api/user-token-balance?userId=${userId}`)

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

        fetchBalance()
    }, [userId])

    const textSizeClass = {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
    }[textSize]

    if (isLoading) {
        return <span className={`text-xs ${className}`}>Loading...</span>
    }

    if (balance === null) {
        return <span className={`text-xs text-red-500 ${className}`}>Error</span>
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {showIcon && <Coins size={iconSize} className="text-primary" />}
            <span className={`font-medium ${textSizeClass}`}>{balance} tokens</span>
        </div>
    )
}