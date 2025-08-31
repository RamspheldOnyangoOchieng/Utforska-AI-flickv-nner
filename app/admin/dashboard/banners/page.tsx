"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { Home, Search, Trash2, Edit, Plus, Upload, Save, X, AlertTriangle, LinkIcon } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"

interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  isActive: boolean
  createdAt: string
  linkUrl: string
}

export default function AdminBannersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [supabaseClient, setSupabaseClient] = useState(createClient())

  const [banners, setBanners] = useState<Banner[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([])

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    linkUrl: "",
  })

  // Fetch available buckets
  useEffect(() => {
    async function fetchBuckets() {
      try {
        const { data, error } = await supabaseClient.storage.listBuckets()
        if (error) {
          console.error("Error fetching buckets:", error)
          return
        }

        if (data && data.length > 0) {
          setAvailableBuckets(data.map((bucket) => bucket.name))
          console.log(
            "Available buckets:",
            data.map((bucket) => bucket.name),
          )
        }
      } catch (err) {
        console.error("Error fetching buckets:", err)
      }
    }

    if (user) {
      fetchBuckets()
    }
  }, [user, supabaseClient])

  // Fetch banners from Supabase
  useEffect(() => {
    async function fetchBanners() {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabaseClient
          .from("banners")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Convert snake_case to camelCase
        const formattedData = data.map((banner) => ({
          id: banner.id,
          imageUrl: banner.image_url,
          title: banner.title,
          subtitle: banner.subtitle,
          buttonText: banner.button_text,
          buttonLink: banner.button_link,
          linkUrl: banner.link_url,
          isActive: banner.is_active,
          createdAt: banner.created_at,
        }))

        setBanners(formattedData)
      } catch (err) {
        console.error("Error fetching banners:", err)
        setError("Failed to load banners. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchBanners()
    }
  }, [user, supabaseClient])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Refresh the Supabase client when the user changes to ensure auth is current
    if (user) {
      setSupabaseClient(createClient())
    }
  }, [user])

  // Filter banners based on search term
  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Handle image upload with fallback options
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Check if we have any available buckets
      if (availableBuckets.length === 0) {
        toast({
          title: "Storage not available",
          description: "Please enter an image URL directly instead.",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Use the first available bucket
      const bucketName = availableBuckets[0]

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `banner-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error } = await supabaseClient.storage.from(bucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Storage upload error:", error)
        throw error
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabaseClient.storage.from(bucketName).getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, imageUrl: publicUrl }))

      toast({
        title: "Image uploaded",
        description: "The banner image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload the banner image. Please enter a URL directly instead.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddBanner = async () => {
    if (!formData.imageUrl || !formData.title || !formData.linkUrl) {
      toast({
        title: "Missing information",
        description: "Please provide an image, title, and link URL for the banner.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convert camelCase to snake_case for Supabase
      const { data, error } = await supabaseClient
        .from("banners")
        .insert([
          {
            image_url: formData.imageUrl,
            title: formData.title,
            subtitle: formData.subtitle || null,
            button_text: formData.buttonText || null,
            button_link: formData.buttonLink || null,
            link_url: formData.linkUrl,
            is_active: true,
          },
        ])
        .select()

      if (error) {
        console.error("Supabase error:", error)
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

      setIsAdding(false)
      setFormData({
        imageUrl: "",
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
        linkUrl: "",
      })

      toast({
        title: "Banner added",
        description: "The new banner has been added successfully.",
      })
    } catch (err) {
      console.error("Error adding banner:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBanner = async () => {
    if (!isEditing) return

    if (!formData.imageUrl || !formData.title || !formData.linkUrl) {
      toast({
        title: "Missing information",
        description: "Please provide an image, title, and link URL for the banner.",
        variant: "destructive",
      })
      return
    }

    try {
      // Convert camelCase to snake_case for Supabase
      const { error } = await supabaseClient
        .from("banners")
        .update({
          image_url: formData.imageUrl,
          title: formData.title,
          subtitle: formData.subtitle || null,
          button_text: formData.buttonText || null,
          button_link: formData.buttonLink || null,
          link_url: formData.linkUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", isEditing)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Update local state
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === isEditing
            ? {
                ...banner,
                imageUrl: formData.imageUrl,
                title: formData.title,
                subtitle: formData.subtitle,
                buttonText: formData.buttonText,
                buttonLink: formData.buttonLink,
                linkUrl: formData.linkUrl,
              }
            : banner,
        ),
      )

      setIsEditing(null)
      setFormData({
        imageUrl: "",
        title: "",
        subtitle: "",
        buttonText: "",
        buttonLink: "",
        linkUrl: "",
      })

      toast({
        title: "Banner updated",
        description: "The banner has been updated successfully.",
      })
    } catch (err) {
      console.error("Error updating banner:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBanner = async (id: string) => {
    try {
      const { error } = await supabaseClient.from("banners").delete().eq("id", id)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      setBanners((prev) => prev.filter((banner) => banner.id !== id))

      toast({
        title: "Banner deleted",
        description: "The banner has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting banner:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditBanner = (banner: Banner) => {
    setIsEditing(banner.id)
    setFormData({
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      linkUrl: banner.linkUrl || "",
    })
  }

  const handleToggleActive = async (id: string) => {
    try {
      const banner = banners.find((b) => b.id === id)
      if (!banner) return

      const { error } = await supabaseClient.from("banners").update({ is_active: !banner.isActive }).eq("id", id)

      if (error) {
        throw error
      }

      setBanners((prev) =>
        prev.map((banner) => (banner.id === id ? { ...banner, isActive: !banner.isActive } : banner)),
      )

      toast({
        title: banner.isActive ? "Banner deactivated" : "Banner activated",
        description: `The banner has been ${banner.isActive ? "deactivated" : "activated"} successfully.`,
      })
    } catch (err) {
      console.error("Error toggling banner status:", err)
      toast({
        title: "Error",
        description: "Failed to update banner status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Banner Management</h2>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Promotional Banners ({banners.length})</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search banners..."
                      className="pl-9 bg-[#252525] border-[#333] text-white w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Add/Edit Banner Form */}
              {(isAdding || isEditing) && (
                <div className="mb-6 p-4 bg-[#252525] rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{isAdding ? "Add New Banner" : "Edit Banner"}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false)
                        setIsEditing(null)
                        setFormData({
                          imageUrl: "",
                          title: "",
                          subtitle: "",
                          buttonText: "",
                          buttonLink: "",
                          linkUrl: "",
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Banner Image (1222x244px)</label>
                      <div className="flex flex-col gap-2">
                        {formData.imageUrl && (
                          <div className="relative w-full h-32 bg-[#1A1A1A] rounded-lg overflow-hidden">
                            <img
                              src={formData.imageUrl || "/placeholder.svg"}
                              alt="Banner preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          {availableBuckets.length > 0 ? (
                            <label className="flex-1">
                              <div className="relative flex items-center justify-center w-full h-10 bg-[#1A1A1A] border border-[#333] rounded-md cursor-pointer hover:bg-[#252525]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleImageUpload}
                                  disabled={isUploading}
                                />
                                {isUploading ? (
                                  <span className="flex items-center">
                                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                  </span>
                                )}
                              </div>
                            </label>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                toast({
                                  title: "Storage not available",
                                  description: "Please enter an image URL directly.",
                                })
                              }}
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Use Image URL
                            </Button>
                          )}
                          <Input
                            placeholder="Enter image URL"
                            className="flex-1 bg-[#1A1A1A] border-[#333] text-white"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <Input
                          placeholder="Banner title"
                          className="bg-[#1A1A1A] border-[#333] text-white"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle (optional)</label>
                        <Input
                          placeholder="Banner subtitle"
                          className="bg-[#1A1A1A] border-[#333] text-white"
                          value={formData.subtitle}
                          onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Banner Link URL (required)</label>
                      <Input
                        placeholder="/page or https://example.com"
                        className="bg-[#1A1A1A] border-[#333] text-white"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        The entire banner will be clickable and link to this URL
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Button Text (optional)</label>
                      <Input
                        placeholder="Call to action text"
                        className="bg-[#1A1A1A] border-[#333] text-white"
                        value={formData.buttonText}
                        onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Button Link (optional)</label>
                      <Input
                        placeholder="/page or https://example.com"
                        className="bg-[#1A1A1A] border-[#333] text-white"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        If provided, a button will appear on the banner with this link
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={isAdding ? handleAddBanner : handleUpdateBanner}
                      disabled={!formData.imageUrl || !formData.title || !formData.linkUrl}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isAdding ? "Add Banner" : "Update Banner"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Banners Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Image</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Link</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Button</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Active</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBanners.length > 0 ? (
                      filteredBanners.map((banner) => (
                        <tr key={banner.id} className="border-b border-[#252525] hover:bg-[#252525]/50">
                          <td className="py-3 px-4">
                            <div className="w-20 h-10 bg-[#252525] rounded-md overflow-hidden">
                              <img
                                src={banner.imageUrl || "/placeholder.svg"}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{banner.title}</div>
                              {banner.subtitle && <div className="text-sm text-gray-400">{banner.subtitle}</div>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-400">{banner.linkUrl}</span>
                          </td>
                          <td className="py-3 px-4">
                            {banner.buttonText ? (
                              <div className="flex flex-col">
                                <span className="text-sm">{banner.buttonText}</span>
                                {banner.buttonLink && (
                                  <span className="text-xs text-gray-400">{banner.buttonLink}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleToggleActive(banner.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                  banner.isActive ? "bg-primary" : "bg-input"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                    banner.isActive ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {format(new Date(banner.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                onClick={() => handleEditBanner(banner)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeleteBanner(banner.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          {searchTerm
                            ? "No banners found matching your search."
                            : "No banners found. Add one to get started."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
