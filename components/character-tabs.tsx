"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CharacterGrid } from "./character-grid"
import type { Character } from "@/types/character"

interface CharacterTabsProps {
  characters: Character[]
}

export function CharacterTabs({ characters }: CharacterTabsProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter characters based on the active tab
  const filteredCharacters =
    activeTab === "all" ? characters : characters.filter((character) => character.category === activeTab)

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="girls">Girls</TabsTrigger>
        <TabsTrigger value="anime">Anime</TabsTrigger>
        <TabsTrigger value="guys">Guys</TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-0">
        <CharacterGrid characters={filteredCharacters} />
      </TabsContent>
    </Tabs>
  )
}
