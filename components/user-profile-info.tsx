"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface UserProfileInfoProps {
  userId: string
}

export function UserProfileInfo({ userId }: UserProfileInfoProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // This would be implemented in a real app
      // const response = await fetch("/api/update-profile", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username }),
      // })

      // if (!response.ok) throw new Error("Failed to update profile")

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          {isEditing ? (
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
          ) : (
            <div className="p-2 border rounded-md bg-muted/20">{user?.username}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="p-2 border rounded-md bg-muted/20">{user?.email}</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-since">Member Since</Label>
          <div className="p-2 border rounded-md bg-muted/20">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  )
}
