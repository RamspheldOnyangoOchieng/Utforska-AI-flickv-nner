"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { signInAnonymously } from "@/lib/auth-utils"

export function EnsureAuth({ children }: { children: React.ReactNode }) {
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await signInAnonymously()
      } catch (error) {
        console.error("Error ensuring authentication:", error)
      } finally {
        setIsAuthChecked(true)
      }
    }

    checkAuth()
  }, [])

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
