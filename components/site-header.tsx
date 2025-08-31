"use client"

import { useCharacters } from "@/components/character-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserTokenBalance } from "@/components/user-token-balance"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "./auth-context"

export function SiteHeader() {
  const { activeType, setActiveType } = useCharacters()
  const { user } = useAuth()
  const characterTypes = ["Tjejer", "Anime", "Kille"]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Character Type Tabs */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary p-1">
            {characterTypes.map(type => (
              <Button
                key={type}
                variant={activeType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveType(type)}
                className="rounded-full"
              >
                {type === "Tjejer" && <span className="mr-1.5 text-primary">♀</span>}
                {type === "Anime" && <span className="mr-1.5">⭐</span>}
                {type === "Kille" && <span className="mr-1.5 text-secondary">♂</span>}
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          {user && <UserTokenBalance userId={user.id} />}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/90">Hej, {user.username || ""}!</span>
              <UserNav />
            </div>
          ) : (
            <UserNav />
          )}
        </div>
      </div>
    </header>
  )
}
