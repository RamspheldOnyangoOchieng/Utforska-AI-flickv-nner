import { type NextRequest, NextResponse } from "next/server"

type NovitaTaskResultResponse = {
  extra: {
    seed: string
    debug_info: {
      request_info: string
      submit_time_ms: string
      execute_time_ms: string
      complete_time_ms: string
    }
  }
  task: {
    task_id: string
    task_type: string
    status: string
    reason: string
    eta: number
    progress_percent: number
  }
  images: {
    image_url: string
    image_url_ttl: string
    image_type: string
  }[]
  videos: any[]
  audios: any[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    console.log(`Checking task status for task ID: ${taskId}`)

    // Use the correct endpoint for checking task results
    const response = await fetch(`https://api.novita.ai/v3/async/task-result?task_id=${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Novita API error (${response.status}):`, errorText)
      return NextResponse.json(
        {
          error: `Failed to check generation status: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = (await response.json()) as NovitaTaskResultResponse
    console.log(`Task status: ${data.task.status}`)

    // Return appropriate response based on task status
    if (data.task.status === "TASK_STATUS_SUCCEED") {
      // Task completed successfully
      console.log(`Task succeeded, found ${data.images.length} images`)
      return NextResponse.json({
        status: "TASK_STATUS_SUCCEED",
        images: data.images.map((img) => img.image_url),
      })
    } else if (data.task.status === "TASK_STATUS_FAILED") {
      // Task failed
      console.log(`Task failed: ${data.task.reason}`)
      return NextResponse.json({
        status: "TASK_STATUS_FAILED",
        reason: data.task.reason || "Unknown error",
      })
    } else {
      // Task still in progress
      console.log(`Task in progress: ${data.task.status}, progress: ${data.task.progress_percent}%`)
      return NextResponse.json({
        status: data.task.status,
        progress: data.task.progress_percent,
        eta: data.task.eta,
      })
    }
  } catch (error) {
    console.error("Error checking generation status:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
