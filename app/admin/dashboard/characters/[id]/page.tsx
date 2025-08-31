"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-context"
import { useCharacters } from "@/components/character-context"
import {
  LogOut,
  Settings,
  Home,
  Users,
  ImageIcon,
  MessageSquare,
  BarChart,
  ArrowLeft,
  Wand2,
  Upload,
  AlertTriangle,
} from "lucide-react"
import { generateCharacterDescription, generateSystemPrompt, type GenerateCharacterParams } from "@/lib/openai"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Helper function to safely convert errors to strings
const formatError = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    return String(err.message)
  }
  return String(err)
}

// Add this helper function at the top of the file, outside the component
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const { user, isLoading, refreshSession } = useAuth()
  const { getCharacter, updateCharacter, uploadImage } = useCharacters()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    image: "/placeholder.svg?height=400&width=300",
    description: "",
    personality: "",
    occupation: "",
    hobbies: "",
    body: "Average",
    ethnicity: "Mixed",
    language: "English",
    relationship: "Single",
    systemPrompt: "",
    isNew: false,
    category: "anime", // Default category
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [notFound, setNotFound] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Load character data
  useEffect(() => {
    const character = getCharacter(params.id)
    if (character) {
      setFormData({
        name: character.name,
        age: character.age,
        image: character.image,
        description: character.description,
        personality: character.personality || "",
        occupation: character.occupation || "",
        hobbies: character.hobbies || "",
        body: character.body || "Average",
        ethnicity: character.ethnicity || "Mixed",
        language: character.language || "English",
        relationship: character.relationship || "Single",
        systemPrompt: character.systemPrompt || "",
        isNew: character.isNew,
        category: character.category || "anime", // Use existing category or default to anime
      })

      // Set image preview if character has an image
      if (character.image && !character.image.includes("placeholder")) {
        setImagePreview(character.image)
      }
    } else {
      setNotFound(true)
    }
  }, [params.id, getCharacter])

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number.parseInt(value) || 18 : value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Replace the existing handleImageChange function with this one
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("Image file is too large. Please choose a smaller image (max 10MB).")
      return
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setError("Unsupported image format. Please use JPG, PNG, WebP, or GIF images.")
      return
    }

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the image
    try {
      setIsUploading(true)
      setError("")

      // Create a FormData object for the upload
      const formData = new FormData()
      formData.append("file", await convertFileToBase64(file))
      formData.append("upload_preset", "ai-characters-preset") // Replace with your actual preset name
      formData.append("folder", "ai-characters")

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"

      // Make a direct POST request to the Cloudinary API
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Cloudinary API error: ${errorData.error?.message || "Unknown error"}`)
      }

      const result = await response.json()

      if (!result.secure_url) {
        throw new Error("Failed to upload image to Cloudinary")
      }

      setFormData((prev) => ({ ...prev, image: result.secure_url }))
    } catch (err) {
      console.error("Error uploading image:", err)
      setError(formatError(err))

      // Keep the image preview even if upload failed
      setFormData((prev) => ({
        ...prev,
        image: imagePreview || "/placeholder.svg?height=400&width=300",
      }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setError("Please enter a name before generating a description")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const params: GenerateCharacterParams = {
        name: formData.name,
        age: formData.age,
        occupation: formData.occupation,
        personality: formData.personality,
        interests: formData.hobbies,
      }

      const description = await generateCharacterDescription(params)
      setFormData((prev) => ({ ...prev, description }))
    } catch (err) {
      console.error("Error generating description:", err)
      setError(formatError(err))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateSystemPrompt = async () => {
    if (!formData.name || !formData.description) {
      setError("Please enter a name and description before generating a system prompt")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const systemPrompt = await generateSystemPrompt({
        name: formData.name,
        age: formData.age,
        description: formData.description,
        personality: formData.personality,
        occupation: formData.occupation,
        hobbies: formData.hobbies,
      })

      setFormData((prev) => ({ ...prev, systemPrompt }))
    } catch (err) {
      console.error("Error generating system prompt:", err)
      setError(formatError(err))
    } finally {
      setIsGenerating(false)
    }
  }

  // Update the handleSubmit function to handle auth errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      setError("Name, description, and system prompt are required")
      return
    }

    setIsSaving(true)

    try {
      try {
        // Try to refresh the session before updating
        await refreshSession()

        // Update the character
        await updateCharacter(params.id, formData)
      } catch (updateErr) {
        // Check if it's an auth error
        if (
          updateErr instanceof Error &&
          (updateErr.message.includes("Authentication") ||
            updateErr.message.includes("auth") ||
            updateErr.message.includes("token"))
        ) {
          // Try to refresh auth and retry
          const refreshSuccess = await refreshSession()

          if (!refreshSuccess) {
            throw new Error("Authentication session expired. Please log out and log in again.")
          }

          // Try again
          await updateCharacter(params.id, formData)
        } else {
          throw updateErr
        }
      }

      router.push("/admin/dashboard/characters")
    } catch (err) {
      console.error("Error updating character:", err)
      setError(formatError(err))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Character Not Found</h2>
          <p className="mb-6">The character you're looking for doesn't exist or has been deleted.</p>
          <Button
            onClick={() => router.push("/admin/dashboard/characters")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Back to Characters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Admin Sidebar */}
        <div className="w-64 bg-[#1A1A1A] border-r border-[#252525] flex flex-col">
          <div className="p-4 border-b border-[#252525]">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/dashboard")}>
                <Settings className="mr-2 h-5 w-5" />
                Site Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/dashboard/users")}
              >
                <Users className="mr-2 h-5 w-5" />
                Users
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start bg-[#252525]"
                onClick={() => router.push("/admin/dashboard/characters")}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Characters
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ImageIcon className="mr-2 h-5 w-5" />
                Images
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart className="mr-2 h-5 w-5" />
                Analytics
              </Button>
            </div>
          </nav>

          <div className="p-4 border-t border-[#252525]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/login")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => router.push("/admin/dashboard/characters")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">Edit Character: {formData.name}</h2>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="age" className="block text-sm font-medium text-gray-300">
                        Age
                      </label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age.toString()}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="occupation" className="block text-sm font-medium text-gray-300">
                        Occupation
                      </label>
                      <Input
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character occupation"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="personality" className="block text-sm font-medium text-gray-300">
                        Personality
                      </label>
                      <Input
                        id="personality"
                        name="personality"
                        value={formData.personality}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Friendly, Outgoing, Shy"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hobbies" className="block text-sm font-medium text-gray-300">
                        Hobbies
                      </label>
                      <Input
                        id="hobbies"
                        name="hobbies"
                        value={formData.hobbies}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Reading, Hiking, Photography"
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Details</h3>

                    {/* Character Category Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Character Category</label>
                      <RadioGroup
                        value={formData.category}
                        onValueChange={handleCategoryChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="girls" id="girls" />
                          <Label htmlFor="girls" className="text-white">
                            Girls
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anime" id="anime" />
                          <Label htmlFor="anime" className="text-white">
                            Anime
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="guys" id="guys" />
                          <Label htmlFor="guys" className="text-white">
                            Guys
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Character Image</label>
                      <div
                        className="relative aspect-square w-full max-w-[200px] bg-[#252525] rounded-lg overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Character preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            <Upload className="h-8 w-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-400 text-center">
                              {isUploading ? "Uploading..." : "Click to upload image"}
                            </p>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="body" className="block text-sm font-medium text-gray-300">
                        Body Type
                      </label>
                      <Input
                        id="body"
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Athletic, Slim, Average"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-300">
                        Ethnicity
                      </label>
                      <Input
                        id="ethnicity"
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character ethnicity"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="language" className="block text-sm font-medium text-gray-300">
                        Language
                      </label>
                      <Input
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., English, Spanish, Mandarin"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="relationship" className="block text-sm font-medium text-gray-300">
                        Relationship Status
                      </label>
                      <Input
                        id="relationship"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Single, Married, Complicated"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="isNew"
                          name="isNew"
                          type="checkbox"
                          checked={formData.isNew}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isNew" className="ml-2 block text-sm text-gray-300">
                          Mark as New
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">Characters marked as new will display a "New" badge.</p>
                    </div>
                  </div>
                </div>

                {/* AI Generated Content */}
                <div className="space-y-4 pt-4 border-t border-[#252525]">
                  <h3 className="text-lg font-medium">AI Generated Content</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                        Character Description
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Regenerate Description"}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="bg-[#252525] border-[#333] text-white min-h-[100px]"
                      placeholder="A brief description of the character"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300">
                        System Prompt
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateSystemPrompt}
                        disabled={isGenerating}
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Regenerate System Prompt"}
                      </Button>
                    </div>
                    <Textarea
                      id="systemPrompt"
                      name="systemPrompt"
                      value={formData.systemPrompt}
                      onChange={handleChange}
                      className="bg-[#252525] border-[#333] text-white min-h-[150px]"
                      placeholder="The system prompt that will guide the AI's responses as this character"
                    />
                    <p className="text-xs text-gray-400">
                      This prompt will instruct the AI on how to behave and respond as this character.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => router.push("/admin/dashboard/characters")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Update Character"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
