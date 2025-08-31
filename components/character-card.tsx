"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Character } from "@/types/character"

interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isHoveringRef = useRef(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
    isHoveringRef.current = true

    if (videoRef.current && videoRef.current.src && videoRef.current.src !== "about:blank") {
      // Add a small delay to prevent race conditions with rapid mouse movements
      setTimeout(() => {
        if (isHoveringRef.current) {
          videoRef.current?.play().catch((err) => {
            // Only log errors that aren't related to interruption
            if (!err.message.includes("interrupted")) {
              console.error("Video play failed:", err)
            }
          })
        }
      }, 50)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    isHoveringRef.current = false

    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const handleCardClick = () => {
    router.push(`/chat/${character.id}`)
  }

  // Extract age from character data
  const age = character.age || ""

  // Determine if character is new
  const isNew = character.isNew || false

  // Use a regular img tag for Cloudinary images to bypass Next.js Image optimization issues
  const isCloudinaryImage = character.image && character.image.includes("cloudinary.com")

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius)] aspect-[3/4] cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 bg-card text-card-foreground border border-border"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Character Image */}
      <img
        src={
          imageError
            ? "/placeholder.svg?height=400&width=300"
            : character.image || "/placeholder.svg?height=400&width=300"
        }
        alt={character.name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering && character.videoUrl ? "opacity-0" : "opacity-100"}`}
        onError={() => setImageError(true)}
      />

      {/* Character Video (shown on hover) */}
      {character.videoUrl ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
          src={character.videoUrl}
          muted
          loop
          playsInline
        />
      ) : null}

  {/* Gradient Overlay using tokens */}
  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent z-10 pointer-events-none"></div>

      {/* NEW Badge */}
      {isNew && (
        <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm z-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          New
        </div>
      )}

      {/* Character Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-card-foreground z-20">
        <div className="flex items-baseline gap-1.5">
          <h3 className="font-semibold text-lg">{character.name}</h3>
          {age && <span className="text-sm text-muted-foreground">{age}</span>}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{character.description}</p>
      </div>
    </div>
  )
}
