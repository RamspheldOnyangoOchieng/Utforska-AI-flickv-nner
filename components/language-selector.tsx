"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-context"

export function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <Button variant={language === "en" ? "default" : "outline"} size="sm" onClick={() => changeLanguage("en")}>
        EN
      </Button>
      <Button variant={language === "sv" ? "default" : "outline"} size="sm" onClick={() => changeLanguage("sv")}>
        SV
      </Button>
    </div>
  )
}
