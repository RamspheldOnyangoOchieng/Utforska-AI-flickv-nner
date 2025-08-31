"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface ClearChatDialogProps {
  onConfirm: () => Promise<void>
  isClearing: boolean
}

export function ClearChatDialog({ onConfirm, isClearing }: ClearChatDialogProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" title="Clear chat history">
          <Trash2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-[#252525] text-white">
        <DialogHeader>
          <DialogTitle>Clear chat history</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to clear your chat history? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isClearing ? "Clearing..." : "Clear history"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-[#252525] text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
