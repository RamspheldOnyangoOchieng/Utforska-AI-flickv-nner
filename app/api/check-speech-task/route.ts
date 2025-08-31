import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Novita API key is not configured" }, { status: 500 })
    }

    console.log("Checking speech task status for task ID:", taskId)

    // Call the Novita API to check the task status
    const response = await fetch(`https://api.novita.ai/v3/async/task-result?task_id=${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
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
        { error: `Failed to check speech task: ${response.status} ${response.statusText}` },
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

    // Extract the task status
    const status = data.task?.status || "TASK_STATUS_UNKNOWN"

    // Check if the task is completed and has audio files
    let audioUrl = null
    if (status === "TASK_STATUS_SUCCEED" && data.audios && data.audios.length > 0) {
      audioUrl = data.audios[0].audio_url
    }

    return NextResponse.json({
      status,
      audioUrl,
    })
  } catch (error) {
    console.error("Error in check-speech-task API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
