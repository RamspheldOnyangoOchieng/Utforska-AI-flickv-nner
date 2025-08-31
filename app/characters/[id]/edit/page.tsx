import { Suspense } from "react"
import { notFound } from "next/navigation"
import { StorageService } from "@/lib/storage-service"
import { CharacterForm } from "@/components/character-form"

interface EditCharacterPageProps {
  params: {
    id: string
  }
}

async function EditCharacterContent({ id }: { id: string }) {
  try {
    const character = await StorageService.getCharacter(id)
    return <CharacterForm character={character} isEditing />
  } catch (error) {
    console.error("Error loading character:", error)
    notFound()
  }
}

export default function EditCharacterPage({ params }: EditCharacterPageProps) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Character</h1>
      <Suspense fallback={<div>Loading character...</div>}>
        <EditCharacterContent id={params.id} />
      </Suspense>
    </div>
  )
}
