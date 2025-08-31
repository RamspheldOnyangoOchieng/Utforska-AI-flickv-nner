"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// Simple in-memory cache to prevent duplicate saves
const saveCache = new Map<string, boolean>()

export async function saveGeneratedImage(imageUrl: string, prompt: string) {
  try {
    // Create a cache key from the image URL and prompt
    const cacheKey = `${imageUrl}_${prompt}`

    // Check if this image was recently saved
    if (saveCache.has(cacheKey)) {
      return { success: false, error: "Image already being saved" }
    }

    // Add to cache to prevent duplicate saves
    saveCache.set(cacheKey, true)

    // Set a timeout to remove from cache after 1 minute
    setTimeout(() => {
      saveCache.delete(cacheKey)
    }, 60000)

    const supabaseAdmin = await createAdminClient()

    // First, check if this image already exists in the database
    const { data: existingImage } = await supabaseAdmin
      .from("generated_images")
      .select("id")
      .eq("image_url", imageUrl)
      .maybeSingle()

    if (existingImage) {
      return { success: false, error: "Image already saved" }
    }

    // Save the image to Cloudinary via our API
    const response = await fetch("/api/save-to-cloudinary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "Failed to save image to Cloudinary" }
    }

    const { secureUrl } = await response.json()

    // Save to database with anonymous ID
    const { data, error } = await supabaseAdmin
      .from("generated_images")
      .insert({
        image_url: secureUrl,
        prompt,
        user_id: "anonymous", // Use a special anonymous ID
      })
      .select()

    if (error) {
      console.error("Error saving image to database:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the collections page
    revalidatePath("/collections")

    return { success: true, data }
  } catch (error) {
    console.error("Error in saveGeneratedImage:", error)
    return { success: false, error: "Failed to save image" }
  } finally {
    // Ensure we clean up the cache even if there's an error
    setTimeout(() => {
      saveCache.delete(`${imageUrl}_${prompt}`)
    }, 60000)
  }
}
