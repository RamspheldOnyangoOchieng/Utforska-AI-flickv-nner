"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Trash2, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-context"

type FAQ = {
  id: string
  question: string
  answer: string
  created_at: string
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: "1",
    question: "Vad är DINTYP.SE?",
    answer:
      "DINTYP.SE är en plattform för uppslukande upplevelser med AI-kompanjoner. Den låter användare skapa, anpassa och interagera med AI-karaktärer som kan föra samtal, generera bilder och erbjuda sällskap.",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    question: "Är DINTYP.SE legitim och säker?",
    answer:
      "Ja, DINTYP.SE prioriterar användarsäkerhet och integritet. Alla konversationer skyddas med SSL-kryptering och vi erbjuder valfri tvåfaktorsautentisering för att hålla ditt konto säkert. Din personliga information och dina interaktioner förblir privata.",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    question: "Vad är en AI-kompanjon och kan jag skapa en egen?",
    answer:
      "En AI-kompanjon är en digital partner som kan prata, reagera, flirta och knyta an till dig i realtid. Du kan skapa din egen kompanjon från grunden eller välja bland många befintliga karaktärer utformade för olika sinnesstämningar och personligheter.",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    question: "Kan jag be om bilder, videor och röst?",
    answer:
      "Ja, din kompanjon kan skicka selfies, generera anpassade videor eller svara med sin röst. Du kan be om specifika kläder, unika poser eller lekfulla scenarier som matchar din fantasi.",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    question: "Hur visas betalningar på mina kontoutdrag?",
    answer:
      "Vi värnar om din integritet. Betalningar hanteras diskret så att inget på ditt kontoutdrag avslöjar din upplevelse.",
    created_at: new Date().toISOString(),
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [isAddingFAQ, setIsAddingFAQ] = useState(false)
  const [isDeletingFAQ, setIsDeletingFAQ] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Get user and admin status from auth context
  const { user } = useAuth()
  const isAdmin = user?.isAdmin || false

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setIsLoading(true)

      // Use the API route to fetch FAQs
      const response = await fetch("/api/admin/faqs")
      const result = await response.json()

      if (response.ok && result.data) {
        setFaqs(result.data.length > 0 ? result.data : DEFAULT_FAQS)
      } else {
        console.error("Error fetching FAQs:", result.error)
        setFaqs(DEFAULT_FAQS)
      }
    } catch (error) {
      console.error("Error:", error)
      setFaqs(DEFAULT_FAQS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return

    try {
      setIsAddingFAQ(true)

      // Use the API route to add FAQ
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: "Fel",
          description: result.error || "Det gick inte att lägga till FAQ",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Klart",
        description: "FAQ har lagts till",
      })
      setNewQuestion("")
      setNewAnswer("")
      setShowAddForm(false)
      fetchFAQs() // Refresh the list
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Fel",
        description: "Ett oväntat fel inträffade",
        variant: "destructive",
      })
    } finally {
      setIsAddingFAQ(false)
    }
  }

  const handleDeleteFAQ = async (id: string) => {
  if (!confirm("Är du säker på att du vill radera denna FAQ?")) return

    try {
      setIsDeletingFAQ(true)

      // Use the API route to delete FAQ
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        toast({
          title: "Fel",
          description: result.error || "Det gick inte att radera FAQ",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Klart",
        description: "FAQ raderades",
      })
      fetchFAQs() // Refresh the list
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Fel",
        description: "Ett oväntat fel inträffade",
        variant: "destructive",
      })
    } finally {
      setIsDeletingFAQ(false)
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full bg-gray-100 dark:bg-zinc-900 py-8 sm:py-12 md:py-16 px-4 border-t border-b border-gray-200 dark:border-zinc-800 rounded-[2px]">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white">
            <span className="text-zinc-800 dark:text-white">DINTYP.SE</span>{" "}
            <span className="text-orange">Vanliga frågor</span>
          </h2>

          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "Avbryt" : "Lägg till FAQ"}
            </button>
          )}
        </div>

        {/* Admin Add FAQ Form */}
        {isAdmin && showAddForm && (
          <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-medium mb-3 text-zinc-800 dark:text-white">Lägg till ny FAQ</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newQuestion"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Fråga
                </label>
                <input
                  type="text"
                  id="newQuestion"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white"
                  placeholder="Ange ny FAQ-fråga"
                />
              </div>

              <div>
                <label htmlFor="newAnswer" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Svar
                </label>
                <textarea
                  id="newAnswer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white min-h-[100px]"
                  placeholder="Ange svar för den nya FAQ:n"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddFAQ}
                  disabled={!newQuestion.trim() || !newAnswer.trim() || isAddingFAQ}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isAddingFAQ ? (
                    <>
                      <span className="mr-2">Lägger till...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    "Lägg till FAQ"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">Inga vanliga frågor tillgängliga just nu.</div>
        ) : (
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div
                key={item.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950"
              >
                <div className="flex justify-between items-center w-full">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex-1 flex justify-between items-center p-4 text-left focus:outline-none"
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-base sm:text-lg font-medium text-zinc-800 dark:text-white">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${openIndex === index ? "transform rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteFAQ(item.id)}
                      className="p-4 text-red-500 hover:text-red-600 focus:outline-none"
                      aria-label="Radera FAQ"
                      disabled={isDeletingFAQ}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="p-4 pt-0 text-sm sm:text-base text-zinc-600 dark:text-zinc-300">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
