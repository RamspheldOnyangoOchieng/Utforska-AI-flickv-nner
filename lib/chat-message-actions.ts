"use server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Message } from "@/lib/chat-actions"

// Save a message to the database
export async function saveMessage(userId: string, characterId: string, message: Message): Promise<boolean> {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })

    const { error } = await supabase.from("chat_messages").insert({
      user_id: userId,
      character_id: characterId,
      content: message.content,
      role: message.role,
    })

    return !error
  } catch (error) {
    console.error("Error saving message:", error)
    return false
  }
}

// Get chat history for a user and character
export async function getChatHistory(userId: string, characterId: string): Promise<Message[]> {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))
  } catch (error) {
    console.error("Error getting chat history:", error)
    return []
  }
}

// Clear chat history for a user and character
export async function clearChatHistory(userId: string, characterId: string): Promise<boolean> {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", userId)
      .eq("character_id", characterId)

    return !error
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return false
  }
}
