"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GeneratedImage {
  id: string
  image_url: string
  prompt: string
  created_at: string
}

export default function CollectionsPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null)
  const [modalIndex, setModalIndex] = useState<number>(0)
  const [zoomed, setZoomed] = useState(false)
  const modalImgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    try {
      const stored = localStorage.getItem("my_images")
      if (stored) {
        setImages(JSON.parse(stored))
      }
    } catch (err) {
      setError("Failed to load your image collection")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
      setSelectAll(false)
    } else {
      setSelectedIds(images.map((img) => img.id))
      setSelectAll(true)
    }
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    const filtered = images.filter((img) => !selectedIds.includes(img.id))
    setImages(filtered)
    localStorage.setItem("my_images", JSON.stringify(filtered))
    setSelectedIds([])
    setSelectAll(false)
  }

  const handleDelete = (id: string) => {
    const filtered = images.filter((img) => img.id !== id)
    setImages(filtered)
    localStorage.setItem("my_images", JSON.stringify(filtered))
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
    if (modalImage && modalImage.id === id) {
      if (filtered.length === 0) {
        setModalOpen(false)
        setModalImage(null)
      } else {
        const newIdx = Math.max(0, Math.min(modalIndex, filtered.length - 1))
        setModalIndex(newIdx)
        setModalImage(filtered[newIdx])
      }
    }
  }

  const handleView = (img: GeneratedImage) => {
    const idx = images.findIndex((i) => i.id === img.id)
    setModalImage(img)
    setModalIndex(idx)
    setModalOpen(true)
    setZoomed(false)
  }

  const handleModalNav = (dir: "next" | "prev") => {
    if (!images.length) return
    let newIdx = modalIndex
    if (dir === "next") {
      newIdx = (modalIndex + 1) % images.length
    } else {
      newIdx = (modalIndex - 1 + images.length) % images.length
    }
    setModalIndex(newIdx)
    setModalImage(images[newIdx])
    setZoomed(false)
  }

  useEffect(() => {
    if (!modalOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleModalNav("next")
      if (e.key === "ArrowLeft") handleModalNav("prev")
      if (e.key === "Escape") setModalOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [modalOpen, modalIndex, images])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Image Collection</h1>

      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button variant={selectAll ? "secondary" : "outline"} onClick={handleSelectAll}>
            {selectAll ? "Unselect All" : "Select All"}
          </Button>
          <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
            Delete Selected
          </Button>
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
        </div>
      )}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-background rounded-xl shadow-inner border border-border">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-4 text-muted-foreground"><path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <h2 className="text-2xl font-semibold text-foreground">No images saved yet</h2>
          <p className="mt-2 text-muted-foreground">Generate and save images to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map((image) => {
            const selected = selectedSet.has(image.id)
            return (
              <div
                key={image.id}
                className={`relative group rounded-2xl overflow-hidden border transition-all duration-200 bg-background border-border ${selected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : "hover:shadow-xl"}`}
                style={{ minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div className="relative w-full h-80 cursor-pointer" onClick={() => handleView(image)}>
                  <Image src={image.image_url || "/placeholder.svg"} alt={image.prompt} fill unoptimized className="object-cover transition-transform duration-200 group-hover:scale-105" style={{ borderRadius: "1rem" }} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity rounded-2xl">
                    <div className="flex justify-between items-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleSelect(image.id)}
                        className="w-5 h-5 accent-primary bg-white rounded shadow"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select image"
                      />
                      <Button size="sm" variant="outline" className="!px-2 !py-1 text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(image.id) }}>Delete</Button>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); handleView(image) }}>View</Button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-base text-foreground font-medium line-clamp-3 mb-2">{image.prompt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">{new Date(image.created_at).toLocaleDateString()}</span>
                    {selected && <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">Selected</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ✅ FIXED Modal Section */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        {modalImage && (
          <DialogContent className="max-w-[95vw] sm:max-w-[32rem] p-0 overflow-hidden border-none bg-background rounded-2xl shadow-2xl">
            <button
              className="absolute top-3 right-3 z-10 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full p-2"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 rounded-full p-2 shadow border border-border"
                  onClick={() => handleModalNav("prev")}
                  aria-label="Previous image"
                >
                  &#8592;
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 rounded-full p-2 shadow border border-border"
                  onClick={() => handleModalNav("next")}
                  aria-label="Next image"
                >
                  &#8594;
                </button>
              </>
            )}

            <div
              ref={modalImgRef}
              className="relative w-full aspect-[3/4] bg-muted rounded-t-2xl overflow-hidden transition-transform"
              style={{
                transform: zoomed ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.3s ease-in-out",
                cursor: zoomed ? "zoom-out" : "zoom-in",
              }}
              onClick={(e) => {
                e.stopPropagation()
                setZoomed((z) => !z)
              }}
              title={zoomed ? "Click to zoom out" : "Click to zoom in"}
            >
              <Image
                src={modalImage.image_url || "/placeholder.svg"}
                alt={modalImage.prompt}
                fill
                unoptimized
                className="object-cover object-center w-full h-full"
                style={{ borderRadius: "1rem 1rem 0 0" }}
                sizes="(max-width: 640px) 90vw, 24rem"
              />
            </div>

            <div className="w-full text-center px-4 flex flex-col items-center mt-4">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{modalIndex + 1} / {images.length}</span>
                <button
                  className="ml-2 px-2 py-1 rounded bg-muted text-xs hover:bg-muted/80 border border-border"
                  onClick={() => {
                    const a = document.createElement("a")
                    a.href = modalImage.image_url
                    a.download = `image_${modalImage.id}.jpg`
                    a.click()
                  }}
                >
                  Download
                </button>
              </div>
              <p className="text-lg font-semibold mb-2 text-foreground break-words">{modalImage.prompt}</p>
              <p className="text-xs text-muted-foreground mb-4">{new Date(modalImage.created_at).toLocaleString()}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2 px-4 pb-4">
              <Button variant="destructive" className="w-full sm:w-1/2" onClick={() => { handleDelete(modalImage.id); setModalOpen(false) }}>Delete</Button>
              <Button variant="secondary" className="w-full sm:w-1/2" onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
