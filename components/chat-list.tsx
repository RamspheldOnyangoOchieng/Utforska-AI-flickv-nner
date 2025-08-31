"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getChatHistoryFromLocalStorage } from "@/lib/local-storage-chat"
import { useCharacters } from "@/components/character-context"

// Define a simple chat type for the list
interface ChatListItem {
  id: string
  name: string
  lastMessage: string
  timestamp: string
}

export function ChatList() {
  const router = useRouter()
  const { characters } = useCharacters()
  const [chatList, setChatList] = useState<ChatListItem[]>([])

  // Load chat list on component mount
  useEffect(() => {
    const loadChatList = () => {
      try {
        // Filter characters that have chat history
        const chatsWithHistory = characters
          .filter((character) => {
            const history = getChatHistoryFromLocalStorage(character.id)
            return history && history.length > 0
          })
          .map((character) => {
            const history = getChatHistoryFromLocalStorage(character.id)
            const lastMessage = history[history.length - 1]

            return {
              id: character.id,
              name: character.name || "Unknown",
              lastMessage: lastMessage.content || "No message",
              timestamp: lastMessage.timestamp || "Just now",
            }
          })

        setChatList(chatsWithHistory)
      } catch (error) {
        console.error("Failed to load chat list:", error)
        setChatList([])
      }
    }

    loadChatList()

    // Set up an interval to refresh the chat list every few seconds
    const intervalId = setInterval(loadChatList, 5000)

    // Clean up the interval on unmount
    return () => clearInterval(intervalId)
  }, [characters])

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`)
  }

  const handleNew = () => {
    router.push("/")
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the chat selection

    try {
      // Remove from local state
      setChatList((prev) => prev.filter((chat) => chat.id !== id))

      // If we're currently viewing the deleted chat, redirect to home
      if (window.location.pathname.includes(`/chat/${id}`)) {
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="outline" className="w-full justify-start" onClick={handleNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      <div className="space-y-2">
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted group",
                window.location.pathname.includes(`/chat/${chat.id}`) && "bg-muted",
              )}
              onClick={() => handleSelect(chat.id)}
            >
              <div className="truncate flex-1">{chat.name || "New Chat"}</div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(chat.id, e)}
                aria-label="Delete chat"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">No chat history yet. Start a new chat!</div>
        )}
      </div>
    </div>
  )
}
