"use server"

import OpenAI from "openai"
import { getApiKey } from "./db-init"
import { isAskingForImage } from "./image-utils"

// Initialize the OpenAI client with Novita API
let openaiInstance: OpenAI | null = null

// Function to get or create the OpenAI client
async function getOpenAIClient() {
  if (openaiInstance) return openaiInstance

  let apiKey = null

  try {
    // Try to get API key from database first
    apiKey = await getApiKey("novita_api_key")
  } catch (error) {
    // If there's any error, log it and continue with the environment variable
    console.warn("Could not fetch API key from database:", error)
  }

  // Fall back to environment variable if not found in database
  const key = apiKey || process.env.NEXT_PUBLIC_NOVITA_API_KEY || "demo-api-key"

  openaiInstance = new OpenAI({
    baseURL: "https://api.novita.ai/v3/openai",
    apiKey: key,
  })

  return openaiInstance
}

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
  isImage?: boolean
  imageUrl?: string
}

export async function sendChatMessage(
  messages: Message[],
  systemPrompt: string,
): Promise<{ id: string; content: string; timestamp: string; isImage?: boolean; imageUrl?: string }> {
  try {
    const openai = await getOpenAIClient()

    // Check if the user is asking for an image
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user" && isAskingForImage(lastMessage.content)) {
      // Return a placeholder response indicating an image is being generated
      return {
        id: Math.random().toString(36).substring(2, 15),
        content: "Jag genererar en bild åt dig. Vänta lite...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isImage: true,
      }
    }

    // Enhance system prompt with Swedish language instructions
    const enhancedSystemPrompt = `${systemPrompt}

VIKTIGT - SPRÅKINSTRUKTIONER:
- Du MÅSTE alltid svara på svenska
- Använd naturlig, vardaglig svenska
- Anpassa dig till svensk kultur och kontext
- Om någon skriver på engelska, svara ändå på svenska
- Var vänlig och personlig i din ton
- Använd svenska uttryck och ordföljd

Kom ihåg att alltid kommunicera på svenska i alla dina svar.`

    // Format messages for the API
    const apiMessages = [
      { role: "system", content: enhancedSystemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    try {
      const completion = await openai.chat.completions.create({
        messages: apiMessages,
        model: "meta-llama/llama-3.1-8b-instruct", // Using Llama 3.1 model
        temperature: 0.7,
        max_tokens: 800,
      })

      const responseContent = completion.choices[0].message.content || "I'm not sure how to respond to that."

      return {
        id: Math.random().toString(36).substring(2, 15),
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    } catch (apiError) {
      console.error("API error:", apiError)
      // If there's an API error, return a friendly message in Swedish
      return {
        id: Math.random().toString(36).substring(2, 15),
        content: "Jag har problem med att ansluta till mitt system just nu. Kan vi försöka igen om en stund?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    return {
      id: Math.random().toString(36).substring(2, 15),
      content: "Ursäkta, jag har problem med anslutningen just nu. Försök igen senare.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }
}

export async function generateImageFromPrompt(characterImageUrl: string, userPrompt: string): Promise<string | null> {
  try {
    // This function would be implemented to handle the img2img generation
    // For now, we'll return a placeholder
    return null
  } catch (error) {
    console.error("Error generating image:", error)
    return null
  }
}
