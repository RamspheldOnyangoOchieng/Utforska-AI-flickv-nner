"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugPanelProps {
  characterId: string | undefined
  chatId: string | undefined
  handleClearChat: () => void
  handleResetCharacter: () => void
  isOpen: boolean
}

export function DebugPanel({ characterId, chatId, handleClearChat, handleResetCharacter, isOpen }: DebugPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="font-medium">Character ID:</div>
              <div>{characterId}</div>
              <div className="font-medium">Chat ID:</div>
              <div>{chatId}</div>
            </div>
            <div className="text-xs font-medium">Actions:</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleClearChat}>
                Clear Chat
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleResetCharacter}>
                Reset Character
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
