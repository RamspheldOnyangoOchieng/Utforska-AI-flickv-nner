"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SaveImageButton } from "./save-image-button"

// Add a debounce utility
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function ImageGeneration() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const { toast } = useToast()

  // Add a ref to track if a generation is in progress
  const generationInProgressRef = useRef(false)

  // Add a ref to track the current generation ID
  const currentGenerationIdRef = useRef<string | null>(null)

  // Function to generate an image
  const generateImage = async () => {
    if (!prompt.trim() || generationInProgressRef.current) return

    try {
      generationInProgressRef.current = true
      setIsGenerating(true)
      setGeneratedImage(null)

      // Start the generation
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate image")
      }

      const data = await response.json()

      // Store the generation ID
      setGenerationId(data.id)
      currentGenerationIdRef.current = data.id

      // Poll for the result
      checkGenerationStatus(data.id)
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error generating image",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      })
      generationInProgressRef.current = false
      setIsGenerating(false)
    }
  }

  // Function to check the generation status
  const checkGenerationStatus = async (id: string) => {
    try {
      // If this is not the current generation, stop polling
      if (id !== currentGenerationIdRef.current) return

      const response = await fetch(`/api/check-generation?id=${id}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to check generation status")
      }

      const data = await response.json()

      if (data.status === "completed") {
        // Generation completed successfully
        setGeneratedImage(data.result.image_url)
        generationInProgressRef.current = false
        setIsGenerating(false)
      } else if (data.status === "failed") {
        // Generation failed
        throw new Error(data.error || "Image generation failed")
      } else {
        // Generation still in progress, poll again after a delay
        setTimeout(() => checkGenerationStatus(id), 2000)
      }
    } catch (error) {
      console.error("Error checking generation status:", error)
      toast({
        title: "Error generating image",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      })
      generationInProgressRef.current = false
      setIsGenerating(false)
    }
  }

  // Create a debounced version of the generate function
  const debouncedGenerate = debounce(generateImage, 500)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateImage()
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      generationInProgressRef.current = false
      currentGenerationIdRef.current = null
    }
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate an image..."
          disabled={isGenerating}
          className="flex-1"
        />
        <Button type="submit" disabled={!prompt.trim() || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </form>

      {isGenerating && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Generating your image...</span>
        </div>
      )}

      {generatedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="aspect-square relative overflow-hidden rounded-md">
              <img src={generatedImage || "/placeholder.svg"} alt={prompt} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{prompt}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedImage(null)
                    setGenerationId(null)
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New
                </Button>
                <SaveImageButton
                  prompt={prompt}
                  imageUrl={generatedImage}
                  modelUsed="novita"
                  onSaveSuccess={() => {
                    // Optional: Do something after successful save
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
