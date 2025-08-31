"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCharacter, updateCharacter } from "@/app/actions/character-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { CharacterProfile } from "@/lib/storage-service"

interface CharacterFormProps {
  character?: CharacterProfile
  isEditing?: boolean
}

export function CharacterForm({ character, isEditing = false }: CharacterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      let result

      if (isEditing && character?.id) {
        result = await updateCharacter(character.id, formData)
      } else {
        result = await createCharacter(formData)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: isEditing ? "Character Updated" : "Character Created",
          description: `Successfully ${isEditing ? "updated" : "created"} character "${formData.get("name")}"`,
        })

        if (!isEditing) {
          router.push("/characters")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Character" : "Create New Character"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={character?.name || ""} required placeholder="Character name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={character?.description || ""}
              placeholder="Describe your character"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promptTemplate">Prompt Template</Label>
            <Textarea
              id="promptTemplate"
              name="promptTemplate"
              defaultValue={character?.prompt_template || ""}
              placeholder="Enter a template for generating prompts with this character"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={character?.image_url || ""}
              placeholder="URL to character image (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isPublic" name="isPublic" defaultChecked={character?.is_public || false} value="true" />
            <Label htmlFor="isPublic">Make this character public</Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Character" : "Create Character"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
