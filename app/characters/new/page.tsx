import { CharacterForm } from "@/components/character-form"

export default function NewCharacterPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Character</h1>
      <CharacterForm />
    </div>
  )
}
