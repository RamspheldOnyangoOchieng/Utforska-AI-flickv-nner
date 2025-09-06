"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Share2, X, Save, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageModalProps {
  images: string[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (imageUrl: string, index: number) => void
  onShare: (imageUrl: string) => void
  onSave?: (index: number) => void
  savingIndex?: number | null
}

export function ImageModal({
  images,
  initialIndex,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onSave,
  savingIndex,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
        case "Escape":
          onOpenChange(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!images.length) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-[#0A0A0A] border-[#252525] rounded-lg">
        <DialogTitle className="sr-only">Image View</DialogTitle>
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image container */}
          <div className="relative aspect-square max-h-[80vh] overflow-hidden rounded-lg">
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain rounded-2xl shadow-lg shadow-blue-500/40"
              unoptimized // Important for external URLs
            />
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 p-4 bg-[#1A1A1A] rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onDownload(images[currentIndex], currentIndex)}
            className="bg-[#252525] border-[#333333] hover:bg-[#333333]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() => onShare(images[currentIndex])}
            className="bg-[#252525] border-[#333333] hover:bg-[#333333]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {onSave && (
            <Button
              variant="outline"
              onClick={() => onSave(currentIndex)}
              disabled={savingIndex === currentIndex}
              className="bg-[#252525] border-[#333333] hover:bg-[#333333]"
            >
              {savingIndex === currentIndex ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
