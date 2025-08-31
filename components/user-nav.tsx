"use client"

import type React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "./user-avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"
import { useAuthModal } from "./auth-modal-context"
import Link from "next/link"
import { useTranslations } from "@/lib/use-translations"

export function UserNav() {
    const { user, logout } = useAuth()
    const { openLoginModal, openSignupModal } = useAuthModal()
    const { t } = useTranslations()

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <UserAvatar />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.username}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <Link href="/profile">
                            <DropdownMenuItem>Profil</DropdownMenuItem>
                        </Link>
                        <Link href="/premium">
                            <DropdownMenuItem>Premium</DropdownMenuItem>
                        </Link>
                        <Link href="/settings">
                            <DropdownMenuItem>Inställningar</DropdownMenuItem>
                        </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logga ut</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openLoginModal}>
                {t("auth.login")}
            </Button>
            <Button onClick={openSignupModal}>Skapa gratis konto</Button>
        </div>
    )
}