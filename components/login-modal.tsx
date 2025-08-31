"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { AlertCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useAuthModal } from "./auth-modal-context"
import Image from "next/image"
import { useTranslations } from "@/lib/use-translations"

export function LoginModal() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const { t } = useTranslations()
    const { isLoginModalOpen, closeLoginModal, switchToSignup } = useAuthModal()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                window.location.reload()
            } else {
                setError(t("login.invalidCredentials"))
            }
        } catch (err) {
            setError(t("login.loginError"))
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
            <DialogContent className="max-w-3xl p-0 bg-[#1E1E1E] border-[#252525] rounded-lg grid grid-cols-2">
                <div className="relative h-full w-full">
                    <Image
                        src="/login-placeholder.jpeg"
                        alt="Inloggningsbild"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-l-lg"
                    />
                </div>
                <div className="relative p-8">
                    <DialogTitle className="sr-only">{t("auth.login")}</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-transparent hover:bg-black/20 text-white"
                        onClick={closeLoginModal}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">{t("auth.login")}</h1>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email-login"
                                className="block text-sm font-medium text-gray-300"
                            >
                                {t("login.emailLabel")}
                            </label>
                            <Input
                                id="email-login"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-card border-border text-foreground focus:ring-primary focus:border-primary"
                                placeholder={t("login.emailPlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password-login"
                                className="block text-sm font-medium text-gray-300"
                            >
                                {t("login.passwordLabel")}
                            </label>
                            <Input
                                id="password-login"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-card border-border text-foreground focus:ring-primary focus:border-primary"
                                placeholder={t("login.passwordPlaceholder")}
                            />
                                                                                    <div className="text-right">
                                                                                            <Link
                                                                                                href={{ pathname: "/reset-password", query: email ? { email } : {} }}
                                                                                                className="text-sm text-primary hover:underline"
                                                                                                onClick={closeLoginModal}
                                                                                            >
                                                                                                    {t("login.forgotPassword")}
                                                                                            </Link>
                                                                                    </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
                                disabled={isLoading}
                            >
                                {isLoading ? t("login.submitting") : t("auth.login")}
                            </Button>
                        </div>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1E1E1E] px-2 text-muted-foreground">{t("login.orLoginWith")}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-200">
                            Google
                        </Button>
                        <Button variant="outline" className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4]">
                            Discord
                        </Button>
                        <Button variant="outline" className="w-full bg-black text-white border-gray-600 hover:bg-gray-900">
                            X
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            {t("login.noAccount")} {" "}
                            <button onClick={switchToSignup} className="text-primary hover:underline">
                                {t("auth.createAccount")}
                            </button>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}