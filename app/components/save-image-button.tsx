"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { saveGeneratedImage } from "@/app/actions/save-generated-image"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

interface SaveImageButtonProps {
  prompt: string
  imageUrl: string
  modelUsed?: string
  onSaveSuccess?: (data: any) => void
}

export function SaveImageButton({ prompt, imageUrl, modelUsed = "novita", onSaveSuccess }: SaveImageButtonProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  // Track if a save operation is in progress to prevent duplicates
  const [saveInProgress, setSaveInProgress] = useState(false)

  // Add a debounced save function
  const handleSave = async () => {
    // Prevent multiple clicks while saving
    if (saveInProgress || isSaved) return

    try {
      setSaveInProgress(true)
      setIsSaving(true)

      const result = await saveGeneratedImage(prompt, imageUrl, modelUsed)

      if (result.duplicate) {
        toast({
          title: "Image already saved",
          description: "This image has already been saved to your collection.",
          duration: 3000,
        })
      } else {
        toast({
          title: "Image saved",
          description: "The image has been saved to your collection.",
          duration: 3000,
        })
      }

      setIsSaved(true)

      if (onSaveSuccess) {
        onSaveSuccess(result.data)
      }
    } catch (error) {
      console.error("Error saving image:", error)
      toast({
        title: "Error saving image",
        description: "There was an error saving the image. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
      // Add a delay before allowing another save attempt
      setTimeout(() => {
        setSaveInProgress(false)
      }, 2000)
    }
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || isSaved}
      variant={isSaved ? "outline" : "default"}
      className="gap-2"
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : isSaved ? (
        <>
          <Save className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save Image
        </>
      )}
    </Button>
  )
}
