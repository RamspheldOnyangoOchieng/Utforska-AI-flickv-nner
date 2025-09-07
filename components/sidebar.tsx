"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"
import { useSite } from "@/components/site-context"
import { Home, MessageSquare, ImageIcon, Settings, Crown, ChevronLeft, LogOut, User, FolderHeart } from "lucide-react"
import { useAuth } from "@/components/auth-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const { user, logout } = useAuth()
  const { settings } = useSite()
  const [isAdmin, setIsAdmin] = useState(false)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)

  // Check if user is admin
  useEffect(() => {
    if (user && user.isAdmin) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user?.isAdmin])

  // Fetch subscriptions enabled setting
  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/settings/subscriptions_enabled")
      if (response.ok) {
        const data = await response.json()
        setSubscriptionsEnabled(Boolean(data.value))
      }
    }

    fetchSettings()
  }, [])

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  // Don't render the main sidebar on admin pages
  if (isAdminPage) {
    return null
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] border-r border-[#252525] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#252525] flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">{settings.logoText}</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-2 px-2">
            <Link href="/">
              <Button variant="ghost" className={`w-full justify-start ${pathname === "/" ? "bg-[#252525]" : ""}`}>
                <Home className="mr-2 h-5 w-5" />
                Hem
              </Button>
            </Link>
            <Link href="/create-character">
              <Button
                variant="ghost"
                className={`w-full justify-start ${pathname?.startsWith("/create-character") ? "bg-[#252525]" : ""}`}
              >
                <span className="mr-2 text-lg">🧬</span>
                Skapa karaktär
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="ghost"
                className={`w-full justify-start ${pathname?.startsWith("/chat") ? "bg-[#252525]" : ""}`}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chatt
              </Button>
            </Link>
            <Link href="/generate">
              <Button
                variant="ghost"
                className={`w-full justify-start ${pathname?.startsWith("/generate") ? "bg-[#252525]" : ""}`}
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Generera
              </Button>
            </Link>
            <Link href="/collection">
              <Button
                variant="ghost"
                className={`w-full justify-start ${pathname?.startsWith("/collection") ? "bg-[#252525]" : ""}`}
              >
                <FolderHeart className="mr-2 h-5 w-5" />
                Samling
              </Button>
            </Link>
            <Link href="/premium">
              <Button
                variant="ghost"
                className={`w-full justify-start ${pathname?.startsWith("/premium") ? "bg-[#252525]" : ""}`}
              >
                <Crown className="mr-2 h-5 w-5 text-primary" />
                {subscriptionsEnabled ? "Premium" : "Lägg till kredit"}
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-5 w-5" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#252525]">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center mr-2">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Logga in
                </Button>
              </Link>
              <Link href="/signup" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Skapa konto</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
