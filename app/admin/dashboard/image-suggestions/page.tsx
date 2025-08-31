"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { useImageSuggestions, type ImageSuggestion } from "@/components/image-suggestions-context"
import { Home, Plus, Search, Trash2, Edit, Save, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ImageSuggestionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    suggestions,
    isLoading: suggestionsLoading,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
  } = useImageSuggestions()
  const { toast } = useToast()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    image: "",
  })
  const [isAdding, setIsAdding] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState({
    name: "",
    category: "outfit",
    image: "/placeholder.svg?height=80&width=80",
    isActive: true,
  })

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, authLoading, router])

  // Filter suggestions based on search term and category
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCategory === "all" || suggestion.category === activeCategory),
  )

  // Handle toggling a suggestion's active state
  const toggleActive = async (id: string) => {
    const suggestion = suggestions.find((s) => s.id === id)
    if (!suggestion) return

    try {
      await updateSuggestion(id, { isActive: !suggestion.isActive })
      toast({
        title: "Success",
        description: `Suggestion ${suggestion.isActive ? "disabled" : "enabled"} successfully`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to update suggestion status: ${errorMessage}`,
        variant: "destructive",
      })
      console.error("Toggle error:", error)
    }
  }

  // Start editing a suggestion
  const startEditing = (suggestion: ImageSuggestion) => {
    setEditingId(suggestion.id)
    setEditForm({
      name: suggestion.name,
      category: suggestion.category,
      image: suggestion.image,
    })
  }

  // Save edited suggestion
  const saveEdit = async () => {
    if (!editingId) return

    try {
      await updateSuggestion(editingId, {
        name: editForm.name,
        category: editForm.category,
        image: editForm.image,
      })

      setEditingId(null)
      toast({
        title: "Success",
        description: "Suggestion updated successfully",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to update suggestion: ${errorMessage}`,
        variant: "destructive",
      })
      console.error("Update error:", error)
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
  }

  // Delete a suggestion
  const handleDeleteSuggestion = async (id: string) => {
    try {
      await deleteSuggestion(id)
      toast({
        title: "Success",
        description: "Suggestion deleted successfully",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to delete suggestion: ${errorMessage}`,
        variant: "destructive",
      })
      console.error("Delete error:", error)
    }
  }

  // Add a new suggestion
  const handleAddSuggestion = async () => {
    if (!newSuggestion.name.trim()) return

    try {
      await addSuggestion({
        name: newSuggestion.name,
        category: newSuggestion.category,
        image: newSuggestion.image,
        isActive: true,
      })

      setNewSuggestion({
        name: "",
        category: "outfit",
        image: "/placeholder.svg?height=80&width=80",
        isActive: true,
      })
      setIsAdding(false)

      toast({
        title: "Success",
        description: "Suggestion added successfully",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to add suggestion: ${errorMessage}`,
        variant: "destructive",
      })
      console.error("Add error:", error)
    }
  }

  if (authLoading || suggestionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Image Generation Suggestions</h2>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Suggestions ({suggestions.length})</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search suggestions..."
                      className="pl-9 bg-[#252525] border-[#333] text-white w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Suggestion
                  </Button>
                </div>
              </div>

              {/* Category Tabs */}
              <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="outfit">Outfit</TabsTrigger>
                  <TabsTrigger value="pose">Pose</TabsTrigger>
                  <TabsTrigger value="action">Action</TabsTrigger>
                  <TabsTrigger value="accessories">Accessories</TabsTrigger>
                  <TabsTrigger value="scene">Scene</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Add New Suggestion Form */}
              {isAdding && (
                <div className="mb-6 p-4 bg-[#252525] rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Add New Suggestion</h4>
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="new-name">Name</Label>
                      <Input
                        id="new-name"
                        value={newSuggestion.name}
                        onChange={(e) => setNewSuggestion({ ...newSuggestion, name: e.target.value })}
                        className="bg-[#1A1A1A] border-[#333] text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-category">Category</Label>
                      <Select
                        value={newSuggestion.category}
                        onValueChange={(value) => setNewSuggestion({ ...newSuggestion, category: value })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outfit">Outfit</SelectItem>
                          <SelectItem value="pose">Pose</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="scene">Scene</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="new-image">Image URL</Label>
                      <Input
                        id="new-image"
                        value={newSuggestion.image}
                        onChange={(e) => setNewSuggestion({ ...newSuggestion, image: e.target.value })}
                        className="bg-[#1A1A1A] border-[#333] text-white mt-1"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleAddSuggestion}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!newSuggestion.name.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Suggestion
                    </Button>
                  </div>
                </div>
              )}

              {/* Suggestions Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Preview</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Active</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuggestions.map((suggestion) => (
                      <tr key={suggestion.id} className="border-b border-[#252525] hover:bg-[#252525]/50">
                        <td className="py-3 px-4">
                          {editingId === suggestion.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="bg-[#252525] border-[#333] text-white"
                            />
                          ) : (
                            suggestion.name
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === suggestion.id ? (
                            <Select
                              value={editForm.category}
                              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                            >
                              <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="outfit">Outfit</SelectItem>
                                <SelectItem value="pose">Pose</SelectItem>
                                <SelectItem value="action">Action</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="scene">Scene</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                suggestion.category === "outfit"
                                  ? "bg-blue-900/30 text-blue-300"
                                  : suggestion.category === "pose"
                                    ? "bg-green-900/30 text-green-300"
                                    : suggestion.category === "action"
                                      ? "bg-purple-900/30 text-purple-300"
                                      : suggestion.category === "accessories"
                                        ? "bg-yellow-900/30 text-yellow-300"
                                        : "bg-red-900/30 text-red-300"
                              }`}
                            >
                              {suggestion.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === suggestion.id ? (
                            <Input
                              value={editForm.image}
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                              className="bg-[#252525] border-[#333] text-white"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#252525] overflow-hidden">
                              <img
                                src={suggestion.image || "/placeholder.svg"}
                                alt={suggestion.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Switch checked={suggestion.isActive} onCheckedChange={() => toggleActive(suggestion.id)} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editingId === suggestion.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                onClick={saveEdit}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                onClick={() => startEditing(suggestion)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeleteSuggestion(suggestion.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSuggestions.length === 0 && (
                <div className="text-center py-8 text-gray-400">No suggestions found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
