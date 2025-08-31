"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Users, Settings, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const mobileNavItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    href: "/admin/dashboard/characters",
    icon: MessageSquare,
    title: "Characters",
  },
  {
    href: "/admin/dashboard/users",
    icon: Users,
    title: "Users",
  },
  {
    href: "/admin/dashboard/subscriptions",
    icon: CreditCard,
    title: "Billing",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "Settings",
  },
]

export default function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <>
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(`${item.href}/`))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-3 space-y-1 rounded-lg transition-all duration-200 min-w-0 flex-1",
              isActive
                ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105",
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="text-xs font-medium truncate">{item.title}</span>
          </Link>
        )
      })}
    </>
  )
}
