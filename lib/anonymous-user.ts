import { v4 as uuidv4 } from "uuid"

// Key for storing the anonymous user ID in localStorage
const ANONYMOUS_USER_KEY = "ai_explorer_anonymous_user_id"

/**
 * Gets a unique anonymous user ID from localStorage or creates a new one
 */
export const getAnonymousUserId = (): string => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return "00000000-0000-0000-0000-000000000000" // Fallback for SSR
  }

  try {
    // Try to get existing ID from localStorage
    let anonymousId = localStorage.getItem(ANONYMOUS_USER_KEY)

    // If no ID exists, create a new one and store it
    if (!anonymousId) {
      anonymousId = uuidv4()
      localStorage.setItem(ANONYMOUS_USER_KEY, anonymousId)
    }

    return anonymousId
  } catch (error) {
    // Fallback in case localStorage is not available (e.g., incognito mode)
    console.error("Error accessing localStorage:", error)
    return uuidv4() // Generate a temporary ID
  }
}

/**
 * Clears the anonymous user ID from localStorage
 * (useful when a user logs in and we want to migrate their data)
 */
export const clearAnonymousUserId = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ANONYMOUS_USER_KEY)
    } catch (error) {
      console.error("Error clearing anonymous user ID:", error)
    }
  }
}
