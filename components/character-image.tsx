"use client"

import type React from "react"

import { useState, useMemo } from "react"

interface CharacterImageProps {
  imageUrl: string
  character: { name: string }
  className?: string
}

const CharacterImage: React.FC<CharacterImageProps> = ({ imageUrl, character, className = "" }) => {
  const [imageError, setImageError] = useState(false)

  // Check if it's a Cloudinary image
  const isCloudinaryImage = imageUrl && imageUrl.includes("cloudinary.com")

  // Use fallback if image error or no URL
  const finalImageUrl = imageError || !imageUrl ? "/placeholder.svg" : imageUrl

  const memoizedImage = useMemo(() => {
    return (
      <div className={`relative ${className}`}>
        <img
          src={finalImageUrl || "/placeholder.svg"}
          alt={character.name}
          className="character-image w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }, [finalImageUrl, character.name, className])

  return memoizedImage
}

export default CharacterImage
