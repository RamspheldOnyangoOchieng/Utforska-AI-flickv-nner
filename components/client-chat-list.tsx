"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCharacters } from "@/components/character-context"
import { getChatHistoryFromLocalStorage } from "@/lib/local-storage-chat"

export function ClientChatList() {
  const { characters } = useCharacters()
  const [chatsWithHistory, setChatsWithHistory] = useState<string[]>([])
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load characters with chat history
  useEffect(() => {
    try {
      // Get all characters that have chat history
      const characterIds = characters
        .filter((character) => {
          const history = getChatHistoryFromLocalStorage(character.id)
          return history && history.length > 0
        })
        .map((character) => character.id)

      setChatsWithHistory(characterIds)
    } catch (error) {
      console.error("Failed to load characters with history:", error)
    } finally {
      setIsLoading(false)
    }
  }, [characters])

  // Handle image error
  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [id]: true,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {chatsWithHistory.length > 0 ? (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Recent Conversations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters
              .filter((char) => chatsWithHistory.includes(char.id))
              .map((char) => (
                <Link href={`/chat/${char.id}`} key={char.id} className="block">
                  <div className="flex items-center p-4 rounded-xl border hover:bg-accent transition-colors">
                    <div className="relative w-12 h-12 mr-3">
                      <img
                        src={
                          imageErrors[char.id]
                            ? "/placeholder.svg?height=48&width=48"
                            : char.image || "/placeholder.svg?height=48&width=48"
                        }
                        alt={char.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={() => handleImageError(char.id)}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">{char.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {(() => {
                          // Get chat history for this character
                          const chatHistory = getChatHistoryFromLocalStorage(char.id)
                          // Return the last message content if available, otherwise use fallback text
                          if (chatHistory && chatHistory.length > 0) {
                            const lastMessage = chatHistory[chatHistory.length - 1]
                            return lastMessage.content
                          }
                          return "Inga meddelanden än"
                        })()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">No conversations yet</h2>
          <p className="text-muted-foreground">
            Start chatting with a character to see your conversation history here.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="/">
              <Button variant="default">Browse Characters</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
