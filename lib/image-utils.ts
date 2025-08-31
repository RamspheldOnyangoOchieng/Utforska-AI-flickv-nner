/**
 * Checks if a message is asking for an image generation.
 * @param message The message to check.
 * @returns True if the message asks for an image, false otherwise.
 */
export const isAskingForImage = (message: string): boolean => {
  if (!message) return false
  const lowerCaseMessage = message.toLowerCase()
  return (
    lowerCaseMessage.includes("image") ||
    lowerCaseMessage.includes("draw") ||
    lowerCaseMessage.includes("picture") ||
    lowerCaseMessage.includes("generate") ||
    lowerCaseMessage.includes("create") ||
    lowerCaseMessage.includes("can i see") ||
    lowerCaseMessage.includes("send me") ||
    lowerCaseMessage.includes("show me") ||
    lowerCaseMessage.includes("show")
  )
}

/**
 * Extracts the prompt for image generation from a message.
 * @param message The message to extract the prompt from.
 * @returns The extracted prompt, or the original message if no specific prompt is found.
 */
export const extractImagePrompt = (message: string): string => {
  if (!message) return ""
  // This is a very basic implementation.  A more sophisticated implementation
  // might use regex or NLP to extract the relevant part of the message.
  return message
}

/**
 * Converts an image URL to a base64 string.
 * @param imageUrl The URL of the image to convert.
 * @returns A promise that resolves with the base64 string, or null if an error occurs.
 */
export const imageUrlToBase64 = async (imageUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error converting image to base64:", error)
    return null
  }
}
