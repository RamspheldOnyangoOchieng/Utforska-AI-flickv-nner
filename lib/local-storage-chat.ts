import type { Message } from "@/lib/chat-actions"

// Key format for localStorage
const getChatKey = (characterId: string) => `chat_history_${characterId}`

// Save a message to localStorage
export function saveMessageToLocalStorage(characterId: string, message: Message): boolean {
  if (typeof window === "undefined") {
    return false
  }
  try {
    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return false
    }

    const key = getChatKey(characterId)

    // Get existing messages
    const existingMessagesJson = localStorage.getItem(key)
    const existingMessages: Message[] = existingMessagesJson ? JSON.parse(existingMessagesJson) : []

    // Add new message
    existingMessages.push(message)

    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(existingMessages))

    console.log(`Message saved to localStorage for character ${characterId}`)
    return true
  } catch (error) {
    console.error("Error saving message to localStorage:", error)
    return false
  }
}

// Get chat history from localStorage
export function getChatHistoryFromLocalStorage(characterId: string): Message[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return []
    }

    const key = getChatKey(characterId)

    // Get messages from localStorage
    const messagesJson = localStorage.getItem(key)
    if (!messagesJson) {
      return []
    }

    const messages: Message[] = JSON.parse(messagesJson)
    console.log(`Retrieved ${messages.length} messages from localStorage for character ${characterId}`)

    return messages
  } catch (error) {
    console.error("Error getting chat history from localStorage:", error)
    return []
  }
}

// Clear chat history from localStorage
export function clearChatHistoryFromLocalStorage(characterId: string): boolean {
  if (typeof window === "undefined") {
    return false
  }
  try {
    if (!characterId) {
      console.error("Missing characterId:", characterId)
      return false
    }

    const key = getChatKey(characterId)

    // Remove the item from localStorage
    localStorage.removeItem(key)

    console.log(`Chat history cleared from localStorage for character ${characterId}`)
    return true
  } catch (error) {
    console.error("Error clearing chat history from localStorage:", error)
    return false
  }
}

// Generic function to get an item from localStorage
export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error)
    return null
  }
}

// Generic function to set an item in localStorage
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error)
    return false
  }
}
