"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Content {
    id: string
    section: string
    content: string
}

export default function PremiumContentPage() {
    const supabase = createClient()
    const [content, setContent] = useState<Content[]>([])
    const [editingContent, setEditingContent] = useState<Content | null>(null)

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        const { data, error } = await supabase.from("premium_page_content").select("*")
        if (error) {
            toast.error("Failed to fetch premium content")
        } else {
            setContent(data)
        }
    }

    const handleUpdate = async () => {
        if (!editingContent) return
        const { error } = await supabase
            .from("premium_page_content")
            .update({ content: editingContent.content })
            .eq("id", editingContent.id)
        if (error) {
            toast.error("Failed to update content")
        } else {
            toast.success("Content updated")
            setEditingContent(null)
            fetchContent()
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Premium Page Content</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {content.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle className="capitalize">{item.section.replace(/_/g, " ")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editingContent?.id === item.id ? (
                                <div>
                                    <Textarea
                                        value={editingContent.content}
                                        onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                                        rows={5}
                                    />
                                    <div className="flex space-x-2 mt-2">
                                        <Button onClick={handleUpdate}>Save</Button>
                                        <Button onClick={() => setEditingContent(null)} variant="outline">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-muted-foreground">{item.content}</p>
                                    <Button onClick={() => setEditingContent(item)} className="mt-2">
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}