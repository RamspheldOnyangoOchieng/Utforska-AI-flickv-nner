"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-context"

export default function AffiliatePage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { user } = useAuth()

    const handleAffiliateApplication = async () => {
        if (!user) {
            toast.error("Logga in för att ansöka till partnerprogrammet.")
            router.push("/login?redirect=/affiliate")
            return
        }

        setIsLoading(true)
        toast.info("Skickar in din ansökan…")

        // Simulate an API call to submit the application
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Din ansökan har skickats! Vi återkommer snart.")
        }, 2000)
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Gå med i vårt partnerprogram</h1>
                <p className="text-muted-foreground">Tjäna pengar genom att marknadsföra våra produkter.</p>
            </div>

            <Card className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Varför gå med?</h2>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start">
                                <span className="text-primary mr-2">✔</span>
                                <span>Konkurrenskraftiga provisionsnivåer.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">✔</span>
                                <span>Högkvalitativa produkter som säljer sig själva.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">✔</span>
                                <span>Dedikerat supportteam för partners.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">✔</span>
                                <span>Spårning och rapportering i realtid.</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Så här fungerar det</h2>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>Registrera dig för vårt partnerprogram.</li>
                            <li>Få din unika referenslänk.</li>
                            <li>Dela länken med din publik.</li>
                            <li>Tjäna provision för varje försäljning via din länk.</li>
                        </ol>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Button
                        className="w-full max-w-xs bg-primary hover:bg-primary/90 text-white"
                        onClick={handleAffiliateApplication}
                        disabled={isLoading}
                    >
                        {isLoading ? "Skickar…" : "Ansök nu"}
                    </Button>
                </div>
            </Card>
        </div>
    )
}