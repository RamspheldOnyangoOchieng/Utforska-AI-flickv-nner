import { getCachedImage, cacheImage } from "./image-cache"

export async function generateImage(character, messages, forceRefresh = false) {
  // Create a prompt based on the character and messages
  const prompt = createPromptFromMessages(character, messages)

  // Check if we have a cached image for this character and prompt
  if (!forceRefresh) {
    const cachedUrl = getCachedImage(character.id, prompt)
    if (cachedUrl) {
      console.log("Using cached image for", character.name)
      return cachedUrl
    }
  }

  // Generate a new image
  try {
    // Existing image generation logic
    const imageUrl = await callImageGenerationAPI(prompt, character.imageUrl)

    // Cache the result
    if (imageUrl) {
      cacheImage(character.id, imageUrl, prompt)
    }

    return imageUrl
  } catch (error) {
    console.error("Error generating image:", error)
    return character.imageUrl // Fallback to the original image
  }
}

// Helper functions
function createPromptFromMessages(character, messages) {
  // Logic to create a prompt from the character and messages
  // This should be based on your existing implementation
  return `${character.name} ${character.description} ${messages.slice(-1)[0]?.content || ""}`
}

async function callImageGenerationAPI(prompt, baseImageUrl) {
  // Your existing API call logic
  // This should be based on your existing implementation
}
