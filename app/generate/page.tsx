"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Wand2, Loader2, Download, Share2, AlertCircle, ChevronLeft, FolderOpen, Clock } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ImageModal } from "@/components/image-modal"
import { useAuth } from "@/components/auth-context"
import { useSidebar } from "@/components/sidebar-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  getImageSuggestions,
  getImageSuggestionsByCategory,
  type ImageSuggestion,
} from "@/app/actions/image-suggestions"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTranslations } from "@/lib/use-translations"

// Remove the static imageOptions array and replace with dynamic calculation
// Get selected option for token calculation - move this logic up and make it dynamic
const imageOptions = [
  { value: "1", label: "1", tokens: 5 },
  { value: "4", label: "4", tokens: 20 },
  { value: "6", label: "6", tokens: 30 },
  { value: "8", label: "8", tokens: 40 },
]

export default function GenerateImagePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const { setIsOpen } = useSidebar()
  const { t } = useTranslations()
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  // Controls visibility of the Negative Prompt textarea
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)
  const [selectedCount, setSelectedCount] = useState("1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("")
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [savingImageIndex, setSavingImageIndex] = useState<number | null>(null)
  // const [autoSaving, setAutoSaving] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [timeoutWarning, setTimeoutWarning] = useState(false)

  // Helper function to get valid image src
  const getValidImageSrc = (src: string | null | undefined, fallback: string): string => {
    if (typeof src === "string" && src.trim() !== "") {
      return src
    }
    return fallback
  }

  // Automatically close the sidebar on component mount
  useEffect(() => {
    setIsOpen(false)
  }, [])

  // Fetch suggestions on component mount
  useEffect(() => {
    async function loadSuggestions() {
      setIsLoadingSuggestions(true)
      try {
        const data = await getImageSuggestions()
        setSuggestions(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category)))
        setCategories(uniqueCategories)

        // Set default active category if available
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0])
        }
      } catch (error) {
        console.error("Error loading suggestions:", error)
        toast({
          title: t("general.error"),
          description: "Failed to load suggestions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, []) // Remove toast from dependencies

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category)
    setIsLoadingSuggestions(true)

    try {
      const data = await getImageSuggestionsByCategory(category)
      setSuggestions(data)
    } catch (error) {
      console.error("Error loading suggestions for category:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }
    }
  }, [])

  // Progress simulation for better UX
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (isGenerating) {
      setGenerationProgress(0)
      setTimeoutWarning(false)

      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            // Show timeout warning after 20 seconds
            if (prev >= 95) {
              setTimeoutWarning(true)
            }
            return prev + 0.5 // Slow down near the end
          }
          return prev + Math.random() * 3 + 1 // Random progress increments
        })
      }, 1000)
    } else {
      setGenerationProgress(0)
      setTimeoutWarning(false)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [isGenerating])

  // Auto-save generated images when they're ready (no loader, just save silently, and avoid infinite loop)
  const savedImagesRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (generatedImages.length > 0 && user) {
      generatedImages.forEach((imageUrl) => {
        if (!savedImagesRef.current.has(imageUrl)) {
          savedImagesRef.current.add(imageUrl)
          saveImageToCollection(imageUrl, -1, false)
        }
      })
    }
    // Reset the ref if all images are cleared
    if (generatedImages.length === 0) {
      savedImagesRef.current.clear()
    }
  }, [generatedImages, user?.id])

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      })
      return
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to generate and save images",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])
    setGenerationProgress(0)
    setTimeoutWarning(false)

    try {
      let response: Response
      let endpoint: string
      let requestBody: any

      // Always use Seedream 3.0 API now
      endpoint = "/api/generate-image"
      requestBody = {
        prompt,
        negativePrompt,
        model: "stability",
        response_format: "url",
        size: "512x1024",
        seed: -1,
        guidance_scale: 7.5,
        watermark: true,
        selectedCount, // Send the number of images selected
        selectedModel: "stability", // Send the model type for token calculation
      }

      // Create AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        setError("Request timed out. Please try again with a simpler prompt or fewer images.")
        setIsGenerating(false)
      }, 45000) // 45 second timeout on frontend

      try {
        // Get the current session token for authentication
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        let accessToken = session?.access_token

        // If we don't have a token, try a refresh, but don't treat it as a hard error if it fails.
        if (!accessToken) {
          console.log("🔄 No access token found, attempting to refresh session...")
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshData?.session) {
            accessToken = refreshData.session.access_token
            console.log("✅ Session refreshed successfully")
          } else if (refreshError) {
            console.warn("⚠️ Session refresh failed:", refreshError.message)
          }
        }

        // Now, decide which auth method to use
        if (accessToken) {
          console.log("✅ Using access token for authentication.")
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          })
        } else if (user?.id) {
          console.log("🔄 No access token, falling back to User ID.")
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": user.id,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          })
        } else {
          // If we have no token and no user ID, then we are truly unauthenticated.
          throw new Error("Unable to authenticate. Please log out and log in again.")
        }

        clearTimeout(timeoutId) // Clear timeout since fetch completed
      } catch (fetchError) {
        clearTimeout(timeoutId) // Also clear on error
        if (fetchError && typeof fetchError === "object" && "name" in fetchError && fetchError.name === "AbortError") {
          setError("Request timed out. The image generation is taking longer than expected. Please try again.")
        } else {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "An unexpected network error occurred.",
          )
        }
        setIsGenerating(false)
        return
      }

      // Enhanced error handling for non-JSON responses
      let data
      try {
        // First check if the response is ok
        if (!response.ok) {
          // Handle specific status codes
          if (response.status === 408 || response.status === 504) {
            setError("Request timed out. Please try again with a simpler prompt or fewer images.")
            setIsGenerating(false)
            return
          }

          // Try to get error message from response
          let errorMessage = `Request failed with status ${response.status}`
          try {
            const errorText = await response.text()
            // Try to parse as JSON first
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.error || errorJson.message || errorMessage
            } catch {
              // If not JSON, use the text if it's reasonable length
              if (errorText && errorText.length < 200 && !errorText.includes("<html>")) {
                errorMessage = errorText
              }
            }
          } catch {
            // Fallback to status text
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }

        // Try to parse successful response as JSON
        const responseText = await response.text()
        if (!responseText) {
          throw new Error("Empty response from server")
        }

        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", responseText)
          throw new Error("Invalid response format from server")
        }
      } catch (error) {
        console.error("Error processing response:", error)
        setError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Failed to process the server response.",
        )
        setIsGenerating(false)
        return
      }

      console.log("Received data from /api/generate-image:", JSON.stringify(data, null, 2));
      if (data.task_id) {
        setCurrentTaskId(data.task_id);
        startStatusCheck(data.task_id);
      } else {
        throw new Error("No Task ID or direct images returned from the API.");
      }
    } catch (error) {
      console.error("Error generating image:", error)

      // Handle timeout errors specifically
      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        setError("Request timed out. Please try again with a simpler prompt or fewer images.")
      } else {
        // Check if the error response includes refund information
        let errorMessage = typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "An unexpected error occurred"

        // If tokens were refunded, add that information to the error message
        if (typeof error === "object" && error !== null && "refunded" in error && error.refunded) {
          errorMessage += " Your tokens have been refunded."
        }

        setError(errorMessage)
      }
      setIsGenerating(false)
    }
  }

  const startStatusCheck = (taskId: string) => {
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current)
    }

    // Check status immediately, then start interval
    checkGenerationStatus(taskId)
    statusCheckInterval.current = setInterval(() => {
      checkGenerationStatus(taskId)
    }, 3000) // Check every 3 seconds
  }

  const checkGenerationStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/check-generation?taskId=${taskId}`)
      if (!response.ok) {
        // Stop polling on non-transient errors
        if (response.status >= 400 && response.status < 500) {
          if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
          setError("Failed to check generation status. Please try again.")
          setIsGenerating(false)
        }
        return // Continue polling on server errors
      }

      const result = await response.json()

      if (result.status === "TASK_STATUS_SUCCEED") {
        if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
        setGeneratedImages(result.images || [])
        setGenerationProgress(100)
        setIsGenerating(false)
        toast({
          title: "Success!",
          description: `Your image${(result.images?.length || 0) > 1 ? "s have" : " has"} been generated.`,
        })
      } else if (result.status === "TASK_STATUS_FAILED") {
        if (statusCheckInterval.current) clearInterval(statusCheckInterval.current)
        setError(result.reason || "Image generation failed. Please try again.")
        setIsGenerating(false)
      } else {
        // Update progress if available
        if (result.progress) {
          setGenerationProgress(result.progress)
        }
      }
    } catch (error) {
      console.error("Error checking status:", error)
      // Don't stop polling on network errors, just log them
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt((prev) => {
      const newPrompt = prev ? `${prev}, ${suggestion}` : suggestion
      return newPrompt
    })
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generated-image-${index + 1}.jpg`
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

  const handleShare = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl)
    toast({ title: "Image URL copied to clipboard" })
  }

  const handleDownloadAll = async () => {
    try {
      for (let i = 0; i < generatedImages.length; i++) {
        await handleDownload(generatedImages[i], i)
        // Add a small delay between downloads to prevent browser issues
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Error downloading all images:", error)
      toast({
        title: "Download failed",
        description: "Failed to download all images. Please try again.",
        variant: "destructive",
      })
    }
  }

  const saveImageToCollection = async (imageUrl: string, index: number, showToast = true) => {
    try {
      if (index >= 0) {
        setSavingImageIndex(index)
      }

      // Get current images from localStorage
      let stored: any[] = []
      try {
        const raw = localStorage.getItem("my_images")
        if (raw) stored = JSON.parse(raw)
      } catch { }

      // Prevent duplicate saves by image_url
      if (stored.some((img) => img.image_url === imageUrl)) {
        if (showToast) {
          toast({
            title: "Already saved",
            description: "This image is already in your collection.",
          })
        }
        return false
      }

      // Build the new image object
      const newImage = {
        id: Math.random().toString(36).slice(2),
        image_url: imageUrl,
        prompt: prompt,
        created_at: new Date().toISOString(),
      }

      // Add new image to the front
      const updated = [newImage, ...stored]
      localStorage.setItem("my_images", JSON.stringify(updated))

      if (showToast) {
        toast({
          title: "Success",
          description: "Image saved to your collection",
        })
      }

      return true
    } catch (error) {
      console.error("Error saving image:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save image to collection",
          variant: "destructive",
        })
      }
      return false
    } finally {
      if (index >= 0) {
        setSavingImageIndex(null)
      }
    }
  }

  const viewCollection = () => {
    router.push("/collection")
  }

  const selectedOption = imageOptions.find((option) => option.value === selectedCount)
  const tokensRequired = selectedOption?.tokens || 5

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Left Column - Generation Controls */}
      <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="mr-1 p-0" onClick={() => router.back()} aria-label="Go back">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Wand2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{t("generate.title")}</h1>
          </div>
          <ThemeToggle />
        </div>


        {/* Prompt Input */}
        <div className="relative mb-6">
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Copy
              className="h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(prompt)
                toast({ title: t("generate.copiedToClipboard") })
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-transparent"
              onClick={() => {
                navigator.clipboard.readText().then((text) => {
                  setPrompt(text)
                  toast({ title: t("generate.pastedFromClipboard") })
                })
              }}
            >
              {t("generate.paste")}
            </Button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-card rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-border"
            placeholder={t("generate.promptPlaceholder")}
          />
        </div>

        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showNegativePrompt ? t("generate.hideNegativePrompt") : t("generate.showNegativePrompt")}
          </Button>

          {/* Negative Prompt Input - Only shown when toggled */}
          {showNegativePrompt && (
            <div className="mt-3">
              <label htmlFor="negative-prompt" className="block text-sm font-medium text-muted-foreground mb-2">
                {t("generate.negativePromptLabel")}
              </label>
              <textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full h-20 bg-card rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-border text-sm"
                placeholder={t("generate.negativePromptPlaceholder")}
              />
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t("generate.suggestions")}</h3>
          {categories.length > 0 ? (
            <Tabs defaultValue={categories[0]} value={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="mb-4 bg-card border border-border p-1 rounded-lg">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1c79ab] data-[state=active]:to-[#00ccff] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 p-1 sm:p-2">
                {isLoadingSuggestions
                  ? // Show loading placeholders
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="aspect-square rounded-lg bg-muted animate-pulse" />
                  ))
                  : // Show filtered suggestions
                  suggestions
                    .filter((suggestion) => suggestion.category === activeCategory && suggestion.is_active)
                    .map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all cursor-pointer min-w-0"
                        onClick={() => handleSuggestionClick(suggestion.name)}
                      >
                        <Image
                          src={getValidImageSrc(
                            suggestion.image,
                            `/placeholder.svg?height=88&width=88&query=${encodeURIComponent(suggestion.name || "suggestion")}`,
                          )}
                          alt={suggestion.name}
                          width={88}
                          height={88}
                          className="w-full h-full object-cover rounded-lg"
                          unoptimized={true}
                          onError={(e) => {
                            // Fall back to a local placeholder with the suggestion name
                            e.currentTarget.src = `/placeholder.svg?height=88&width=88&query=${encodeURIComponent(suggestion.name || "suggestion")}`
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 sm:p-2 rounded-lg">
                          <span className="text-xs sm:text-sm font-medium text-white leading-tight line-clamp-2">
                            {suggestion.name}
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </Tabs>
          ) : (
                <div className="text-center py-8 text-muted-foreground">{t("generate.noSuggestionCategories")}</div>
          )}
        </div>

        {/* Number of Images */}
        <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{t("generate.numberOfImages")}</h3>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {imageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedCount(option.value)}
                className={`flex flex-col items-center gap-1 px-3 md:px-6 py-2 md:py-3 rounded-lg transition-all ${selectedCount === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
              >
                <span className="text-base md:text-lg font-semibold">{option.label}</span>
        <span className="text-xs">{option.tokens} tokens</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
      Stability: 5 tokens per image
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/20 border border-destructive text-destructive-foreground rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <div className="relative">
          <Button
            className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("generate.generating")} {Math.round(generationProgress)}%
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                {t("generate.generateButton")} ({tokensRequired} tokens)
              </>
            )}
          </Button>
        </div>

        {/* View Collection Button */}
        {generatedImages.length > 0 && (
          <div className="mt-6">
            <Button variant="outline" className="w-full bg-transparent" onClick={viewCollection}>
              <FolderOpen className="h-5 w-5 mr-2" />
        {t("generate.viewCollection")}
            </Button>
          </div>
        )}
      </div>

      {/* Right Column - Generated Images */}
      <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{t("generate.generatedImages")}</h2>
          {generatedImages.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                <Download className="h-4 w-4 mr-2" />
        {t("generate.downloadAll")}
              </Button>
              <Button variant="outline" size="sm" onClick={viewCollection}>
                <FolderOpen className="h-4 w-4 mr-2" />
        {t("generate.collection")}
              </Button>
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-card p-8 rounded-xl mb-4">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("generate.generating")}</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              This may take a few moments. We're creating your images based on the prompt.
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>

            {/* Timeout Warning */}
            {timeoutWarning && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 text-yellow-300 rounded-lg flex items-center max-w-md">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">Taking longer than usual. Please wait...</span>
              </div>
            )}
          </div>
        )}

        {!isGenerating && generatedImages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-card p-8 rounded-xl mb-4">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("generate.noImagesYet")}</h3>
            <p className="text-muted-foreground max-w-md">{t("generate.noImagesDescription")}</p>
          </div>
        )}



        {!isGenerating && generatedImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer transform transition-transform hover:scale-[1.02]"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-card">
                  <Image
                    src={getValidImageSrc(image, "/placeholder.svg?height=512&width=512") || "/placeholder.svg"}
                    alt={`Generated image ${index + 1}`}
                    width={512}
                    height={512}
                    className="w-full h-full object-cover"
                    unoptimized // Important for external URLs
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening modal
                      handleDownload(image, index)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("generate.download")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening modal
                      handleShare(image)
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("generate.share")}
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                  {t("generate.image")} {index + 1}
                </div>
                {/* Show saved indicator */}
                <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
                  {t("generate.saved")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        images={generatedImages}
        initialIndex={selectedImageIndex}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDownload={handleDownload}
  onShare={handleShare}
        onSave={(index) => saveImageToCollection(generatedImages[index], index)}
        savingIndex={savingImageIndex}
      />
    </div>
  )
}
