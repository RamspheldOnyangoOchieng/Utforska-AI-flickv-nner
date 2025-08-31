import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const taskId = url.searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId parameter" }, { status: 400 })
    }

    // Access the mock tasks from global scope
    const mockTasks = global.mockTasks || {}
    const task = mockTasks[taskId]

    if (!task) {
      return NextResponse.json(
        {
          error: "Task not found",
          status: "TASK_STATUS_FAILED",
        },
        { status: 404 },
      )
    }

    // Return the task status and images if available
    return NextResponse.json({
      status: task.status,
      images: task.images || [],
      params: task.params || {
        width: 384,
        height: 512,
        image_num: 1,
        steps: 20,
        seed: -1,
        clip_skip: 1,
        guidance_scale: 7.5,
        sampler_name: "Euler a",
      },
    })
  } catch (error) {
    console.error("Error checking mock generation status:", error)
    return NextResponse.json(
      {
        error: "Mock API error",
        details: String(error),
        status: "TASK_STATUS_FAILED",
      },
      { status: 500 },
    )
  }
}
