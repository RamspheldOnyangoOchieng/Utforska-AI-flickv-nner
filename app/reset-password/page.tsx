"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import supabase, { hasSupabaseConfig } from "@/lib/supabase"
import { useTranslations } from "@/lib/use-translations"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const router = useRouter()
  const { t } = useTranslations()

  const presetEmail = search.get("email") || ""
  const isUpdate = search.get("update") === "true"

  const [email, setEmail] = useState(presetEmail)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!hasSupabaseConfig) {
      setError(t("reset.missingConfig"))
      return
    }
    if (!email) {
      setError(t("reset.emailRequired"))
      return
    }
    // basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("reset.invalidEmail"))
      return
    }
    setSending(true)
    try {
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?update=true`,
      })
      if (supaError) throw supaError
      setSent(true)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || t("reset.errorGeneric"))
    } finally {
      setSending(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!hasSupabaseConfig) {
      setError(t("reset.missingConfig"))
      return
    }
    if (!password || password.length < 6) {
      setError(t("signup.passwordMinLength"))
      return
    }
    setUpdating(true)
    try {
      const { data, error: supaError } = await supabase.auth.updateUser({ password })
      if (supaError) throw supaError
      setUpdated(true)
      // After a short delay, route to home/login
      setTimeout(() => router.push("/"), 1200)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || t("reset.errorGeneric"))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("reset.title")}</h1>

      {!isUpdate ? (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="block text-sm text-muted-foreground">
              {t("reset.emailLabel")}
            </label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("reset.emailPlaceholder")}
              className="bg-card border-border"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {sent && (
            <div className="text-sm text-emerald-500">
              <p className="font-medium">{t("reset.linkSentTitle")}</p>
              <p>{t("reset.linkSentDescription")}</p>
            </div>
          )}

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? t("reset.sending") : t("reset.sendLink")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm text-muted-foreground">
              {t("reset.newPasswordLabel")}
            </label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("reset.newPasswordPlaceholder")}
              className="bg-card border-border"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {updated && (
            <div className="text-sm text-emerald-500">
              <p className="font-medium">{t("reset.updatedTitle")}</p>
              <p>{t("reset.updatedDescription")}</p>
            </div>
          )}

          <Button type="submit" disabled={updating} className="w-full">
            {updating ? t("reset.updating") : t("reset.updatePassword")}
          </Button>
        </form>
      )}
    </div>
  )
}
