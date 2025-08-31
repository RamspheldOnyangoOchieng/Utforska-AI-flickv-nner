import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    // Generate a mock task ID
    const taskId = `mock_${Math.random().toString(36).substring(2, 15)}`

    // Store the task details in a simulated database (just using global scope for demo)
    // In a real app, you'd use a database or Redis
    global.mockTasks = global.mockTasks || {}
    global.mockTasks[taskId] = {
      prompt,
      status: "TASK_STATUS_PENDING",
      createdAt: Date.now(),
      // Store the parameters for reference
      params: {
        width: 384,
        height: 512,
        image_num: 1,
        steps: 20,
        seed: -1,
        clip_skip: 1,
        guidance_scale: 7.5,
        sampler_name: "Euler a",
      },
    }

    // Set a timeout to simulate processing
    setTimeout(() => {
      if (global.mockTasks && global.mockTasks[taskId]) {
        global.mockTasks[taskId].status = "TASK_STATUS_SUCCEED"

        // Generate a random image URL based on the prompt
        // Using Lorem Picsum for random images
        const seed = Math.floor(Math.random() * 1000)
        global.mockTasks[taskId].images = [`https://picsum.photos/seed/${seed}/384/512`]
      }
    }, 3000) // Simulate 3 seconds of processing

    return NextResponse.json({ taskId })
  } catch (error) {
    console.error("Error in mock image generation:", error)
    return NextResponse.json(
      {
        error: "Mock API error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
