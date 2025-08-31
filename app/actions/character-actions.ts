"use server"

import { revalidatePath } from "next/cache"
import { getAdminClient } from "@/lib/supabase-admin"
import { getAnonymousUserId } from "@/lib/anonymous-user"
import type { CharacterProfile } from "@/lib/storage-service"

export async function getCharacters() {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      console.error("Failed to create admin client")
      return []
    }

    const userId = getAnonymousUserId()

    const { data, error } = await supabaseAdmin.from("characters").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching characters:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCharacters:", error)
    return []
  }
}

export async function getCharacterById(id: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      console.error("Failed to create admin client")
      return null
    }

    const { data, error } = await supabaseAdmin.from("characters").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching character:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getCharacterById:", error)
    return null
  }
}

export async function createCharacter(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const promptTemplate = formData.get("promptTemplate") as string
    const isPublic = formData.get("isPublic") === "true"
    const imageUrl = formData.get("imageUrl") as string

    if (!name) {
      return { error: "Character name is required" }
    }

    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    const { data, error } = await supabaseAdmin
      .from("character_profiles")
      .insert({
        name,
        description,
        prompt_template: promptTemplate,
        is_public: isPublic,
        user_id: userId,
        image_url: imageUrl || undefined,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating character:", error)
      return { error: error.message }
    }

    revalidatePath("/characters")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating character:", error)
    return { error: (error as Error).message }
  }
}

export async function updateCharacter(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const promptTemplate = formData.get("promptTemplate") as string
    const isPublic = formData.get("isPublic") === "true"
    const imageUrl = formData.get("imageUrl") as string

    if (!name) {
      return { error: "Character name is required" }
    }

    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    // First check if user owns this character
    const { data: character } = await supabaseAdmin.from("character_profiles").select("user_id").eq("id", id).single()

    if (character?.user_id !== userId) {
      return { error: "You do not have permission to update this character" }
    }

    const updates: Partial<CharacterProfile> = {
      name,
      description,
      prompt_template: promptTemplate,
      is_public: isPublic,
    }

    if (imageUrl) {
      updates.image_url = imageUrl
    }

    const { data, error } = await supabaseAdmin
      .from("character_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating character:", error)
      return { error: error.message }
    }

    revalidatePath("/characters")
    revalidatePath(`/characters/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating character:", error)
    return { error: (error as Error).message }
  }
}

export async function deleteCharacter(id: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    // First check if user owns this character
    const { data: character } = await supabaseAdmin.from("character_profiles").select("user_id").eq("id", id).single()

    if (character?.user_id !== userId) {
      return { error: "You do not have permission to delete this character" }
    }

    const { error } = await supabaseAdmin.from("character_profiles").delete().eq("id", id)

    if (error) {
      console.error("Error deleting character:", error)
      return { error: error.message }
    }

    revalidatePath("/characters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting character:", error)
    return { error: (error as Error).message }
  }
}

export async function savePrompt(prompt: string, characterId?: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    const { data, error } = await supabaseAdmin
      .from("saved_prompts")
      .insert({
        prompt,
        character_id: characterId,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving prompt:", error)
      return { error: error.message }
    }

    revalidatePath("/prompts")
    if (characterId) {
      revalidatePath(`/characters/${characterId}`)
    }
    return { success: true, data }
  } catch (error) {
    console.error("Error saving prompt:", error)
    return { error: (error as Error).message }
  }
}

export async function toggleFavorite(promptId: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    // Get current favorite status
    const { data: prompt } = await supabaseAdmin
      .from("saved_prompts")
      .select("is_favorite")
      .eq("id", promptId)
      .eq("user_id", userId)
      .single()

    if (!prompt) {
      return { error: "Prompt not found" }
    }

    const { data, error } = await supabaseAdmin
      .from("saved_prompts")
      .update({ is_favorite: !prompt.is_favorite })
      .eq("id", promptId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error toggling favorite:", error)
      return { error: error.message }
    }

    revalidatePath("/prompts")
    revalidatePath("/favorites")
    return { success: true, data }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { error: (error as Error).message }
  }
}

export async function deletePrompt(id: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    const { error } = await supabaseAdmin.from("saved_prompts").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting prompt:", error)
      return { error: error.message }
    }

    revalidatePath("/prompts")
    revalidatePath("/favorites")
    return { success: true }
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return { error: (error as Error).message }
  }
}

export async function createTag(name: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    const { data, error } = await supabaseAdmin
      .from("tags")
      .insert({
        name,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating tag:", error)
      return { error: error.message }
    }

    revalidatePath("/characters")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating tag:", error)
    return { error: (error as Error).message }
  }
}

export async function deleteTag(id: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to create admin client" }
    }

    const userId = getAnonymousUserId()

    const { error } = await supabaseAdmin.from("tags").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting tag:", error)
      return { error: error.message }
    }

    revalidatePath("/characters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting tag:", error)
    return { error: (error as Error).message }
  }
}

export async function getFavorites() {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      console.error("Failed to create admin client")
      return []
    }

    const userId = getAnonymousUserId()

    // Check if the saved_prompts table exists
    const { data: tableExists, error: checkError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "saved_prompts")
      .single()

    if (checkError || !tableExists) {
      console.log("The saved_prompts table doesn't exist. Returning empty array.")
      return []
    }

    const { data, error } = await supabaseAdmin
      .from("saved_prompts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorites:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFavorites:", error)
    return []
  }
}

export async function getPrompts(characterId?: string) {
  try {
    const supabaseAdmin = await getAdminClient()
    if (!supabaseAdmin) {
      console.error("Failed to create admin client")
      return []
    }

    const userId = getAnonymousUserId()

    // Check if the saved_prompts table exists
    const { data: tableExists, error: checkError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "saved_prompts")
      .single()

    if (checkError || !tableExists) {
      console.log("The saved_prompts table doesn't exist. Using characters table instead.")

      // Fallback to characters table
      const { data, error } = await supabaseAdmin
        .from("characters")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching characters:", error)
        return []
      }

      // Transform characters to match prompt structure
      return (data || []).map((char) => ({
        id: char.id,
        prompt: char.description || "",
        character_id: char.id,
        user_id: userId,
        created_at: char.created_at,
        is_favorite: false,
      }))
    }

    // If the table exists, query it normally
    let query = supabaseAdmin.from("saved_prompts").select("*").eq("user_id", userId)

    if (characterId) {
      query = query.eq("character_id", characterId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching prompts:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getPrompts:", error)
    return []
  }
}
