"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
    {mounted && (
        <Switch
      checked={resolvedTheme === "dark"}
      onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
          className="data-[state=checked]:bg-primary"
          aria-label="Toggle theme"
        />
      )}
      <Moon className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
