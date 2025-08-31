"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/client"

export async function saveGeneratedImage(imageUrl: string, prompt?: string) {
  try {
    if (!imageUrl) {
      throw new Error("Image URL is required")
    }

    // Get admin client to bypass RLS
    const supabaseAdmin = createAdminClient()

    // Try to get the user ID from the session
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Use a special anonymous ID that doesn't need to exist in the users table
    const userId = session?.user?.id || "00000000-0000-0000-0000-000000000000"

    console.log("Saving image to database with user_id:", userId)

    // Save to database using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("generated_images")
      .insert({
        user_id: userId,
        prompt: prompt || "Generated image",
        image_url: imageUrl,
        model_used: "novita",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving image to database:", error)
      throw new Error(`Failed to save image to database: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in saveGeneratedImage:", error)
    throw error
  }
}
