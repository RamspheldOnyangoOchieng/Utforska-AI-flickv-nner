"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"

export interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  linkUrl?: string
  isActive: boolean
  createdAt: string
}

type BannerContextType = {
  banners: Banner[]
  isLoading: boolean
  error: Error | null
  addBanner: (banner: Omit<Banner, "id" | "createdAt">) => Promise<void>
  updateBanner: (id: string, data: Partial<Omit<Banner, "id" | "createdAt">>) => Promise<void>
  deleteBanner: (id: string) => Promise<void>
  refreshBanners: () => Promise<void>
}

const BannerContext = createContext<BannerContextType | undefined>(undefined)

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Fetch banners from Supabase
  const fetchBanners = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // For public access, we only need active banners
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Convert snake_case to camelCase
      const formattedData =
        data?.map((banner) => ({
          id: banner.id,
          imageUrl: banner.image_url,
          title: banner.title,
          subtitle: banner.subtitle,
          buttonText: banner.button_text,
          buttonLink: banner.button_link,
          linkUrl: banner.link_url,
          isActive: banner.is_active,
          createdAt: banner.created_at,
        })) || []

      setBanners(formattedData)
    } catch (err) {
      console.error("Error fetching banners:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch banners"))

      // Fallback to default banners if there's an error
      setBanners([
        {
          id: "1",
          imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Su53G51ysIhrgtDSCWxEtmb5YHfRhN.png",
          title: "IMAGE GENERATOR",
          subtitle: "Create the perfect image in seconds",
          buttonText: "GENERATE NOW",
          buttonLink: "/generate",
          linkUrl: "/generate",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          imageUrl: "/placeholder.svg?height=244&width=1222",
          title: "PREMIUM FEATURES",
          subtitle: "Unlock exclusive content with our premium plan",
          buttonText: "UPGRADE NOW",
          buttonLink: "/premium",
          linkUrl: "/premium",
          isActive: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const addBanner = async (banner: Omit<Banner, "id" | "createdAt">) => {
    try {
      // Convert camelCase to snake_case for Supabase
      const { data, error } = await supabase
        .from("banners")
        .insert([
          {
            image_url: banner.imageUrl,
            title: banner.title,
            subtitle: banner.subtitle || null,
            button_text: banner.buttonText || null,
            button_link: banner.buttonLink || null,
            link_url: banner.linkUrl || null,
            is_active: banner.isActive,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Convert the returned data back to camelCase
      if (data && data.length > 0) {
        const newBanner: Banner = {
          id: data[0].id,
          imageUrl: data[0].image_url,
          title: data[0].title,
          subtitle: data[0].subtitle,
          buttonText: data[0].button_text,
          buttonLink: data[0].button_link,
          linkUrl: data[0].link_url,
          isActive: data[0].is_active,
          createdAt: data[0].created_at,
        }

        setBanners((prev) => [newBanner, ...prev])
      }

      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add banner"
      console.error("Error adding banner:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateBanner = async (id: string, data: Partial<Omit<Banner, "id" | "createdAt">>) => {
    try {
      // Convert camelCase to snake_case for Supabase
      const updateData: any = {}
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
      if (data.title !== undefined) updateData.title = data.title
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
      if (data.buttonText !== undefined) updateData.button_text = data.buttonText
      if (data.buttonLink !== undefined) updateData.button_link = data.buttonLink
      if (data.linkUrl !== undefined) updateData.link_url = data.linkUrl
      if (data.isActive !== undefined) updateData.is_active = data.isActive
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase.from("banners").update(updateData).eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, ...data } : banner)))

      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update banner"
      console.error("Error updating banner:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id)

      if (error) {
        throw error
      }

      setBanners((prev) => prev.filter((banner) => banner.id !== id))
      return Promise.resolve()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete banner"
      console.error("Error deleting banner:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshBanners = async () => {
    await fetchBanners()
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  return (
    <BannerContext.Provider
      value={{
        banners,
        isLoading,
        error,
        addBanner,
        updateBanner,
        deleteBanner,
        refreshBanners,
      }}
    >
      {children}
    </BannerContext.Provider>
  )
}

export function useBanners() {
  const context = useContext(BannerContext)
  if (context === undefined) {
    throw new Error("useBanners must be used within a BannerProvider")
  }
  return context
}
