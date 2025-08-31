"use client"

import { useState } from "react"
import { savePrompt } from "@/app/actions/character-actions"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Bookmark } from "lucide-react"

interface PromptSaveButtonProps {
  prompt: string
  characterId?: string
}

export function PromptSaveButton({ prompt, characterId }: PromptSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      const result = await savePrompt(prompt, characterId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Prompt Saved",
          description: "The prompt has been saved to your collection.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
      <Bookmark className="mr-2 h-4 w-4" />
      {isSaving ? "Saving..." : "Save Prompt"}
    </Button>
  )
}
