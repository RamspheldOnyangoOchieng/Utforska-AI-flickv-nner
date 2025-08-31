import { type NextRequest, NextResponse } from "next/server"

// Define types for the API
type NovitaImg2ImgRequestBody = {
  extra: {
    response_image_type: string
  }
  request: {
    model_name: string
    prompt: string
    negative_prompt?: string
    height: number
    width: number
    image_num: number
    steps: number
    seed: number
    guidance_scale: number
    sampler_name: string
    image_base64: string
  }
}

type NovitaTaskResponse = {
  task_id: string
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt } = await req.json()

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Use a default test image (a simple 1x1 pixel transparent PNG)
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="

    // Create request body for Novita API
    const requestBody: NovitaImg2ImgRequestBody = {
      extra: {
        response_image_type: "jpeg",
      },
      request: {
        prompt: prompt,
        model_name: "sd_xl_base_1.0.safetensors", // Using SDXL as default
        negative_prompt: negativePrompt || "bad quality, worst quality, low quality",
        width: 512,
        height: 512,
        image_num: 1,
        steps: 20,
        seed: -1,
        sampler_name: "Euler a",
        guidance_scale: 7.5,
        image_base64: base64Image,
      },
    }

    // Make request to Novita API to start generation
    const response = await fetch("https://api.novita.ai/v3/async/img2img", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Novita API error:", errorData)
      return NextResponse.json({ error: "Failed to generate image", details: errorData }, { status: response.status })
    }

    const data = (await response.json()) as { data: NovitaTaskResponse }

    // Return the task ID to the client
    return NextResponse.json({ taskId: data.data.task_id })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
