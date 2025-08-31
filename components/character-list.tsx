"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { CharacterProfile } from "@/lib/storage-service"
import { deleteCharacter } from "@/app/actions/character-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { MoreVertical, Edit, Trash2, Plus, Globe } from "lucide-react"

interface CharacterListProps {
  characters: CharacterProfile[]
}

export function CharacterList({ characters }: CharacterListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setIsDeleting(id)
    try {
      const result = await deleteCharacter(id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Character Deleted",
          description: "The character has been successfully deleted.",
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

  if (characters.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No characters found</h3>
        <p className="text-muted-foreground mb-4">Create your first character to get started</p>
        <Button asChild>
          <Link href="/characters/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Character
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <Card key={character.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              {character.image_url ? (
                <Image
                  src={character.image_url || "/placeholder.svg"}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              {character.is_public && (
                <div className="absolute top-2 right-2 bg-background/80 p-1 rounded-full">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{character.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/characters/${character.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the character "{character.name}" and all associated prompts.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => character.id && handleDelete(character.id)}
                          disabled={isDeleting === character.id}
                        >
                          {isDeleting === character.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {character.description && (
              <p className="text-muted-foreground mt-2 line-clamp-3">{character.description}</p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/characters/${character.id}`}>View Character</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
