import { Suspense } from "react"
import { PromptList } from "@/components/prompt-list"
import { getPrompts } from "@/app/actions/character-actions"

async function PromptsContent() {
  const prompts = await getPrompts()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Saved Prompts</h1>
      <PromptList prompts={prompts} showCharacterLink />
    </div>
  )
}

export default function PromptsPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<div>Loading prompts...</div>}>
        <PromptsContent />
      </Suspense>
    </div>
  )
}
