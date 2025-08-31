"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
  setIsOpen: (isOpen: boolean) => void
  isAdmin: boolean
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  setIsOpen: () => {},
  isAdmin: false,
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin") || false
  const isMounted = useRef(true)

  // Initialize based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (!isMounted.current) return

      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    // Set initial state
    if (typeof window !== "undefined") {
      // Delay initial resize to ensure component is fully mounted
      setTimeout(handleResize, 0)

      window.addEventListener("resize", handleResize)
      return () => {
        isMounted.current = false
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (!isMounted.current) return

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsOpen(false)
    }
  }, [pathname])

  const toggle = () => {
    if (isMounted.current) {
      setIsOpen((prev) => !prev)
    }
  }

  const close = () => {
    if (isMounted.current) {
      setIsOpen(false)
    }
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, setIsOpen, isAdmin }}>{children}</SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
