"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export type ImageSuggestion = {
  id: string
  name: string
  category: string
  image: string
  is_active: boolean
  created_at?: string
}

export async function getImageSuggestions(): Promise<ImageSuggestion[]> {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data, error } = await supabase
      .from("image_suggestions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching image suggestions:", error)
      throw new Error(error.message)
    }

    return data || []
  } catch (err) {
    console.error("Failed to fetch image suggestions:", err)
    return []
  }
}

export async function getImageSuggestionsByCategory(category: string): Promise<ImageSuggestion[]> {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data, error } = await supabase
      .from("image_suggestions")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching image suggestions by category:", error)
      throw new Error(error.message)
    }

    return data || []
  } catch (err) {
    console.error("Failed to fetch image suggestions by category:", err)
    return []
  }
}
