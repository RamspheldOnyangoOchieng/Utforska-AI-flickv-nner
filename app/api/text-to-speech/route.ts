import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice, language } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Novita API key is not configured" }, { status: 500 })
    }

    console.log("Using API key:", apiKey.substring(0, 5) + "...")
    console.log("Generating speech for text:", text.substring(0, 50) + "...")

    // Call the Novita API to generate speech
    // Using the correct endpoint for text-to-speech
    const response = await fetch("https://api.novita.ai/v3/async/txt2speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        request: {
          voice_id: voice || "Emily", // Default to Emily if no voice specified
          language: language || "sv-SE",
          texts: [text],
          volume: 1.2,
          speed: 1.0,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Novita API error response:", errorText)

      try {
        // Try to parse as JSON if possible
        const errorData = JSON.parse(errorText)
        console.error("Parsed error data:", errorData)
      } catch (parseError) {
        console.error("Could not parse error response as JSON")
      }

      return NextResponse.json(
        { error: `Failed to generate speech: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const responseText = await response.text()
    console.log("Novita API raw response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Error parsing Novita API response:", parseError)
      return NextResponse.json({ error: "Invalid response from Novita API" }, { status: 500 })
    }

    console.log("Parsed Novita API response:", data)

    if (!data.task_id) {
      console.error("Missing task_id in response:", data)
      return NextResponse.json({ error: "Invalid response from Novita API: missing task_id" }, { status: 500 })
    }

    // Return the task ID
    return NextResponse.json({
      taskId: data.task_id,
    })
  } catch (error) {
    console.error("Error in text-to-speech API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
