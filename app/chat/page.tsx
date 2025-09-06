import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { CharacterGrid } from "@/components/character-grid"
import { Separator } from "@/components/ui/separator"
import { ClientChatList } from "@/components/client-chat-list"

export default async function ChatPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase.from("characters").select("*").order("created_at", { ascending: false })

  const characters = (rows || []).map(r => ({
    id: r.id,
    name: r.name || 'Unnamed',
    age: r.age || 0,
    image: r.image_url || r.image || '',
    description: r.description || '',
    personality: r.personality || '',
    occupation: r.occupation || '',
    hobbies: r.hobbies || '',
    body: r.body || '',
    ethnicity: r.ethnicity || '',
    language: r.language || 'sv',
    relationship: r.relationship || '',
    isNew: false,
    createdAt: r.created_at || new Date().toISOString(),
    systemPrompt: r.system_prompt || '',
    category: r.category || 'All',
    videoUrl: r.video_url || undefined,
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chats</h1>
            <p className="text-muted-foreground">View your conversation history with characters.</p>
          </div>
        </div>

        <ClientChatList />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Characters</h2>
            <Link href="/characters" className="flex items-center text-sm">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <Separator />
          <Suspense fallback={<div>Loading characters...</div>}>
            <CharacterGrid characters={characters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
