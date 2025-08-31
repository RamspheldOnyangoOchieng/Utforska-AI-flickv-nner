import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/client"
import { getAnonymousUserId } from "@/lib/anonymous-user"

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl, modelUsed = "novita" } = await request.json()

    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields: prompt and imageUrl" }, { status: 400 })
    }

    // Get user ID (authenticated or anonymous)
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId: string

    if (session?.user?.id) {
      console.log("[API] User is authenticated:", session.user.id)
      userId = session.user.id
    } else {
      userId = getAnonymousUserId()
      console.log("[API] Using anonymous ID:", userId)
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = await createAdminClient()

    // Check if this image URL already exists for this user to prevent duplicates
    const { data: existingImages } = await supabaseAdmin
      .from("generated_images")
      .select("id")
      .eq("user_id", userId)
      .eq("image_url", imageUrl)
      .limit(1)

    if (existingImages && existingImages.length > 0) {
      console.log("[API] Image already exists for this user:", existingImages[0].id)
      return NextResponse.json({ message: "Image already saved", imageId: existingImages[0].id }, { status: 200 })
    }

    // Insert the new image
    const { data, error } = await supabaseAdmin
      .from("generated_images")
      .insert({
        user_id: userId,
        prompt,
        image_url: imageUrl,
        model_used: modelUsed,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error saving image:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: data })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
