import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { CharacterGrid } from "@/components/character-grid"
import { Separator } from "@/components/ui/separator"
import { ClientChatList } from "@/components/client-chat-list"

export default async function ChatPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: characters } = await supabase.from("characters").select("*").order("created_at", { ascending: false })

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
            <CharacterGrid characters={characters || []} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
