"use client"

// components/character-chat.tsx

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface CharacterChatProps {
  characterName: string
}

const CharacterChat: React.FC<CharacterChatProps> = ({ characterName }) => {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string | null>(null) // Example state

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate fetching initial messages or character data
    const initialMessages = [`Hello, I am ${characterName}!`, "Nice to meet you."]
    setMessages(initialMessages)

    // Simulate fetching an image URL
    const fetchImageUrl = async () => {
      // Replace with actual API call or data source
      const url = `https://example.com/images/${characterName.toLowerCase()}.jpg` // Example URL
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newImageUrl = Math.random() > 0.5 ? url : null // Simulate image sometimes not existing

      if (newImageUrl !== imageUrl) {
        setImageUrl(newImageUrl)
      }
    }

    fetchImageUrl()
  }, [characterName, imageUrl])

  useEffect(() => {
    // Scroll to bottom of chat on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, newMessage])
      setNewMessage("")
    }
  }

  return (
    <div className="character-chat">
      <h2>{characterName} Chat</h2>
      {imageUrl && <img src={imageUrl || "/placeholder.svg"} alt={`${characterName}`} />}
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}

export default CharacterChat
