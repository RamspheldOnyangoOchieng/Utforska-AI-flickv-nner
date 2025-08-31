import { type NextRequest, NextResponse } from "next/server"

// Set maximum duration for this API route (30 seconds for Vercel Pro, 10 seconds for Hobby)
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { prompt, selectedCount, aspectRatio, lora, loraStrength } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.NOVITA_API_KEY
    if (!apiKey) {
      console.error("NOVITA_API_KEY not configured")
      return NextResponse.json({ error: "NOVITA_API_KEY not configured" }, { status: 500 })
    }

    // Generate random seed
    const seed = Math.floor(Math.random() * 4294967295)

    // Build the prompt with LoRA if specified
    let enhancedPrompt = prompt
    if (lora && loraStrength) {
      enhancedPrompt = `${prompt}, <lora:${lora}:${loraStrength}>`
    }

    const requestBody = {
      prompt: enhancedPrompt,
      seed: seed,
      steps: 4,
      width: 512,
      height: 512,
      image_num: selectedCount ? parseInt(selectedCount) : 1,
    }

    console.log("Sending request to Novita AI:", requestBody)

    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

    try {
      const response = await fetch("https://api.novita.ai/v3beta/flux-1-schnell", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok first
      if (!response.ok) {
        console.error("Novita API error - Status:", response.status, response.statusText)

        // Try to get error details, but handle cases where response isn't JSON
        let errorMessage = `Novita API error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.text()
          console.error("Novita API error response:", errorData)

          // Try to parse as JSON first
          try {
            const jsonError = JSON.parse(errorData)
            if (jsonError.error || jsonError.message) {
              errorMessage = jsonError.error || jsonError.message
            }
          } catch {
            // If not JSON, use the text response if it's reasonable length
            if (errorData && errorData.length < 200) {
              errorMessage = errorData
            }
          }
        } catch (textError) {
          console.error("Could not read error response:", textError)
        }

        return NextResponse.json({ error: errorMessage }, { status: response.status })
      }

      // Try to parse the successful response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Failed to parse Novita API response as JSON:", parseError)
        return NextResponse.json({ error: "Invalid response from image generation service" }, { status: 500 })
      }

      console.log("Novita AI response:", data)

      // Extract image URLs from the response - the correct format is data.images array
      const images = data.images || []

      if (images.length === 0) {
        console.error("No images in response:", data)
        return NextResponse.json({ error: "No images returned from FLUX model" }, { status: 500 })
      }

      // Extract just the image URLs from the response objects
      const imageUrls = images.map((img: any) => img.image_url).filter(Boolean)

      if (imageUrls.length === 0) {
        console.error("No valid image URLs found in response:", images)
        return NextResponse.json({ error: "No valid images returned from FLUX model" }, { status: 500 })
      }

      return NextResponse.json({
        images: imageUrls,
        taskId: data.task?.task_id || `flux-${Date.now()}`,
        status: "TASK_STATUS_SUCCEED",
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Request timed out")
        return NextResponse.json(
          {
            error: "Request timed out. The image generation is taking longer than expected. Please try again.",
          },
          { status: 408 },
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Error in FLUX generation:", error)

    // Handle specific error types
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timed out. Please try again with a simpler prompt or fewer images.",
        },
        { status: 408 },
      )
    }

    // Ensure we always return a JSON response
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
