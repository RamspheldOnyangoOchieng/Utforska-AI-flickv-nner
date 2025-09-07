"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Download, Heart, ImageIcon, Plus, X } from "lucide-react"
import { getCollection } from "@/lib/collection-actions"
import { deleteExistingImage, toggleImageFavorite, removeImageFromExistingCollection } from "@/lib/image-actions"

interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface GeneratedImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  model_used: string
  tags?: string[]
  favorite?: boolean
  collection_id?: string
}

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [isFavoriting, setIsFavoriting] = useState<string | null>(null)

  const fetchCollection = async () => {
    setIsLoading(true)
    try {
      const result = await getCollection(params.id)
      if (result.success) {
        setCollection(result.collection)
        setImages(result.images)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error fetching collection:", error)
      toast({
        title: "Error",
        description: "Failed to load collection. Please try again.",
        variant: "destructive",
      })
      router.push("/collections")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollection()
  }, [params.id]) // Remove toast and router from dependencies

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return
    }

    setIsDeleting(id)
    try {
      const result = await deleteExistingImage(id)

      if (result.success) {
        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
        setImages(images.filter((img) => img.id !== id))
        if (selectedImage?.id === id) {
          setSelectedImage(null)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRemoveFromCollection = async (id: string) => {
    if (!confirm("Are you sure you want to remove this image from the collection?")) {
      return
    }

    setIsRemoving(id)
    try {
      const result = await removeImageFromExistingCollection(id)

      if (result.success) {
        toast({
          title: "Success",
          description: "Image removed from collection",
        })
        setImages(images.filter((img) => img.id !== id))
        if (selectedImage?.id === id) {
          setSelectedImage(null)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error removing image from collection:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove image from collection",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(null)
    }
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    setIsFavoriting(id)
    try {
      const result = await toggleImageFavorite(id, !isFavorite)

      if (result.success) {
        toast({
          title: "Success",
          description: !isFavorite ? "Added to favorites" : "Removed from favorites",
        })
        setImages(images.map((img) => (img.id === id ? { ...img, favorite: !isFavorite } : img)))
        if (selectedImage?.id === id) {
          setSelectedImage({ ...selectedImage, favorite: !isFavorite })
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorite status",
        variant: "destructive",
      })
    } finally {
      setIsFavoriting(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/collections")}
        className="mb-6 bg-[#252525] border-[#333333]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collections
      </Button>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : collection ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.description && <p className="text-gray-400 mt-2">{collection.description}</p>}
          </div>

          {images.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-[#252525]">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-[#252525] p-6 rounded-full mb-4">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Images in This Collection</h2>
                <p className="text-gray-400 mb-6 max-w-md">Add images to this collection from your generated images.</p>
                <Button onClick={() => router.push("/generate")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Images
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.id} className="bg-[#1A1A1A] border-[#252525] overflow-hidden">
                  <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImage(image)}>
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">{image.prompt}</p>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(image.id, !!image.favorite)
                        }}
                        disabled={isFavoriting === image.id}
                        className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                      >
                        {isFavoriting === image.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 ${image.favorite ? "fill-red-500 text-red-500" : ""}`} />
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(image.image_url, image.prompt)
                          }}
                          className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFromCollection(image.id)
                          }}
                          disabled={isRemoving === image.id}
                          className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                        >
                          {isRemoving === image.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
          <p className="text-gray-400 mb-6">The collection you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/collections")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            View All Collections
          </Button>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1A1A1A] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative aspect-square max-h-[80vh]">
              <Image
                src={selectedImage.image_url || "/placeholder.svg"}
                alt={selectedImage.prompt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="p-4 bg-[#1A1A1A]">
              <p className="text-sm text-gray-300 mb-4">{selectedImage.prompt}</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedImage.id, !!selectedImage.favorite)}
                  disabled={isFavoriting === selectedImage.id}
                  className="bg-[#252525] border-[#333333]"
                >
                  {isFavoriting === selectedImage.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Heart className={`h-4 w-4 mr-2 ${selectedImage.favorite ? "fill-red-500 text-red-500" : ""}`} />
                  )}
                  {selectedImage.favorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage.image_url, selectedImage.prompt)}
                  className="bg-[#252525] border-[#333333]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromCollection(selectedImage.id)}
                  disabled={isRemoving === selectedImage.id}
                  className="bg-[#252525] border-[#333333]"
                >
                  {isRemoving === selectedImage.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Remove from Collection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
