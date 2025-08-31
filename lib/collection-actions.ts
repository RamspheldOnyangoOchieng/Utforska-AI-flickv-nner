"use server"

import { updateCollection, deleteCollection } from "@/lib/storage-utils"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/client"
import { getAnonymousUserId } from "@/lib/anonymous-user"
import { revalidatePath } from "next/cache"
import { getAnonymousId } from "./anonymous-id"

// If there are any non-async functions here, let's make them async
export async function createCollection(name: string, description = "") {
  try {
    const supabase = await createAdminClient()
    const anonymousId = getAnonymousId()

    const { data, error } = await supabase
      .from("collections")
      .insert({
        name,
        description,
        user_id: anonymousId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating collection:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/collections")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createCollection:", error)
    return { success: false, error: "Failed to create collection" }
  }
}

export async function createNewCollection(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
      throw new Error("Collection name is required")
    }

    // Get user ID (authenticated or anonymous)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string

    if (session?.user?.id) {
      console.log("[Server Action] User is authenticated:", session.user.id)
      userId = session.user.id
    } else {
      userId = getAnonymousUserId()
      console.log("[Server Action] Using anonymous ID:", userId)
    }

    const supabaseAdmin = await createAdminClient()

    const collection = await supabaseAdmin
      .from("collections")
      .insert({
        name,
        description,
        user_id: userId,
      })
      .select()
      .single()

    return { success: true, collection }
  } catch (error) {
    console.error("Error creating collection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create collection",
    }
  }
}

export async function getAllCollections() {
  try {
    // Get user ID (authenticated or anonymous)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string

    if (session?.user?.id) {
      console.log("[Server Action] User is authenticated:", session.user.id)
      userId = session.user.id
    } else {
      userId = getAnonymousUserId()
      console.log("[Server Action] Using anonymous ID:", userId)
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = await createAdminClient()

    // Get collections with image count
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select(`
        *,
        image_count:generated_images(count)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Server Action] Error fetching collections:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Format the response
    const collections = (data || []).map((collection) => ({
      ...collection,
      image_count: collection.image_count?.[0]?.count || 0,
    }))

    return {
      success: true,
      collections,
    }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getCollection(id: string) {
  try {
    // Get user ID (authenticated or anonymous)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string

    if (session?.user?.id) {
      console.log("[Server Action] User is authenticated:", session.user.id)
      userId = session.user.id
    } else {
      userId = getAnonymousUserId()
      console.log("[Server Action] Using anonymous ID:", userId)
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = await createAdminClient()

    // Get the collection
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (collectionError) {
      console.error("[Server Action] Error fetching collection:", collectionError)
      return {
        success: false,
        error: collectionError.message,
      }
    }

    // Get images in this collection
    const { data: images, error: imagesError } = await supabaseAdmin
      .from("generated_images")
      .select("*")
      .eq("collection_id", id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (imagesError) {
      console.error("[Server Action] Error fetching collection images:", imagesError)
      return {
        success: false,
        error: imagesError.message,
      }
    }

    return {
      success: true,
      collection,
      images: images || [],
    }
  } catch (error) {
    console.error("[Server Action] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateExistingCollection(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
      throw new Error("Collection name is required")
    }

    const collection = await updateCollection(id, {
      name,
      description,
    })

    return { success: true, collection }
  } catch (error) {
    console.error("Error updating collection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update collection",
    }
  }
}

export async function deleteExistingCollection(id: string) {
  try {
    await deleteCollection(id)
    return { success: true }
  } catch (error) {
    console.error("Error deleting collection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete collection",
    }
  }
}
