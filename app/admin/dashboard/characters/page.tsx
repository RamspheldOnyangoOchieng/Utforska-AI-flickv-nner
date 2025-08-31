"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { useCharacters } from "@/components/character-context"
import { Home, Search, Trash2, Edit, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

// Add export const dynamic = 'force-dynamic' at the top of the file to prevent static prerendering
export const dynamic = "force-dynamic"

export default function AdminCharactersPage() {
  const { user, isLoading } = useAuth()
  const { characters, deleteCharacter } = useCharacters()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  // Update the filteredCharacters logic to handle undefined characters array
  const filteredCharacters =
    characters?.filter(
      (char) =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const handleDeleteCharacter = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteCharacter(id)
    } catch (error) {
      console.error("Failed to delete character:", error)
    } finally {
      setIsDeleting(null)
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

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Character Management</h2>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Characters ({characters.length})</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search characters..."
                      className="pl-9 bg-[#252525] border-[#333] text-white w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Link href="/admin/dashboard/characters/create">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Character
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Age</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Occupation</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCharacters.map((character) => (
                      <tr key={character.id} className="border-b border-[#252525] hover:bg-[#252525]/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#252525] mr-3 overflow-hidden">
                              <img
                                src={character.image || "/placeholder.svg"}
                                alt={character.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span>{character.name}</span>
                            {character.isNew && (
                              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{character.age}</td>
                        <td className="py-3 px-4">{character.occupation}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {format(new Date(character.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/dashboard/characters/edit/${character.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleDeleteCharacter(character.id)}
                              disabled={isDeleting === character.id}
                            >
                              {isDeleting === character.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCharacters.length === 0 && (
                <div className="text-center py-8 text-gray-400">No characters found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
