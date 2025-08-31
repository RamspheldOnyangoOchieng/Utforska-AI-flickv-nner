import type React from "react"
import "./globals.css"
import "../styles/buttons.css"
import { Poppins } from "next/font/google"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-context"
import { AuthModalProvider } from "@/components/auth-modal-context"
import { AuthModals } from "@/components/auth-modals"
import ClientRootLayout from "./ClientRootLayout"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "DINTYP.SE - Din AI-kompanjon",
  description: "Utforska och chatta med AI-karaktärer på DINTYP.SE",
  icons: {
    icon: [
      {
  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230ea5e9'/%3E%3Ctext x='50' y='55' fontFamily='Arial,sans-serif' fontSize='14' fontWeight='bold' textAnchor='middle' fill='white'%3EDINTYP.SE%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <html lang="sv" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", poppins.variable)}>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <AuthModalProvider>
              <ClientRootLayout>
                <div className="flex-1 flex flex-col">{children}</div>
                <AuthModals />
              </ClientRootLayout>
            </AuthModalProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
// CSS imports are at the top for proper order