"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"

interface AdminOnlyPageProps {
  children: ReactNode
  title?: string
}

export function AdminOnlyPage({ children, title }: AdminOnlyPageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("AdminOnlyPage auth state:", { isLoading, isAdmin: user?.isAdmin })
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log("Redirecting to login - not admin")
      router.push("/admin/login")
    }
  }, [user?.isAdmin, isLoading]) // Remove router and use specific user property

  if (isLoading) {
    console.log("AdminOnlyPage showing loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <span className="ml-3">Loading authentication...</span>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return <div className="min-h-screen bg-[#141414] text-white">{children}</div>
}

export default AdminOnlyPage
