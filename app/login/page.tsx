"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { useAuthModal } from "@/components/auth-modal-context"

export default function LoginPage() {
    const search = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const { openLoginModal } = useAuthModal()

    const redirectTo = search.get("redirect") || "/"

    useEffect(() => {
        if (user) {
            router.replace(redirectTo)
        }
    }, [user?.id, redirectTo]) // Remove router from dependencies

    return (
        <div className="container max-w-md mx-auto py-12 px-4">
            <Card className="p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">Logga in</h1>
                    <p className="text-muted-foreground">Fortsätt för att komma till {redirectTo}</p>
                </div>
                <Button className="w-full" onClick={openLoginModal}>
                    Öppna inloggningsruta
                </Button>
            </Card>
        </div>
    )
}