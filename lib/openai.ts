"use server"

import OpenAI from "openai"
import { getApiKey } from "./db-init"

// Initialize the OpenAI client (server-side only)
let openaiInstance: OpenAI | null = null

// Update the getOpenAIClient function to handle missing app_settings table

// Function to get or create the OpenAI client
async function getOpenAIClient() {
  if (openaiInstance) return openaiInstance

  let apiKey

  try {
    // Try to get API key from database first
    apiKey = await getApiKey("novita_api_key")
  } catch (error) {
    // If the table doesn't exist or there's any other error, log it and continue
    console.warn("Could not fetch API key from database:", error)
    apiKey = null
  }

  // Fall back to environment variable if not found in database
  const key = apiKey || process.env.NEXT_PUBLIC_NOVITA_API_KEY || "demo-api-key"

  openaiInstance = new OpenAI({
    baseURL: "https://api.novita.ai/v3/openai",
    apiKey: key,
  })

  return openaiInstance
}

export type GenerateCharacterParams = {
  name?: string
  age?: number
  occupation?: string
  personality?: string
  interests?: string
}

export async function generateCharacterDescription(params: GenerateCharacterParams): Promise<string> {
  try {
    const openai = await getOpenAIClient()

    const prompt = `
      Create a detailed description for an AI character with the following attributes:
      ${params.name ? `Name: ${params.name}` : ""}
      ${params.age ? `Age: ${params.age}` : ""}
      ${params.occupation ? `Occupation: ${params.occupation}` : ""}
      ${params.personality ? `Personality: ${params.personality}` : ""}
      ${params.interests ? `Interests/Hobbies: ${params.interests}` : ""}
      
      The description should be 1-2 sentences long and highlight the character's most interesting qualities.
    `

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative assistant that specializes in creating engaging character descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-3.1-8b-instruct",
      stream: false,
    })

    return completion.choices[0].message.content || "No description generated."
  } catch (error) {
    console.error("Error generating character description:", error)
    return "Error generating character description. Please try again."
  }
}

export async function generateSystemPrompt(character: {
  name: string
  age: number
  description: string
  personality: string
  occupation: string
  hobbies: string
}): Promise<string> {
  try {
    const openai = await getOpenAIClient()

    const prompt = `
      Create a system prompt for an AI chatbot that will roleplay as the following character:
      
      Name: ${character.name}
      Age: ${character.age}
      Description: ${character.description}
      Personality: ${character.personality}
      Occupation: ${character.occupation}
      Hobbies: ${character.hobbies}
      
      The system prompt should instruct the AI on how to behave, speak, and respond as this character.
      Keep it under 200 words and focus on the character's personality, speech patterns, and knowledge areas.
    `

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative assistant that specializes in creating system prompts for AI characters.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-3.1-8b-instruct",
      stream: false,
    })

    return completion.choices[0].message.content || "No system prompt generated."
  } catch (error) {
    console.error("Error generating system prompt:", error)
    return `You are ${character.name}, a ${character.age}-year-old ${character.occupation}. ${character.description}`
  }
}

export default getOpenAIClient
