import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Get API key from environment variable
    const apiKey = process.env.BLAND_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Simplified request based on working PHP example
    const blandAIRequest = {
      phone_number: phoneNumber,
      task: "fgfhg", // Simple task string as in the PHP example
      voice: "bbeabae6-ec8d-444f-92ad-c8e620d3de8d", // Using the specific voice ID from the example
      first_sentence: "hello there",
      // No additional complex parameters
    }

    console.log("Sending request to Bland AI:", JSON.stringify(blandAIRequest))

    // Make the API call to Bland AI
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey, // Direct API key without "Bearer" prefix
      },
      body: JSON.stringify(blandAIRequest),
    })

    const data = await response.json()
    console.log("Bland AI response:", JSON.stringify(data))

    if (!response.ok) {
      console.error("Bland AI API error:", data)
      return NextResponse.json({ error: data.error || "Failed to initiate call" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      callId: data.call_id,
      message: "Call initiated successfully",
    })
  } catch (error) {
    console.error("Error in call API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
