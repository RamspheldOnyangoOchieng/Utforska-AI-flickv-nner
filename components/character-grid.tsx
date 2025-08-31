"use client"

import { useState, useEffect } from "react"
import { CharacterCard } from "./character-card"
import { formatDistanceToNow } from "date-fns"
import type { Character } from "@/types/character"

interface CharacterGridProps {
  characters: Character[]
  selectedTab?: string
  showOnlyWithChatHistory?: boolean
}

export function CharacterGrid({
  characters = [],
  selectedTab = "All",
  showOnlyWithChatHistory = false,
}: CharacterGridProps) {
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])

  // Safe date formatting function
  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return "Recently"

      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return "Recently"
      }

      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Recently"
    }
  }

  useEffect(() => {
    // Filter characters based on selected tab
    if (selectedTab === "All") {
      setFilteredCharacters(characters)
    } else {
      setFilteredCharacters(characters.filter((character) => character.category === selectedTab))
    }
  }, [characters, selectedTab])

  useEffect(() => {
    if (showOnlyWithChatHistory) {
      // Filter to only show characters with chat history
      // This is a simplified check - in a real app, you'd check local storage or database
      const charactersWithHistory = characters.filter((character) => {
        try {
          const history = localStorage.getItem(`chat:${character.id}`)
          return history && JSON.parse(history).length > 0
        } catch (error) {
          console.error("Error checking chat history:", error)
          return false
        }
      })
      setFilteredCharacters(charactersWithHistory)
    }
  }, [characters, showOnlyWithChatHistory])

  return (
    <div className="grid grid-cols-2 gap-3 px-2 md:px-6 lg:px-8 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto mt-4">
      {filteredCharacters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  )
}
