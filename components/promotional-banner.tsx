"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBanners } from "@/components/banner-context"

export default function PromotionalBanner() {
  const { banners, isLoading } = useBanners()
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  // Only show active banners
  const activeBanners = banners.filter((banner) => banner.isActive)

  // Function to navigate to the next banner
  const nextBanner = () => {
    if (activeBanners.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length)
  }

  // Function to navigate to the previous banner
  const prevBanner = () => {
    if (activeBanners.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeBanners.length) % activeBanners.length)
  }

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return

    const interval = setInterval(() => {
      nextBanner()
    }, 5000)

    return () => clearInterval(interval)
  }, [activeBanners.length])

  // If loading or no banners, don't render anything
  if (isLoading || activeBanners.length === 0) return null

  const currentBanner = activeBanners[currentIndex]

  // Normalize any provided URL so we never navigate off-site.
  // If the URL is external or invalid, default to the landing page ('/').
  const getInternalTarget = (url?: string) => {
    if (!url) return "/"
    try {
      // Allow explicit internal paths
      if (url.startsWith("/")) return url
      // Resolve absolute URLs relative to current origin and compare
      const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost")
      if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
        const path = parsed.pathname + parsed.search + parsed.hash
        return path || "/"
      }
      return "/"
    } catch {
      return "/"
    }
  }

  // Handle banner click (instead of using Link)
  const handleBannerClick = () => {
    const target = getInternalTarget(currentBanner.linkUrl)
    router.push(target)
  }

  return (
    <div className="w-full max-w-[1222px] mx-auto mb-8 overflow-hidden rounded-xl border border-border">
      <div className="relative h-[244px]">
        {/* Clickable Banner Area */}
        <div
          className={`absolute inset-0 z-10 cursor-pointer`}
          onClick={handleBannerClick}
        >
          {/* Banner Image */}
          <div className="absolute inset-0">
            <img
              src={currentBanner.imageUrl || "/placeholder.svg"}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Banner Content Overlay */}
          {(currentBanner.title || currentBanner.subtitle) && (
            <div className="absolute inset-0 flex flex-col justify-center px-12 rounded-[22px]">
              {currentBanner.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">{currentBanner.title}</h2>
              )}
              {currentBanner.subtitle && (
                <p className="text-lg md:text-xl text-white drop-shadow-lg">{currentBanner.subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Banner Button - Optional */}
        {currentBanner.buttonText && currentBanner.buttonLink && (
          <div className="absolute bottom-8 right-8 z-20">
            <Link href={getInternalTarget(currentBanner.buttonLink)}>
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-full"
                onClick={(e) => e.stopPropagation()} // Prevent triggering the banner click
              >
                {currentBanner.buttonText}
              </Button>
            </Link>
          </div>
        )}

        {/* Navigation Arrows - Only show if there are multiple banners */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevBanner()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-20"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextBanner()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-20"
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicator Dots - Only show if there are multiple banners */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {activeBanners.map((_, index) => (
              <div
                key={index}
                className={`h-2 ${index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/50"} rounded-full transition-all duration-300 cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
