"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Message } from "@/lib/chat-actions"

// Save a message to the database (client-side)
export async function saveMessageClient(userId: string, characterId: string, message: Message): Promise<boolean> {
  try {
    // Enhanced validation for userId
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId:", userId)
      return false
    }

    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return false
    }

    console.log("Saving message:", {
      userId,
      characterId,
      messageRole: message.role,
      messageId: message.id,
    })

    const supabase = createClientComponentClient()

    // Get current user to verify authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting authenticated user:", userError)
      return false
    }

    if (!user) {
      console.error("No authenticated user found when trying to save message")
      return false
    }

    console.log("Current authenticated user:", {
      authUserId: user.id,
      providedUserId: userId,
      match: user.id === userId,
    })

    // Always use the authenticated user's ID to ensure it's not null
    const actualUserId = user.id

    if (!actualUserId) {
      console.error("Failed to get valid user ID for message insertion")
      return false
    }

    // Create a message object with the correct structure
    const messageData = {
      user_id: actualUserId,
      character_id: characterId,
      content: message.content,
      role: message.role,
      // Use the existing ID if available, otherwise generate a new one
      id: message.id || Math.random().toString(36).substring(2, 15),
    }

    console.log("Message data being sent to Supabase:", messageData)

    // Verify all required fields are present
    if (!messageData.user_id || !messageData.character_id || !messageData.content || !messageData.role) {
      console.error("Missing required fields in message data:", messageData)
      return false
    }

    // Try direct SQL for debugging
    try {
      const { data: directData, error: directError } = await supabase.rpc("insert_chat_message", {
        p_id: messageData.id,
        p_user_id: messageData.user_id,
        p_character_id: messageData.character_id,
        p_content: messageData.content,
        p_role: messageData.role,
      })

      if (directError) {
        console.error("Error with direct insert RPC:", directError)
      } else {
        console.log("Direct insert successful:", directData)
        return true
      }
    } catch (rpcError) {
      console.error("Exception with direct insert RPC:", rpcError)
    }

    // Fall back to regular insert if RPC fails
    const { data, error } = await supabase.from("chat_messages").insert(messageData).select()

    if (error) {
      console.error("Error saving message to database:", error)
      console.error("Error details:", error.details, error.hint, error.message)
      return false
    }

    console.log("Message saved successfully:", data)
    return true
  } catch (error) {
    console.error("Error saving message:", error)
    return false
  }
}

// Get chat history for a user and character (client-side)
export async function getChatHistoryClient(userId: string, characterId: string): Promise<Message[]> {
  try {
    // Enhanced validation for userId
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId:", userId)
      return []
    }

    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return []
    }

    console.log("Fetching chat history for:", { userId, characterId })
    const supabase = createClientComponentClient()

    // Get current user to verify authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting authenticated user:", userError)
      return []
    }

    if (!user) {
      console.error("No authenticated user found when trying to get chat history")
      return []
    }

    console.log("Current authenticated user:", {
      authUserId: user.id,
      providedUserId: userId,
      match: user.id === userId,
    })

    // Always use the authenticated user's ID
    const actualUserId = user.id

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", actualUserId)
      .eq("character_id", characterId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error fetching chat history:", error)
      throw error
    }

    console.log(`Retrieved ${data?.length || 0} messages from database`)

    if (!data || data.length === 0) {
      return []
    }

    return data.map((msg) => ({
      id: msg.id.toString(),
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

// Clear chat history for a user and character (client-side)
export async function clearChatHistoryClient(userId: string, characterId: string): Promise<boolean> {
  try {
    // Enhanced validation for userId
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("Invalid userId:", userId)
      return false
    }

    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return false
    }

    console.log("Clearing chat history for:", { userId, characterId })
    const supabase = createClientComponentClient()

    // Get current user to verify authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting authenticated user:", userError)
      return false
    }

    if (!user) {
      console.error("No authenticated user found when trying to clear chat history")
      return false
    }

    console.log("Current authenticated user:", {
      authUserId: user.id,
      providedUserId: userId,
      match: user.id === userId,
    })

    // Always use the authenticated user's ID
    const actualUserId = user.id

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", actualUserId)
      .eq("character_id", characterId)

    if (error) {
      console.error("Error clearing chat history:", error)
      return false
    }

    console.log("Chat history cleared successfully")
    return true
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return false
  }
}
