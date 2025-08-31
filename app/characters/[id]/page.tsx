import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { StorageService } from "@/lib/storage-service"
import { PromptList } from "@/components/prompt-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, ArrowLeft, Globe } from "lucide-react"

interface CharacterDetailPageProps {
  params: {
    id: string
  }
}

async function CharacterContent({ id }: { id: string }) {
  try {
    const character = await StorageService.getCharacter(id)
    const prompts = await StorageService.getPrompts(id)

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link href="/characters">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Characters
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/characters/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Character
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="relative aspect-square overflow-hidden rounded-lg">
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
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-3xl font-bold">{character.name}</h1>
                  {character.is_public && (
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </div>
                  )}
                </div>

                {character.description && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground">{character.description}</p>
                  </div>
                )}

                {character.prompt_template && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Prompt Template</h2>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm">{character.prompt_template}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Saved Prompts</h2>
          <PromptList prompts={prompts} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading character:", error)
    notFound()
  }
}

export default function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={<div>Loading character...</div>}>
        <CharacterContent id={params.id} />
      </Suspense>
    </div>
  )
}
