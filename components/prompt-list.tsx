"use client"

import { useState } from "react"
import type { SavedPrompt } from "@/lib/storage-service"
import { deletePrompt, toggleFavorite } from "@/app/actions/character-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Star, Trash2, MessageSquare } from "lucide-react"

interface PromptListProps {
  prompts: SavedPrompt[]
  showCharacterLink?: boolean
}

export function PromptList({ prompts, showCharacterLink = false }: PromptListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setIsDeleting(id)
    try {
      const result = await deletePrompt(id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Prompt Deleted",
          description: "The prompt has been successfully deleted.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  async function handleToggleFavorite(id: string) {
    setIsTogglingFavorite(id)
    try {
      const result = await toggleFavorite(id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsTogglingFavorite(null)
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No prompts found</h3>
        <p className="text-muted-foreground mb-4">You haven't saved any prompts yet</p>
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-2">
              <p className="flex-1">{prompt.prompt}</p>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => prompt.id && handleToggleFavorite(prompt.id)}
                  disabled={isTogglingFavorite === prompt.id}
                  aria-label={prompt.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`h-4 w-4 ${prompt.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete prompt">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete this prompt.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => prompt.id && handleDelete(prompt.id)}
                        disabled={isDeleting === prompt.id}
                      >
                        {isDeleting === prompt.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(prompt.created_at || "").toLocaleString()}
            </div>
          </CardContent>
          {showCharacterLink && prompt.character_id && (
            <CardFooter className="p-4 pt-0">
              <Button asChild variant="link" className="p-0 h-auto">
                <a href={`/characters/${prompt.character_id}`}>View Character</a>
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
