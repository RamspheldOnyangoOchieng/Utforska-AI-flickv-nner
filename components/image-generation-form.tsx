"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, Save, RefreshCw, Sparkles } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"

export default function ImageGenerationForm() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [imageCount, setImageCount] = useState(1)
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)
    setTaskId(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          imageCount,
          width,
          height,
        }),
        credentials: "include", // Ensure cookies are sent
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      setTaskId(data.taskId)

      // Start checking status
      startStatusCheck(data.taskId)
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  const startStatusCheck = (taskId: string) => {
    setIsCheckingStatus(true)

    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }

    // Check immediately
    checkGenerationStatus(taskId)

    // Then set up interval
    checkIntervalRef.current = setInterval(() => {
      checkGenerationStatus(taskId)
    }, 2000) // Check every 2 seconds
  }

  const checkGenerationStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/check-generation?taskId=${taskId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check generation status")
      }

      const data = await response.json()
      console.log("Task status response:", data)

      if (data.status === "TASK_STATUS_SUCCEED") {
        // Image is ready - use the first image from the images array
        if (data.images && data.images.length > 0) {
          setGeneratedImage(data.images[0])
          setIsGenerating(false)
          setIsCheckingStatus(false)

          // Clear the interval
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }

          toast({
            title: "Success",
            description: "Your image has been generated!",
          })
        } else {
          throw new Error("No images returned from the API")
        }
      } else if (data.status === "TASK_STATUS_FAILED") {
        // Generation failed
        throw new Error(data.reason || "Image generation failed")
      }
      // For other statuses, we continue checking
    } catch (error) {
      console.error("Error checking generation status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check generation status",
        variant: "destructive",
      })

      setIsGenerating(false)
      setIsCheckingStatus(false)

      // Clear the interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }

  const handleSaveImage = async () => {
    if (!generatedImage) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/save-generated-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          prompt,
          modelUsed: "novita",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save image")
      }

      toast({
        title: "Success",
        description: "Image saved to your collection",
      })
    } catch (error) {
      console.error("Error saving image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save image",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generated_image_${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generate Images</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="bg-[#1A1A1A] border-[#252525]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-32 bg-[#252525] border-[#333333]"
                  />
                </div>

                <div>
                  <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="Elements you want to exclude..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="h-20 bg-[#252525] border-[#333333]"
                  />
                </div>

                <div>
                  <Label>Image Count: {imageCount}</Label>
                  <Slider
                    value={[imageCount]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={(value) => setImageCount(value[0])}
                    className="my-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Width: {width}px</Label>
                    <Slider
                      value={[width]}
                      min={512}
                      max={1024}
                      step={64}
                      onValueChange={(value) => setWidth(value[0])}
                      className="my-2"
                    />
                  </div>
                  <div>
                    <Label>Height: {height}px</Label>
                    <Slider
                      value={[height]}
                      min={512}
                      max={1024}
                      step={64}
                      onValueChange={(value) => setHeight(value[0])}
                      className="my-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCheckingStatus ? "Processing..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-[#1A1A1A] border-[#252525]">
            <CardContent className="p-6">
              <div className="aspect-square relative bg-[#252525] rounded-md overflow-hidden mb-4">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-gray-400">
                        {isCheckingStatus ? "Processing your image..." : "Starting generation..."}
                      </p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated image"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400 text-center px-4">Your generated image will appear here</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-[#252525] border-[#333333]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!generatedImage || isGenerating}
                  className="flex-1 bg-[#252525] border-[#333333]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>

                <Button
                  onClick={handleSaveImage}
                  disabled={!generatedImage || isGenerating || isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
