"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-destructive/10">
      <div className="max-w-2xl w-full text-center space-y-8 backdrop-blur-sm bg-card/80 rounded-xl shadow-xl p-8 border border-border relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-destructive/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-destructive/10 blur-3xl"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-block relative">
            <AlertTriangle className="h-24 w-24 text-destructive mx-auto animate-pulse" />
          </div>

          <h2 className="text-3xl font-semibold text-foreground">Something Went Wrong</h2>

          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground text-lg">Our AI characters encountered an unexpected error.</p>
            {error.digest && <p className="text-sm text-muted-foreground mt-2">Error ID: {error.digest}</p>}
          </div>
        </div>

        <div className="relative w-full my-8 p-6 bg-card/50 border border-border rounded-lg">
          <p className="text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={reset} size="lg" variant="default" className="group">
              <RefreshCw className="mr-2 h-5 w-5 group-hover:animate-spin" />
              Try Again
            </Button>

            <Button asChild size="lg" variant="outline" className="group">
              <Link href="/">
                <Home className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Return Home
              </Link>
            </Button>

            <Button variant="ghost" size="lg" onClick={() => window.history.back()} className="group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
