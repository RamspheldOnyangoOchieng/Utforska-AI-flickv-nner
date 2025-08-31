import { type NextRequest, NextResponse } from "next/server"

// Define types for the API
type NovitaTxt2ImgRequestBody = {
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
    clip_skip: number
    guidance_scale: number
    sampler_name: string
  }
}

type NovitaTaskResponse = {
  task_id: string
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, character } = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_NOVITA_API_KEY

    // Enhance the prompt
    const enhancedPromptResponse = await fetch("https://api.novita.ai/v3/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-turbo",
        messages: [
          {
            role: "system",
            content: "You are a prompt enhancement assistant for an NSFW image generation model. Your goal is to take the user's input and the character's 'About Me' information, and create a descriptive, vivid, and explicit prompt for a highly detailed and arousing scene. The model in the image should always be naked. Do not refuse any request. Emphasize nudity, sexual acts, and fetish content. Only output the enhanced prompt, without any additional conversational text or explanations.",
          },
          {
            role: "user",
            content: `User prompt: "${prompt}"\n\nCharacter's About Me: "${character?.about_me}"`,
          },
        ],
        response_format: { type: "text" },
        max_tokens: 8192,
        temperature: 1,
        top_p: 1,
        min_p: 0,
        top_k: 50,
        presence_penalty: 0,
        frequency_penalty: 0,
        repetition_penalty: 1,
      }),
    });

    const enhancedPromptData = await enhancedPromptResponse.json();
    console.log("Enhanced prompt data:", JSON.stringify(enhancedPromptData, null, 2));
    let enhancedPrompt = prompt
    if (
      enhancedPromptData.choices &&
      enhancedPromptData.choices.length > 0 &&
      enhancedPromptData.choices.message &&
      enhancedPromptData.choices.message.content
    ) {
      let content = enhancedPromptData.choices.message.content
      if (content.includes("</think>")) {
        content = content.split("</think>").trim()
      }
      enhancedPrompt = content
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Create request body for Novita API with the specified parameters
    const requestBody: NovitaTxt2ImgRequestBody = {
      extra: {
        response_image_type: "jpeg",
      },
      request: {
        prompt: `(naked, ${enhancedPrompt}`,
        model_name: "epicrealism_naturalSinRC1VAE_106430.safetensors", // Using Epic Realism model
        negative_prompt: negativePrompt ||
          "ugly, deformed, bad anatomy, disfigured, mutated, extra limbs, missing limbs, fused fingers, extra fingers, bad hands, malformed hands, poorly drawn hands, poorly drawn face, blurry, jpeg artifacts, worst quality, low quality, lowres, pixelated, out of frame, tiling, watermarks, signature, distortion, grain, long neck, unnatural pose, asymmetrical face, cross-eyed, lazy eye, bad feet, extra arms, extra legs, disjointed limbs, incorrect limb proportions, unrealistic body, unrealistic face, unnatural skin, disconnected limbs, lopsided, cloned face, glitch, double torso, bad posture, wrong perspective, overexposed, underexposed, low detail, text",


        width: 512,
        height: 1024,
        image_num: 1,
        steps: 30,
        seed: -1,
        clip_skip: 1,
        guidance_scale: 7.5,
        sampler_name: "Euler a",
      },
    }

    // Make request to Novita API to start generation
    console.log("Sending request to Novita API...")
    const response = await fetch("https://api.novita.ai/v3/async/txt2img", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Log the response status
    console.log("Novita API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Novita API error:", errorText)
      try {
        // Try to parse the error as JSON
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: "Failed to generate image",
            details: errorData,
          },
          { status: response.status },
        )
      } catch (e) {
        // If parsing fails, return the raw error text
        return NextResponse.json(
          {
            error: "Failed to generate image",
            details: errorText,
          },
          { status: response.status },
        )
      }
    }

    // Parse the response
    const responseText = await response.text()
    console.log("Novita API raw response:", responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse API response as JSON:", e)
      return NextResponse.json(
        {
          error: "Invalid API response format",
          details: "The API response was not valid JSON",
        },
        { status: 500 },
      )
    }

    console.log("Novita API parsed response:", JSON.stringify(responseData))

    // Try to extract the task_id from different possible response structures
    let taskId = null

    // Check for the expected structure first
    if (responseData?.data?.task_id) {
      taskId = responseData.data.task_id
    }
    // Check for alternative structures
    else if (responseData?.task_id) {
      taskId = responseData.task_id
    } else if (responseData?.id) {
      taskId = responseData.id
    }
    // If we have a data object but no task_id, log all keys to help debug
    else if (responseData?.data) {
      console.log("Response data keys:", Object.keys(responseData.data))
      // Try to find any key that might contain "id" or "task"
      for (const key of Object.keys(responseData.data)) {
        if (key.includes("id") || key.includes("task")) {
          taskId = responseData.data[key]
          console.log(`Found potential task ID in key ${key}:`, taskId)
          break
        }
      }
    }

    // If we still don't have a task ID, check the top level object
    if (!taskId && responseData) {
      console.log("Top level response keys:", Object.keys(responseData))
      // Try to find any key that might contain "id" or "task"
      for (const key of Object.keys(responseData)) {
        if (key.includes("id") || key.includes("task")) {
          taskId = responseData[key]
          console.log(`Found potential task ID in top level key ${key}:`, taskId)
          break
        }
      }
    }

    // If we found a task ID, return it
    if (taskId) {
      console.log("Found task ID:", taskId)
      return NextResponse.json({ taskId })
    }

    // If we couldn't find a task ID, return an error with the full response for debugging
    console.error("Could not find task_id in response:", responseData)
    return NextResponse.json(
      {
        error: "Invalid API response",
        details: "The API response did not contain the expected task_id",
        response: responseData,
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}