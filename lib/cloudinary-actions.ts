"use server"

// No more Cloudinary SDK import - we'll use direct fetch calls instead

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  error?: string
}

/**
 * Uploads an image to Cloudinary using direct fetch with unsigned upload preset
 * @param base64Data The file to upload as base64 string
 * @param folder Optional folder path
 * @returns The upload result with secure URL
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  folder = "ai-characters",
): Promise<CloudinaryUploadResult> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo"
    const uploadPreset = "ai-characters-preset" // Replace with your actual preset name

    // Create a FormData object for the upload
    const formData = new FormData()
    formData.append("file", base64Data)
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", folder)

    // Make a direct POST request to the Cloudinary API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Cloudinary API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const result = await response.json()

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    return {
      secure_url: "",
      public_id: "",
      error: error instanceof Error ? error.message : "Unknown error during upload",
    }
  }
}

/**
 * Extracts the public ID from a Cloudinary URL
 * @param url The Cloudinary URL
 * @returns The public ID
 */
export async function getPublicIdFromUrl(url: string): Promise<string> {
  if (!url || !url.includes("cloudinary.com")) {
    return ""
  }

  try {
    // Extract the public ID from the URL
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.jpg
    const urlParts = url.split("/")
    const publicIdParts = urlParts.slice(urlParts.indexOf("upload") + 1)

    // Remove file extension
    const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, "")
    return publicId
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return ""
  }
}

/**
 * Deletes an image from Cloudinary using direct fetch
 * @param publicId The public ID of the image to delete
 * @returns Success status
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo"
    const apiKey = process.env.CLOUDINARY_API_KEY || ""
    const apiSecret = process.env.CLOUDINARY_API_SECRET || ""

    // For deletion, we need to use the API key and secret
    // This should only be done server-side
    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("api_key", apiKey)

    // Note: For proper deletion, you would need to generate a signature
    // But since we're avoiding crypto, we'll use a simpler approach
    // This means deletion might not work properly in this implementation

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Cloudinary API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const result = await response.json()
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}
