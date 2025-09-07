"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { getCollection, updateExistingCollection } from "@/lib/collection-actions"

interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const fetchCollection = async () => {
    setIsLoading(true)
    try {
      const result = await getCollection(params.id)
      if (result.success) {
        setCollection(result.collection)
        setName(result.collection.name)
        setDescription(result.collection.description || "")
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)

      const result = await updateExistingCollection(params.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Collection updated successfully",
        })
        router.push(`/collections/${params.id}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating collection:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update collection",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/collections/${params.id}`)}
        className="mb-6 bg-[#252525] border-[#333333]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collection
      </Button>

      <h1 className="text-3xl font-bold mb-6">Edit Collection</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : collection ? (
        <Card className="bg-[#1A1A1A] border-[#252525]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Collection"
                  required
                  className="bg-[#252525] border-[#333333]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A collection of my favorite images"
                  className="bg-[#252525] border-[#333333]"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/collections/${params.id}`)}
                  className="bg-[#252525] border-[#333333]"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
          <p className="text-gray-400 mb-6">The collection you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/collections")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            View All Collections
          </Button>
        </div>
      )}
    </div>
  )
}
