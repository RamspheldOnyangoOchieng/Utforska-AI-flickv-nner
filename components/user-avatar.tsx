"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "./icons"
import { useAuth } from "./auth-context"

export function UserAvatar() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    return (
        <>
            {user.avatar ? (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.username || ""} />
                </Avatar>
            ) : (
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Icons.user className="h-6 w-6" />
                </div>
            )}
        </>
    )
}