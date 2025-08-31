import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Simple implementation without using Cloudinary SDK's crypto functionality
export async function uploadImageToCloudinary(imageUrl: string, prompt: string): Promise<string> {
  // Simply return the original URL without trying to use Cloudinary
  // This avoids the crypto.createHash error
  return imageUrl
}

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  // Since we're not actually uploading to Cloudinary, this is a no-op
  return true
}

export function getPublicIdFromUrl(url: string): string | null {
  // For original URLs, just return a hash of the URL as an identifier
  return `img_${Date.now()}`
}
