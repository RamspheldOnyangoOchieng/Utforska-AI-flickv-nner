"use server"

import OpenAI from "openai"
import { getApiKey } from "./db-init"

export async function checkNovitaApiKey(): Promise<{ valid: boolean; message: string }> {
  try {
    // Try to get API key from database first
    let apiKey = null
    try {
      apiKey = await getApiKey("novita_api_key")
    } catch (error) {
      console.warn("Could not fetch API key from database:", error)
    }

    // Fall back to environment variable if not found in database
    const key = apiKey || process.env.NEXT_PUBLIC_NOVITA_API_KEY

    if (!key) {
      return {
        valid: false,
        message: "No API key found. Please set a Novita API key in the Admin Dashboard or as an environment variable.",
      }
    }

    // Create a temporary OpenAI client to test the API key
    const openai = new OpenAI({
      baseURL: "https://api.novita.ai/v3/openai",
      apiKey: key,
    })

    // Make a simple request to test the API key
    try {
      const models = await openai.models.list()
      if (models) {
        return { valid: true, message: "API key is valid and working." }
      } else {
        return { valid: false, message: "API key validation failed. The API returned an unexpected response." }
      }
    } catch (apiError: any) {
      if (apiError.status === 401) {
        return { valid: false, message: "Invalid API key. Please check your Novita API key." }
      } else {
        return {
          valid: false,
          message: `API error: ${apiError.message || "Unknown error connecting to Novita API."}`,
        }
      }
    }
  } catch (error: any) {
    return {
      valid: false,
      message: `Error checking API key: ${error.message || "Unknown error"}`,
    }
  }
}
