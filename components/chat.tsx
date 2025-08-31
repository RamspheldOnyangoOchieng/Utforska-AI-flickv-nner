"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatProps {
  character: {
    id: string
    name: string
    image: string
    description: string
    personality: string
    occupation: string
    hobbies: string
    body: string
    ethnicity: string
    language: string
    relationship: string
    isNew: boolean
    createdAt: string
    systemPrompt: string
  }
  messages: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: string
  }[]
  onSendMessage: (message: string) => Promise<void>
}

export function Chat({ character, messages, onSendMessage }: ChatProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (inputValue.trim()) {
      await onSendMessage(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-2xl p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <p className="text-white">{message.content}</p>
              <span className="text-xs text-gray-400 mt-1 block">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[#252525]">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Write a message..."
            className="flex-1 bg-[#1A1A1A] border-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
