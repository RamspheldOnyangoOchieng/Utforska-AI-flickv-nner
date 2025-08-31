"use client"

import { useSite } from "@/components/site-context"
import { type TranslationKey, translations } from "./translations"

export function useTranslations() {
  const { settings } = useSite()
  const language = settings.language || "sv"

  const t = (key: TranslationKey): string => {
  return translations[language][key] || translations.sv[key] || key
  }

  return { t, language }
}
