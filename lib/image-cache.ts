// Simple in-memory cache for generated images
// In a production app, you might want to use a more robust solution

type ImageCacheEntry = {
  url: string
  timestamp: number
  prompt: string
}

// Cache that maps character IDs to their latest generated image
const imageCache: Record<string, ImageCacheEntry> = {}

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000

export function getCachedImage(characterId: string, prompt: string): string | null {
  const entry = imageCache[characterId]

  // If we have a cached entry that hasn't expired and was generated with the same prompt
  if (entry && Date.now() - entry.timestamp < CACHE_EXPIRATION && entry.prompt === prompt) {
    return entry.url
  }

  return null
}

export function cacheImage(characterId: string, url: string, prompt: string): void {
  imageCache[characterId] = {
    url,
    timestamp: Date.now(),
    prompt,
  }
}
