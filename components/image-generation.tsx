"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save } from "lucide-react"
import Image from "next/image"
import { saveGeneratedImage } from "@/app/actions/save-generated-image"
import { useToast } from "@/hooks/use-toast"

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()

    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      console.error("Error generating image:", err)
      setError(err instanceof Error ? err.message : "Failed to generate image")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSaveImage() {
    if (!generatedImage) return

    try {
      setIsSaving(true)

      const result = await saveGeneratedImage(generatedImage, prompt)

      if (!result.success) {
        throw new Error(result.error || "Failed to save image")
      }

      toast({
        title: "Image saved",
        description: "The image has been saved to your collection",
      })
    } catch (err) {
      console.error("Error saving image:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save image",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate an image..."
            className="flex-1"
            disabled={isGenerating}
          />
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      </form>

      {generatedImage && (
        <div className="mt-6">
          <div className="relative aspect-square w-full max-w-md mx-auto border rounded-lg overflow-hidden">
            <Image src={generatedImage || "/placeholder.svg"} alt={prompt} fill className="object-contain" />
          </div>

          <div className="mt-4 flex justify-center">
            <Button onClick={handleSaveImage} disabled={isSaving} variant="outline">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Collection
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
