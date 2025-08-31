"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"

export type ImageSuggestion = {
  id: string
  name: string
  category: string
  image: string
  isActive: boolean
  createdAt?: string
}

type ImageSuggestionsContextType = {
  suggestions: ImageSuggestion[]
  isLoading: boolean
  error: Error | null
  addSuggestion: (suggestion: Omit<ImageSuggestion, "id" | "createdAt">) => Promise<void>
  updateSuggestion: (id: string, data: Partial<Omit<ImageSuggestion, "id" | "createdAt">>) => Promise<void>
  deleteSuggestion: (id: string) => Promise<void>
  refreshSuggestions: () => Promise<void>
}

const ImageSuggestionsContext = createContext<ImageSuggestionsContextType | undefined>(undefined)

export function ImageSuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchSuggestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("image_suggestions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw new Error(error.message)

      // Map database fields to component fields
      const mappedData =
        data?.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image: item.image,
          isActive: item.is_active,
          createdAt: item.created_at,
        })) || []

      setSuggestions(mappedData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch suggestions"))
      console.error("Error fetching suggestions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addSuggestion = async (suggestion: Omit<ImageSuggestion, "id" | "createdAt">) => {
    try {
      const { data, error } = await supabase
        .from("image_suggestions")
        .insert([
          {
            name: suggestion.name,
            category: suggestion.category,
            image: suggestion.image,
            is_active: suggestion.isActive,
          },
        ])
        .select()

      if (error) throw new Error(error.message)

      if (data && data.length > 0) {
        const newSuggestion = {
          id: data[0].id,
          name: data[0].name,
          category: data[0].category,
          image: data[0].image,
          isActive: data[0].is_active,
          createdAt: data[0].created_at,
        }
        setSuggestions((prev) => [...prev, newSuggestion])
      }

      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add suggestion"
      console.error("Error adding suggestion:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateSuggestion = async (id: string, data: Partial<Omit<ImageSuggestion, "id" | "createdAt">>) => {
    try {
      // Convert from camelCase to snake_case for database
      const dbData: any = {}
      if (data.name !== undefined) dbData.name = data.name
      if (data.category !== undefined) dbData.category = data.category
      if (data.image !== undefined) dbData.image = data.image
      if (data.isActive !== undefined) dbData.is_active = data.isActive
      dbData.updated_at = new Date().toISOString()

      const { error } = await supabase.from("image_suggestions").update(dbData).eq("id", id)

      if (error) throw new Error(error.message)

      // Update local state
      setSuggestions((prev) =>
        prev.map((suggestion) => (suggestion.id === id ? { ...suggestion, ...data } : suggestion)),
      )

      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update suggestion"
      console.error("Error updating suggestion:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteSuggestion = async (id: string) => {
    try {
      const { error } = await supabase.from("image_suggestions").delete().eq("id", id)

      if (error) throw new Error(error.message)

      setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id))
      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete suggestion"
      console.error("Error deleting suggestion:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshSuggestions = async () => {
    await fetchSuggestions()
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  return (
    <ImageSuggestionsContext.Provider
      value={{
        suggestions,
        isLoading,
        error,
        addSuggestion,
        updateSuggestion,
        deleteSuggestion,
        refreshSuggestions,
      }}
    >
      {children}
    </ImageSuggestionsContext.Provider>
  )
}

export function useImageSuggestions() {
  const context = useContext(ImageSuggestionsContext)
  if (context === undefined) {
    throw new Error("useImageSuggestions must be used within an ImageSuggestionsProvider")
  }
  return context
}
