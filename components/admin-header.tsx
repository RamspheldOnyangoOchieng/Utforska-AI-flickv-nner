"use client"

import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-end">
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </header>
    )
}