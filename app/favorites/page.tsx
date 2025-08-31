import { Suspense } from "react"
import { PromptList } from "@/components/prompt-list"
import { getFavorites } from "@/app/actions/character-actions"

async function FavoritesContent() {
  const favorites = await getFavorites()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Favorite Prompts</h1>
      {favorites.length > 0 ? (
        <PromptList prompts={favorites} showCharacterLink />
      ) : (
        <p>You haven't favorited any prompts yet.</p>
      )}
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<div>Loading favorites...</div>}>
        <FavoritesContent />
      </Suspense>
    </div>
  )
}
