import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Fetch the image directly
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image from source" }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Prepare form data for Cloudinary upload
    const formData = new FormData()
    formData.append("file", new Blob([imageBuffer]))
    formData.append("upload_preset", "ml_default")

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    )

    if (!cloudinaryResponse.ok) {
      const cloudinaryError = await cloudinaryResponse.text()
      console.error("Cloudinary error:", cloudinaryError)
      return NextResponse.json({ error: "Failed to upload to Cloudinary" }, { status: 500 })
    }

    const cloudinaryData = await cloudinaryResponse.json()

    return NextResponse.json({
      secureUrl: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
    })
  } catch (error) {
    console.error("Error in save-to-cloudinary API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
