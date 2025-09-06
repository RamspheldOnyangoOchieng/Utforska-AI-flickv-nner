"use client"

import { Button } from "@/components/ui/button"
import PromotionalBanner from "@/components/promotional-banner"
import { useCharacters } from "@/components/character-context"
import { useState, useEffect, Suspense } from "react"
import { ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { CharacterGrid } from "@/components/character-grid"
import { CompanionExperienceSection } from "@/components/companion-experience-section"
import { FAQSection } from "@/components/faq-section"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"
import LandingDisclaimerModal from "@/components/landing-disclaimer-modal"
import { CONSENT_VERSION, POLICY_VERSION, CONSENT_STORAGE_KEY } from "@/lib/consent-config"

export default function Home() {
  const { characters, isLoading } = useCharacters()
  const { t } = useTranslations()

  // Filter characters based on the active type (case-insensitive)
  const { activeType } = useCharacters()
  const filteredCharacters = characters.filter((char) => {
    if (activeType === "All") return true
    // Convert both to lowercase for case-insensitive comparison
    const charCategory = (char.category || "").toLowerCase()
    const activeTypeLC = activeType.toLowerCase()
    return charCategory.includes(activeTypeLC)
  })

  const [modalOpen, setModalOpen] = useState(true)
  const [lang, setLang] = useState("sv") // or "en" based on user preference
  const [cookiePrefs, setCookiePrefs] = useState<{analytics: boolean; marketing: boolean} | null>(null)
  // Using centralized consent versioning

  // Load saved consent, but require current version
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.timestamp && parsed.version === CONSENT_VERSION && parsed.policyVersion === POLICY_VERSION) {
          setCookiePrefs(parsed.preferences);
          setModalOpen(false);
        } else {
          // Old version or missing version -> force re-consent
          setModalOpen(true)
        }
      }
    } catch {}
  }, [])

  const persist = (prefs: {analytics: boolean; marketing: boolean}, full?: any) => {
    try {
      const payload = full || { version: CONSENT_VERSION, policyVersion: POLICY_VERSION, timestamp: Date.now(), preferences: prefs, confirmations: { age: true, terms: true } }
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
    } catch {}
  }

  const handleConfirm = (prefs: {analytics: boolean; marketing: boolean}, full?: any) => {
    persist(prefs, full)
    setCookiePrefs(prefs)
    setModalOpen(false)
  }
  const handleCookieSettings = () => { setModalOpen(true) }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Content Area */}
      <main className="flex-1">
  {/* Featured Promotional Banner */}
        <PromotionalBanner />

        <div className="mt-6 mb-4 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold">
            <span className="text-primary">{t("general.explore")}</span>
          </h2>
        </div>

        <div className="space-y-4">
          <Suspense fallback={<div>Loading characters...</div>}>
            <CharacterGrid characters={filteredCharacters || []} />
          </Suspense>
        </div>

        {/* Add the FAQ Section */}
        <FAQSection />

        {/* Add the Companion Experience Section */}
        <CompanionExperienceSection />

        {/* Anchor sections moved to bottom just before footer for better layout */}
        <section id="how-it-works" className="mx-auto max-w-5xl px-4 md:px-6 py-20 border-t border-border scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4">Hur det fungerar</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Skapa ett konto, utforska karaktärer eller generera din egen. Börja chatta direkt – konversationer utvecklas dynamiskt och din AI minns preferenser när du återkommer.</p>
          <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
            <li>Registrera dig eller logga in.</li>
            <li>Välj eller skapa en AI-karaktär.</li>
            <li>Chatta, generera bilder eller be om röst/video.</li>
            <li>Spara favoriter och anpassa personligheten.</li>
            <li>Uppgradera för obegränsade och snabbare interaktioner.</li>
          </ol>
        </section>
        <section id="roadmap" className="mx-auto max-w-5xl px-4 md:px-6 py-20 border-t border-border scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4">Roadmap</h2>
            <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
              <li><span className="font-medium text-foreground">Q1:</span> Förbättrad röstchatt & adaptivt minne.</li>
              <li><span className="font-medium text-foreground">Q2:</span> Video-avatar rendering & förbättrad moderation.</li>
              <li><span className="font-medium text-foreground">Q3:</span> Realtids flerpartschat & mobilappar.</li>
              <li><span className="font-medium text-foreground">Q4:</span> Offline-läge och privat edge-inferens.</li>
            </ul>
        </section>
        <section id="guide" className="mx-auto max-w-5xl px-4 md:px-6 py-20 border-t border-border scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4">Guide</h2>
          <p className="text-muted-foreground mb-4">Snabbstart för nya användare. Så här får du ut mest av plattformen:</p>
          <div className="grid md:grid-cols-2 gap-6 text-sm md:text-base">
            <div>
              <h3 className="font-semibold mb-2">Chatta smart</h3>
              <p>Var specifik i dina önskemål. Be om stil, ton eller scenario för mer träffsäkra svar.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Säkra interaktioner</h3>
              <p>Rapportera olämpligt innehåll. Våra filter skyddar men feedback förbättrar allt.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Generera bilder</h3>
              <p>Använd korta tydliga fraser. Kombinera attribut ("mjuk belysning", "porträtt", "anime-stil").</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Personalisera</h3>
              <p>Justera personlighet och bakgrund för att förbättra konsekvens i dialogen över tid.</p>
            </div>
          </div>
        </section>
        <section id="complaints" className="mx-auto max-w-5xl px-4 md:px-6 py-20 border-t border-border scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4">Klagomål & Innehållsborttagning</h2>
          <p className="text-muted-foreground mb-6">Vill du rapportera ett problem, felaktigt innehåll eller begära borttagning? Kontakta oss så hanterar vi ärendet skyndsamt.</p>
          <div className="space-y-2 text-sm md:text-base">
            <p>Email: <a href="mailto:support@dintyp.se" className="text-primary hover:underline">support@dintyp.se</a></p>
            <p>Ange länk/ID för innehållet och kort beskrivning av problemet.</p>
            <p>Akuta ärenden (säkerhet/missbruk) prioriteras inom 24 timmar.</p>
          </div>
        </section>
      </main>

      {/* Site footer is rendered globally in ClientRootLayout */}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 md:hidden">
        <Link href="/" className="flex flex-col items-center p-2 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs mt-1">{t("general.explore")}</span>
        </Link>
        <Link href="/generate" className="flex flex-col items-center p-2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xs mt-1">{t("general.generate")}</span>
        </Link>
        <Link href="/create" className="flex flex-col items-center p-2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs mt-1">{t("general.create")}</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center p-2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="text-xs mt-1">{t("general.chat")}</span>
        </Link>
        <Link href="/premium" className="flex flex-col items-center p-2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <span className="text-xs mt-1">{t("general.premium")}</span>
        </Link>
      </nav>

      <LandingDisclaimerModal
        open={modalOpen}
        onConfirm={handleConfirm}
        onCookieSettings={handleCookieSettings}
  initialPreferences={cookiePrefs || undefined}
  lang={lang as "en" | "sv"}
      />
    </div>
  )
}
