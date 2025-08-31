"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, CreditCard, Home, Settings, Users, Image, MessageSquare, DollarSign, FileText, Package, Gem } from "lucide-react"
import { cn } from "@/lib/utils"

// Make sure the Settings link is pointing to the correct path
const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Characters", href: "/admin/dashboard/characters", icon: MessageSquare },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Image Suggestions", href: "/admin/dashboard/image-suggestions", icon: Image },
  { name: "Banners", href: "/admin/dashboard/banners", icon: BarChart },
  // { name: "Subscriptions", href: "/admin/dashboard/subscriptions", icon: CreditCard },
  // { name: "Payment Methods", href: "/admin/payment-methods", icon: CreditCard },
  // { name: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { name: "Token Packages", href: "/admin/dashboard/token-packages", icon: Package },
  { name: "Premium Content", href: "/admin/dashboard/premium-content", icon: Gem },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Legal", href: "/admin/dashboard/documents", icon: FileText },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-semibold text-xl">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-accent-foreground" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Home className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </div>
  )
}
