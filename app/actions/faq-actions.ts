"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Create a Supabase client with admin privileges
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function addFAQ(question: string, answer: string) {
  try {
    // Use admin client to bypass RLS and authentication
    const { data, error } = await adminClient.from("faqs").insert([{ question, answer }]).select()

    if (error) {
      console.error("Error adding FAQ:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the path to update the UI
    revalidatePath("/")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteFAQ(id: string) {
  try {
    // Use admin client to bypass RLS and authentication
    const { error } = await adminClient.from("faqs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting FAQ:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the path to update the UI
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getFAQs() {
  try {
    const { data, error } = await adminClient.from("faqs").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching FAQs:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
