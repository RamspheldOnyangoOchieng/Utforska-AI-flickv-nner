"use client"

import AppSidebar from "@/components/app-sidebar"
import { BannerProvider } from "@/components/banner-context"
import { CharacterProvider } from "@/components/character-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { ImageSuggestionsProvider } from "@/components/image-suggestions-context"
import { LanguageProvider } from "@/components/language-context"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { SiteProvider } from "@/components/site-context"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsLoader } from "@/components/use-consent"
import { usePathname } from "next/navigation"
import type React from "react"
import "./globals.css"

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  const pathname = usePathname()

  const noHeaderPaths = ["/chat", "/generate", "/premium", "/affiliate", "/admin"]
  const showHeader = !noHeaderPaths.some((path) => pathname.startsWith(path))

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
    <div className={`flex-1 transition-all duration-300 ease-in-out ${isOpen ? "md:ml-64" : "md:ml-16"}`}>
  {/* <AnalyticsLoader /> */}
  {showHeader && <SiteHeader />}
  <ErrorBoundary>{children}</ErrorBoundary>
  <SiteFooter />
      </div>
    </div>
  )
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <LanguageProvider>
        <SidebarProvider>
          <CharacterProvider>
            <BannerProvider>
              <ImageSuggestionsProvider>
                <RootLayoutContent>{children}</RootLayoutContent>
              </ImageSuggestionsProvider>
            </BannerProvider>
          </CharacterProvider>
        </SidebarProvider>
      </LanguageProvider>
    </SiteProvider>
  )
}
