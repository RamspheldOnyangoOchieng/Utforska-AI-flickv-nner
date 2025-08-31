"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ImageIcon, Crown, Moon, Sun, User } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useTheme } from "next-themes"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Don't show the mobile nav on chat pages
  if (pathname?.startsWith("/chat")) {
    return null
  }

  // Always point to non-localized routes (landing page is "/").
  // Normalize current path by stripping any leading /sv or /en so active states still work.
  const normalizedPath = (pathname || "/").replace(/^\/(sv|en)(?=\/|$)/, "") || "/"
  const homeHref = "/"
  const isActive = (p: string) => normalizedPath === p || normalizedPath.startsWith(`${p}/`)

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card border-t border-border p-2">
        <div className="flex justify-around items-center">
          <Link href={homeHref} className="flex flex-col items-center p-2">
            <Home className={`h-6 w-6 ${pathname === homeHref ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${pathname === homeHref ? "text-primary" : "text-muted-foreground"} mt-1`}>Hem</span>
          </Link>
          <Link href="/generate" className="flex flex-col items-center p-2">
            <ImageIcon className={`h-6 w-6 ${isActive("/generate") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${isActive("/generate") ? "text-primary" : "text-muted-foreground"} mt-1`}>
              Skapa bild
            </span>
          </Link>
          <Link href="/premium" className="flex flex-col items-center p-2">
            <Crown className={`h-6 w-6 ${isActive("/premium") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${isActive("/premium") ? "text-primary" : "text-muted-foreground"} mt-1`}>Premium</span>
          </Link>
          <button onClick={toggleTheme} className="flex flex-col items-center p-2">
            {!mounted ? null : resolvedTheme === "dark" ? (
              <>
                <Moon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Mörk</span>
              </>
            ) : (
              <>
                <Sun className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Ljus</span>
              </>
            )}
          </button>
          <Link href="/profile" className="flex flex-col items-center p-2">
            <User className={`h-6 w-6 ${isActive("/profile") ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${isActive("/profile") ? "text-primary" : "text-muted-foreground"} mt-1`}>
              Profil
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
