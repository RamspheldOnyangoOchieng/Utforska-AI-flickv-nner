"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-context"
import { createClient } from "@/utils/supabase/client"

interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number
}

interface PremiumPageContent {
  [key: string]: string
}

interface PlanFeature {
  id: string
  feature_key: string
  feature_label_en: string
  feature_label_sv: string
  free_value_en: string
  free_value_sv: string
  premium_value_en: string
  premium_value_sv: string
  sort_order: number
  active: boolean
}

export default function PremiumPage() {
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([])
  const [content, setContent] = useState<PremiumPageContent>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([])
  const [language, setLanguage] = useState<"en" | "sv">("sv")
  const router = useRouter()
  const { user } = useAuth()
  const statusCheckRef = useRef<boolean>(false)
  const [selectedTokenPackageId, setSelectedTokenPackageId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: packagesData, error: packagesError } = await supabase.from("token_packages").select("*")
      if (packagesError) {
        toast.error("Det gick inte att ladda token-paket.")
      } else {
        setTokenPackages(packagesData)
      }

      const { data: contentData, error: contentError } = await supabase.from("premium_page_content").select("*")
      if (contentError) {
        toast.error("Det gick inte att ladda sidans innehåll.")
      } else {
        const formattedContent = contentData.reduce((acc, item) => {
          acc[item.section] = item.content
          return acc
        }, {})
        setContent(formattedContent)
      }

      // Fetch plan features (admin configured). If none, we fall back later.
      const { data: featuresData } = await supabase
        .from("plan_features")
        .select("*")
        .eq("active", true)
        .order("sort_order")

      if (featuresData && featuresData.length) {
        setPlanFeatures(featuresData as PlanFeature[])
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (statusCheckRef.current) return
      statusCheckRef.current = true

      try {
        setIsCheckingStatus(true)
        setStatusError(null)

        if (!user) {
          setIsCheckingStatus(false)
          statusCheckRef.current = false
          return
        }

        try {
          const response = await fetch("/api/check-premium-status")
          const data = await response.json()

          if (data.error) {
            console.error("Premium status error:", data.error)
            setStatusError(`Fel vid kontroll av premiumstatus`)
          }
        } catch (error) {
          console.error("Error checking premium status:", error)
          setStatusError("Det gick inte att kontrollera premiumstatus")
        }
      } finally {
        setIsCheckingStatus(false)
        statusCheckRef.current = false
      }
    }

    checkPremiumStatus()
  }, [user])

  const handleTokenPurchase = async () => {
    if (!selectedTokenPackageId) {
      toast.error("Välj ett token-paket")
      return
    }

    try {
      setIsLoading(true)

      const selectedPackage = tokenPackages.find((pkg) => pkg.id === selectedTokenPackageId)
      if (!selectedPackage) {
        throw new Error("Valt token-paket kunde inte hittas")
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedTokenPackageId,
          userId: user?.id,
          email: user?.email,
          metadata: {
            type: "token_purchase",
            tokens: selectedPackage.tokens,
            price: selectedPackage.price,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Misslyckades att skapa betalningssession")
      }

      window.location.href = data.url
    } catch (error) {
  console.error("Payment error:", error)
  toast.error("Kunde inte genomföra token-köpet. Försök igen.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 2,
    }).format(price)
  }

  if (isCheckingStatus) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Inloggning krävs</h1>
            <p className="text-muted-foreground">Logga in för att få åtkomst till premiumfunktioner</p>
          </div>
          <Button className="w-full" onClick={() => router.push("/login?redirect=/premium")}>
            Logga in
          </Button>
        </Card>
      </div>
    )
  }

  if (statusError) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Fel</h1>
            <p className="text-muted-foreground">Ett fel inträffade vid kontroll av din premiumstatus</p>
            {process.env.NODE_ENV === "development" && <p className="text-xs text-destructive mt-2">{statusError}</p>}
          </div>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Försök igen
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{content.main_title}</h1>
        <p className="text-muted-foreground">{content.main_subtitle}</p>
      </div>

      <Card className="p-8 relative overflow-hidden">
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <div className="mb-8">
              <h2 className="text-primary text-2xl font-bold">{content.token_system_title}</h2>
              <h3 className="text-3xl font-bold mb-2">{content.pay_as_you_go_title}</h3>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: content.purchase_intro || "" }} />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <h4 className="font-medium mb-2">{content.how_tokens_work_title}</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.how_tokens_work_item_1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.how_tokens_work_item_2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.how_tokens_work_item_3}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-5">
            <h3 className="text-xl font-bold mb-4">{content.select_package_title}</h3>
            <div className="space-y-4">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-300 ${selectedTokenPackageId === pkg.id
                    ? "bg-primary text-primary-foreground shadow-lg border-2 border-primary transform scale-[1.02] ring-2 ring-primary/30"
                    : "bg-card hover:bg-primary/5 border border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  onClick={() => setSelectedTokenPackageId(pkg.id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-lg">{pkg.name}</div>
                    {pkg.name === "Super Value" && (
                      <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">BÄST VÄRDE</div>
                    )}
                    {pkg.name === "Standard" && (
                      <div className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">POPULÄR</div>
                    )}
                  </div>

                  <div className="flex items-center mt-1">
                    <span className={`text-3xl font-bold ${selectedTokenPackageId === pkg.id ? "text-white" : ""}`}>
                      {pkg.tokens}
                    </span>
                    <span
                      className={`ml-2 ${selectedTokenPackageId === pkg.id ? "text-white/90" : "text-muted-foreground"}`}
                    >
                      tokens
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <div
                      className={`${selectedTokenPackageId === pkg.id ? "text-white/90" : "text-muted-foreground"} text-sm`}
                    >
                      {Math.floor(pkg.tokens / 5)} bilder
                    </div>
                    <div className="font-bold">{formatPrice(pkg.price)}</div>
                  </div>

                  {selectedTokenPackageId === pkg.id && (
                    <div className="mt-2 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
            <span className="text-sm font-medium">Valt paket</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 h-12 mt-6 transition-all duration-300"
              onClick={handleTokenPurchase}
              disabled={isLoading || !selectedTokenPackageId}
            >
        {isLoading ? "Bearbetar…" : "Köp tokens"}
              {!isLoading && (
                <span className="flex items-center gap-1">
                  <img src="/visa-logo.svg" alt="Visa" className="h-5" />
                  <img src="/mastercard-logo.svg" alt="Mastercard" className="h-5" />
                </span>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground mt-2">
              {selectedTokenPackageId && (
                <>
          Engångsbetalning på{" "}
                  {formatPrice(tokenPackages.find((pkg) => pkg.id === selectedTokenPackageId)?.price || 0)}
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-bold mb-4">{content.value_comparison_title}</h3>
            <div className="space-y-4">
              {(() => {
                if (tokenPackages.length === 0) {
                  return null
                }

                const sortedPackages = [...tokenPackages].sort((a, b) => a.tokens - b.tokens)
                const basePackage = sortedPackages[0]
                const baseCostPerToken = basePackage.price / basePackage.tokens

                return sortedPackages.map((pkg) => {
                  const costPerToken = pkg.price / pkg.tokens
                  const costPerImage = costPerToken * 5
                  const savings = ((baseCostPerToken - costPerToken) / baseCostPerToken) * 100

                  return (
                    <div
                      key={`value-${pkg.id}`}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{pkg.tokens} tokens</div>
                        <div className="text-sm text-muted-foreground">{formatPrice(costPerImage)} per bild</div>
                      </div>
                      {pkg.id !== basePackage.id && savings > 0 && (
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                          Spara {savings.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-medium mb-2">{content.why_buy_tokens_title}</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.why_buy_tokens_item_1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.why_buy_tokens_item_2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>{content.why_buy_tokens_item_3}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center mt-8 space-x-8">
        <div className="flex items-center text-muted-foreground">
          <Shield className="h-5 w-5 mr-2" />
          <span>{content.security_badge_1}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Lock className="h-5 w-5 mr-2" />
          <span>{content.security_badge_2}</span>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-6">
          {language === "sv" ? "Jämförelse: Gratis vs Premium" : "Comparison: Free vs Premium"}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold w-1/3">
                  {language === "sv" ? "Funktion" : "Feature"}
                </th>
                <th className="text-left px-4 py-3 font-semibold w-1/3">
                  {language === "sv" ? "Gratis" : "Free Plan"}
                </th>
                <th className="text-left px-4 py-3 font-semibold w-1/3">
                  {language === "sv" ? "Premium" : "Premium Plan"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(planFeatures.length ? planFeatures : [
                {
                  feature_key: "text_messages",
                  feature_label_en: "Text Messages",
                  feature_label_sv: "Textmeddelanden",
                  free_value_en: "3 free messages",
                  free_value_sv: "3 fria meddelanden",
                  premium_value_en: "Truly Unlimited",
                  premium_value_sv: "Verkligt obegränsat",
                },
                {
                  feature_key: "image_gen_non_nude",
                  feature_label_en: "Image Generation (non-nude)",
                  feature_label_sv: "Bildgenerering (icke-nakna)",
                  free_value_en: "1 free image",
                  free_value_sv: "1 fri bild",
                  premium_value_en: "Unlimited / Higher Quality",
                  premium_value_sv: "Obegränsat / Högre kvalitet",
                },
                {
                  feature_key: "image_gen_nude",
                  feature_label_en: "Image Generation (nude)",
                  feature_label_sv: "Bildgenerering (nakna)",
                  free_value_en: "Blurred",
                  free_value_sv: "Suddig",
                  premium_value_en: "Not blurred",
                  premium_value_sv: "Inte suddig",
                },
                {
                  feature_key: "receiving_images",
                  feature_label_en: "Receiving Images",
                  feature_label_sv: "Ta emot bilder",
                  free_value_en: "1 free image",
                  free_value_sv: "1 fri bild",
                  premium_value_en: "Available",
                  premium_value_sv: "Tillgängligt",
                },
                {
                  feature_key: "receiving_videos_non_nude",
                  feature_label_en: "Receiving Videos (non-nude)",
                  feature_label_sv: "Ta emot videor (icke-nakna)",
                  free_value_en: "1 free video",
                  free_value_sv: "1 fri video",
                  premium_value_en: "Available",
                  premium_value_sv: "Tillgängligt",
                },
                {
                  feature_key: "receiving_videos_nude",
                  feature_label_en: "Receiving Videos (nude)",
                  feature_label_sv: "Ta emot videor (nakna)",
                  free_value_en: "Blurred",
                  free_value_sv: "Suddig",
                  premium_value_en: "Not blurred",
                  premium_value_sv: "Inte suddig",
                },
                {
                  feature_key: "response_time",
                  feature_label_en: "Response Time",
                  feature_label_sv: "Svarstid",
                  free_value_en: "Slower (Lower Priority)",
                  free_value_sv: "Långsammare (lägre prioritet)",
                  premium_value_en: "Faster (Priority Processing)",
                  premium_value_sv: "Snabbare (prioriterad)",
                },
                {
                  feature_key: "image_blur_removal",
                  feature_label_en: "Image Blur Removal",
                  feature_label_sv: "Borttagning av bildsudd",
                  free_value_en: "Not Included",
                  free_value_sv: "Ingår ej",
                  premium_value_en: "Automatic",
                  premium_value_sv: "Automatisk",
                },
                {
                  feature_key: "bot_memory",
                  feature_label_en: "Bot Memory",
                  feature_label_sv: "Bot-minne",
                  free_value_en: "Short",
                  free_value_sv: "Kort",
                  premium_value_en: "Extended/Longer",
                  premium_value_sv: "Förlängt/Längre",
                },
                {
                  feature_key: "active_ai_girlfriends",
                  feature_label_en: "Active AI Girlfriends",
                  feature_label_sv: "Aktiva AI-flickvänner",
                  free_value_en: "One at a Time",
                  free_value_sv: "En åt gången",
                  premium_value_en: "Unlimited",
                  premium_value_sv: "Obegränsat",
                },
                {
                  feature_key: "sending_photos",
                  feature_label_en: "Sending Photos",
                  feature_label_sv: "Skicka foton",
                  free_value_en: "Not Available",
                  free_value_sv: "Inte tillgängligt",
                  premium_value_en: "Available",
                  premium_value_sv: "Tillgängligt",
                },
                {
                  feature_key: "chat_history",
                  feature_label_en: "Chat History",
                  feature_label_sv: "Chatt-historik",
                  free_value_en: "Deleted after 3 days",
                  free_value_sv: "Raderas efter 3 dagar",
                  premium_value_en: "Never Deleted",
                  premium_value_sv: "Aldrig raderas",
                },
                {
                  feature_key: "watermark",
                  feature_label_en: "Watermark on Images",
                  feature_label_sv: "Vattenstämpel på bilder",
                  free_value_en: "Yes",
                  free_value_sv: "Ja",
                  premium_value_en: "No",
                  premium_value_sv: "Nej",
                },
                {
                  feature_key: "support",
                  feature_label_en: "Support",
                  feature_label_sv: "Support",
                  free_value_en: "Standard",
                  free_value_sv: "Standard",
                  premium_value_en: "Priority",
                  premium_value_sv: "Prioriterad",
                },
                {
                  feature_key: "new_feature_access",
                  feature_label_en: "New Feature Access",
                  feature_label_sv: "Tillgång till nya funktioner",
                  free_value_en: "Standard",
                  free_value_sv: "Standard",
                  premium_value_en: "Early Access",
                  premium_value_sv: "Tidigt tillträde",
                },
                {
                  feature_key: "advanced_customization",
                  feature_label_en: "Advanced Customization",
                  feature_label_sv: "Avancerad anpassning",
                  free_value_en: "Limited",
                  free_value_sv: "Begränsad",
                  premium_value_en: "Full",
                  premium_value_sv: "Full",
                },
                {
                  feature_key: "exclusive_features",
                  feature_label_en: "Exclusive Premium Features",
                  feature_label_sv: "Exklusiva premiumfunktioner",
                  free_value_en: "No",
                  free_value_sv: "Nej",
                  premium_value_en: "Potential Future Additions",
                  premium_value_sv: "Potentiella framtida tillägg",
                },
              ]).map((feat, i) => {
                const isDb = !!(feat as any).id
                const key = (feat as any).feature_key || (feat as any).id || i
                const label = language === 'sv'
                  ? (isDb ? (feat as any).feature_label_sv : (feat as any).feature_label_sv)
                  : (isDb ? (feat as any).feature_label_en : (feat as any).feature_label_en)
                const freeVal = language === 'sv'
                  ? (isDb ? (feat as any).free_value_sv : (feat as any).free_value_sv)
                  : (isDb ? (feat as any).free_value_en : (feat as any).free_value_en)
                const premiumVal = language === 'sv'
                  ? (isDb ? (feat as any).premium_value_sv : (feat as any).premium_value_sv)
                  : (isDb ? (feat as any).premium_value_en : (feat as any).premium_value_en)
                return (
                  <tr key={key} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{label}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm align-top">{freeVal}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm align-top font-semibold text-primary">{premiumVal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground text-center">
          {language === 'sv'
            ? "Funktioner och begränsningar kan ändras. Aktuella värden styrs av administratören."
            : "Features & limits may change. Live values are controlled by the administrator."}
        </p>
      </div>
    </div>
  )
}
