"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/use-translations"
import { useAuth } from "@/components/auth-context"
import { Pencil, Save, X, Plus, Trash } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SiteFooter() {
  const { t } = useTranslations()
  const currentYear = new Date().getFullYear()
  const { user } = useAuth()
  // Derive admin flag if user role metadata is available
  // @ts-ignore optional chaining depending on Supabase user structure
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.role === 'admin'
  const [isEditing, setIsEditing] = useState(false)
  const buildDefaultData = () => ({
    companyName: t("general.siteName"),
    companyDescription: t("footer.companyDescription"),
    contactAddress: "Dintyp",
    features: [
      { id: 1, title: t("footer.features.createImage"), url: "/generate" },
      { id: 2, title: t("footer.features.chat"), url: "/chat" },
      { id: 3, title: t("footer.features.createCharacter"), url: "/characters" },
      { id: 4, title: t("footer.features.gallery"), url: "/collection" },
      { id: 5, title: t("footer.features.explore"), url: "/" },
    ],
    popular: [
      { id: 1, title: t("general.siteName"), url: "/" },
      { id: 2, title: "AI Girlfriend", url: "/characters?category=companion" },
      { id: 3, title: "AI Anime", url: "/characters?category=anime" },
      { id: 4, title: "AI Boyfriend", url: "/characters?category=companion" },
    ],
    legal: [{ id: 1, title: t("footer.legal.termsPolicies"), url: "/terms" }],
    aboutUs: [
      { id: 1, title: t("footer.about.aiGirlfriendChat"), url: "/chat" },
      { id: 2, title: t("footer.about.aiSexting"), url: "/chat?mode=sext" },
      { id: 3, title: t("footer.about.howItWorks"), url: "/#how-it-works" },
      { id: 4, title: t("footer.about.aboutUs"), url: "/about" },
      { id: 5, title: t("footer.about.roadmap"), url: "/#roadmap" },
      { id: 6, title: t("footer.about.blog"), url: "/blog" },
      { id: 7, title: t("footer.about.guide"), url: "/#guide" },
      { id: 8, title: t("footer.about.complaints"), url: "/#complaints" },
      { id: 9, title: t("footer.about.termsPolicies"), url: "/terms" },
    ],
    company: [{ id: 1, title: t("footer.company.weAreHiring"), url: "/careers" }],
  })

  const [footerData, setFooterData] = useState(buildDefaultData())
  const [tempData, setTempData] = useState(footerData)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const { data, error } = await supabase.from("footer_content").select("*").single()

        if (data && !error) {
          setFooterData(data.content)
          setTempData(data.content)
        }
      } catch (error) {
        console.error("Error loading footer data:", error)
      }
    }

    loadFooterData()
  }, [supabase])

  // Rebuild default translated data when language (t reference) changes and not editing
  useEffect(() => {
    if (!isEditing) {
      const rebuilt = buildDefaultData()
      setFooterData(rebuilt)
      setTempData(rebuilt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("footer_content").upsert({
        id: 1,
        content: tempData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setFooterData(tempData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving footer data:", error)
    }
  }

  const handleCancel = () => {
    setTempData(footerData)
    setIsEditing(false)
  }

  const handleResetDefaults = async () => {
    // Rebuild default translated data and remove stored DB row so cache clears
    const defaults = buildDefaultData()
    setFooterData(defaults)
    setTempData(defaults)
    try {
      await supabase.from('footer_content').delete().eq('id', 1)
    } catch (e) {
      console.error('Error clearing footer cache', e)
    }
  }

  const handleAddItem = (section: keyof typeof footerData) => {
    // @ts-ignore - footer sections are arrays in these keys
    setTempData((prev) => ({
      ...prev,
      [section]: [...(prev as any)[section], { id: Date.now(), title: "New Item", url: "/" }],
    }))
  }

  const handleRemoveItem = (section: keyof typeof footerData, id: number) => {
    // @ts-ignore
    setTempData((prev) => ({
      ...prev,
      [section]: (prev as any)[section].filter((item: any) => item.id !== id),
    }))
  }

  const handleItemChange = (section: keyof typeof footerData, id: number, field: string, value: string) => {
    // @ts-ignore
    setTempData((prev) => ({
      ...prev,
      [section]: (prev as any)[section].map((item: any) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const handleTextChange = (field: keyof typeof footerData, value: string) => {
    setTempData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="w-full bg-background text-foreground py-8 sm:py-10 md:py-12 mt-auto rounded-[2px] border border-border">
      {isAdmin && (
        <div className="container mx-auto px-4 md:px-6 py-2 flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <Save size={16} /> {t("general.save")}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <X size={16} /> {t("general.cancel")}
              </button>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <X size={16} /> {t('footer.resetDefaults')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-sm"
            >
              <Pencil size={16} /> {t("footer.editFooter")}
            </button>
          )}
        </div>
      )}
      <div className="container mx-auto px-4 md:px-6">
        {/* Mobile */}
        <div className="md:hidden space-y-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-xl font-bold">
                {t("general.siteName")}<span className="text-primary">.</span>
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm">{t("footer.companyDescription")}</p>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-medium">{t("general.features")}</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/generate" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Skapa bild</Link>
                <Link href="/chat" className="text-muted-foreground hover:text-foreground text-sm transition-colors">{t("general.chat")}</Link>
                <Link href="/characters" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Skapa karaktär</Link>
                <Link href="/collection" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Galleri</Link>
              </div>
            </div>

            {/* Om oss */}
            <div className="space-y-3">
              <h3 className="text-base font-medium">{t("footer.about.title")}</h3>
              <div className="space-y-2">
                <Link href="https://www.dintyp.se/generate" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">Dintyp Generator</Link>
                <Link href="https://www.dintyp.se/premium" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">Premium</Link>
                <Link href="https://dreamgf.ai/" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">DreamGF</Link>
              </div>
            </div>

            {/* Legal and Company */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h3 className="text-base font-medium mb-2">{t("general.legal")}</h3>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms and Policies</Link>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">{t("footer.company.title")}</h3>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground text-sm transition-colors">{t("footer.company.weAreHiring")}</Link>
                </div>
              </div>
            </div>

            {/* Social and Contact */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Sociala medier</h3>
                  <div className="flex space-x-4 text-muted-foreground">
                    <Link href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Discord">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                    </Link>
                    <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Twitter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </Link>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">{t("footer.contact")}</h3>
                  <address className="text-muted-foreground text-xs not-italic">
                    Dintyp Inc.
                    <br />
                    123 AI Boulevard
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.companyName}
                    onChange={(e) => handleTextChange("companyName", e.target.value)}
                    className="bg-muted border border-border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <>
                    Dintyp.se
                    <span className="text-primary">.</span>
                  </>
                )}
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {isEditing ? (
                <textarea
                  value={tempData.companyDescription}
                  onChange={(e) => handleTextChange("companyDescription", e.target.value)}
                  className="bg-muted border border-border rounded px-2 py-1 w-full h-24"
                />
              ) : (
                tempData.companyDescription
              )}
            </p>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">{t("footer.contact") }:</h3>
              <address className="text-muted-foreground text-xs not-italic">
                {isEditing ? (
                  <textarea
                    value={tempData.contactAddress}
                    onChange={(e) => handleTextChange("contactAddress", e.target.value)}
                    className="bg-muted border border-border rounded px-2 py-1 w-full h-24"
                  />
                ) : (
                  tempData.contactAddress.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                )}
              </address>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("general.features")}</h3>
            <ul className="space-y-3">
              {tempData.features.map((item: any) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange("features", item.id, "title", e.target.value)}
                        className="bg-muted border border-border rounded px-2 py-1 flex-1"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleItemChange("features", item.id, "url", e.target.value)}
                        className="bg-muted border border-border rounded px-2 py-1 w-20"
                        placeholder="URL"
                      />
                      <button onClick={() => handleRemoveItem("features", item.id)} className="text-destructive hover:opacity-80">
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link href={item.url} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button onClick={() => handleAddItem("features")} className="flex items-center gap-1 text-primary hover:opacity-80 text-sm">
                    <Plus size={16} /> {t("footer.addItem")}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("general.legal")}</h3>
            <ul className="space-y-3">
              {tempData.legal.map((item: any) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={item.title} onChange={(e) => handleItemChange("legal", item.id, "title", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 flex-1" />
                      <input type="text" value={item.url} onChange={(e) => handleItemChange("legal", item.id, "url", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 w-20" placeholder="URL" />
                      <button onClick={() => handleRemoveItem("legal", item.id)} className="text-destructive hover:opacity-80">
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link href={item.url} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button onClick={() => handleAddItem("legal")} className="flex items-center gap-1 text-primary hover:opacity-80 text-sm">
                    <Plus size={16} /> {t("footer.addItem")}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Om oss */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("footer.about.title")}</h3>
            <ul className="space-y-3">
              {tempData.aboutUs.map((item: any) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={item.title} onChange={(e) => handleItemChange("aboutUs", item.id, "title", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 flex-1" />
                      <input type="text" value={item.url} onChange={(e) => handleItemChange("aboutUs", item.id, "url", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 w-20" placeholder="URL" />
                      <button onClick={() => handleRemoveItem("aboutUs", item.id)} className="text-destructive hover:opacity-80">
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button onClick={() => handleAddItem("aboutUs")} className="flex items-center gap-1 text-primary hover:opacity-80 text-sm">
                    <Plus size={16} /> {t("footer.addItem")}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("footer.company.title")}</h3>
            <ul className="space-y-3">
              {tempData.company.map((item: any) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={item.title} onChange={(e) => handleItemChange("company", item.id, "title", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 flex-1" />
                      <input type="text" value={item.url} onChange={(e) => handleItemChange("company", item.id, "url", e.target.value)} className="bg-muted border border-border rounded px-2 py-1 w-20" placeholder="URL" />
                      <button onClick={() => handleRemoveItem("company", item.id)} className="text-destructive hover:opacity-80">
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link href={item.url} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button onClick={() => handleAddItem("company")} className="flex items-center gap-1 text-primary hover:opacity-80 text-sm">
                    <Plus size={16} /> {t("footer.addItem")}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-xs text-center sm:text-left">© {currentYear} Dintyp.se. {t("footer.rightsReserved")}</div>
          <div className="flex items-center space-x-4 opacity-80">
            <Image src="/visa-logo.svg" alt="Visa" width={60} height={40} className="h-6 sm:h-8 w-auto" />
            <Image src="/mastercard-logo.svg" alt="Mastercard" width={60} height={40} className="h-6 sm:h-8 w-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
