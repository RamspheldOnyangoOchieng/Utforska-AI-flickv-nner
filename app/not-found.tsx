"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Home,
  Search,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  ChevronRight,
  Users,
  ImageIcon,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function NotFound() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "search" | "chat">("home")
  const searchRef = useRef<HTMLInputElement>(null)

  // Mock character suggestions
  const characterSuggestions = [
    "Einstein",
    "Sherlock Holmes",
    "Marie Curie",
    "Leonardo da Vinci",
    "Ada Lovelace",
    "Nikola Tesla",
  ]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = characterSuggestions.filter((char) => char.toLowerCase().includes(searchQuery.toLowerCase()))
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const handleRobotClick = () => {
    setClickCount((prev) => prev + 1)
    if (clickCount >= 4) {
      setShowEasterEgg(true)

      // Hide easter egg after 5 seconds
      setTimeout(() => {
        setShowEasterEgg(false)
        setClickCount(0)
      }, 5000)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  const handleTabChange = (tab: "home" | "search" | "chat") => {
    setActiveTab(tab)
    if (tab === "search" && searchRef.current) {
      setTimeout(() => {
        searchRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0, -20, 0],
            y: [0, -20, 0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0, 30, 0],
            y: [0, 30, 0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center space-y-8 backdrop-blur-sm bg-card/80 rounded-xl shadow-xl p-8 border border-border relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary/30"
        style={{
          transform: isHovering ? "translateY(-5px)" : "translateY(0)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-secondary/10 blur-3xl"></div>

        {/* Parallax effect on mouse move */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={
            {
              backgroundImage:
                "radial-gradient(circle at var(--x) var(--y), rgba(var(--primary-rgb), 0.1) 0%, transparent 60%)",
              "--x": `${mousePosition.x}px`,
              "--y": `${mousePosition.y}px`,
            } as any
          }
        ></div>

        <div className="relative z-10 space-y-4">
          <motion.div
            className="inline-block relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <h1 className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-shimmer">
              404
            </h1>
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive"
              animate={{
                opacity: [0.7, 0.3, 0.7],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.h2
            className="text-3xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Character Not Found
          </motion.h2>

          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground text-lg">
              Oops! It seems this AI character has wandered off into the digital void.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Perhaps they're exploring another dimension or just taking a break from the digital world.
            </p>
          </motion.div>
        </div>

        {/* Tabs for different actions */}
        <div className="relative w-full max-w-md mx-auto mt-8">
          <div className="flex justify-center mb-4 border-b border-border">
            <button
              onClick={() => handleTabChange("home")}
              className={`flex items-center px-4 py-2 transition-colors ${activeTab === "home" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-selected={activeTab === "home"}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleTabChange("search")}
              className={`flex items-center px-4 py-2 transition-colors ${activeTab === "search" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-selected={activeTab === "search"}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => handleTabChange("chat")}
              className={`flex items-center px-4 py-2 transition-colors ${activeTab === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-selected={activeTab === "chat"}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Chat</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-64 my-4"
              >
                {/* AI Character silhouette - interactive */}
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110"
                  onClick={handleRobotClick}
                  aria-label="Interactive robot character"
                >
                  <div className="relative w-48 h-48">
                    {/* Robot/AI head */}
                    <motion.div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center group"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-24 h-12 flex justify-around items-center">
                        {/* Eyes - interactive */}
                        <motion.div
                          className="w-6 h-6 rounded-full bg-primary group-hover:bg-secondary transition-colors duration-300"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.div
                          className="w-6 h-6 rounded-full bg-primary group-hover:bg-secondary transition-colors duration-300"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: 0.3,
                          }}
                        />
                      </div>
                      {/* Mouth - interactive */}
                      <motion.div
                        className="absolute bottom-6 w-16 h-2 bg-primary/50 rounded-full group-hover:h-4 group-hover:rounded-xl transition-all duration-300"
                        animate={{
                          width: [16, 20, 16],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Antenna */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-8 bg-primary/30 flex justify-center">
                        <motion.div
                          className="w-4 h-4 rounded-full bg-primary/50"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Body - appears on hover */}
                    <motion.div
                      className="absolute top-32 left-1/2 -translate-x-1/2 w-24 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.8, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    >
                      <div className="w-full h-full rounded-xl bg-gradient-to-b from-primary/20 to-secondary/20 border-2 border-primary/30">
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-6 rounded-full bg-primary/20"
                          animate={{
                            opacity: [0.2, 0.5, 0.2],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-16 flex justify-between">
                        <motion.div
                          className="w-6 h-12 rounded-b-lg bg-primary/20 border-2 border-primary/30"
                          animate={{ y: [0, 2, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        />
                        <motion.div
                          className="w-6 h-12 rounded-b-lg bg-primary/20 border-2 border-primary/30"
                          animate={{ y: [0, 2, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Question marks floating around */}
                    <motion.div
                      className="absolute top-5 right-5 text-3xl text-primary/60"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      ?
                    </motion.div>
                    <motion.div
                      className="absolute bottom-10 left-0 text-4xl text-secondary/60"
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    >
                      ?
                    </motion.div>
                    <motion.div
                      className="absolute top-20 left-0 text-2xl text-accent/60"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    >
                      ?
                    </motion.div>
                    <motion.div
                      className="absolute bottom-0 right-10 text-5xl text-primary/60"
                      animate={{
                        y: [0, -12, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1.5,
                      }}
                    >
                      ?
                    </motion.div>
                  </div>
                </div>

                {/* Scanning effect */}
                <motion.div
                  className="absolute inset-x-0 top-1/2 h-1 bg-primary/30"
                  animate={{
                    y: [-50, 50, -50],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Easter egg that appears after clicking the robot 5 times */}
                <AnimatePresence>
                  {showEasterEgg && (
                    <motion.div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -100, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="bg-card p-3 rounded-lg shadow-lg border border-primary flex items-center gap-2">
                        <Sparkles className="text-yellow-500 h-4 w-4" />
                        <span className="text-sm font-medium">You found me! I was hiding all along.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search for characters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      aria-label="Search for characters"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border overflow-hidden"
                      >
                        <ul>
                          {suggestions.map((suggestion, index) => (
                            <li key={index}>
                              <button
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center gap-2 transition-colors"
                              >
                                <Bot className="h-4 w-4 text-primary" />
                                <span>{suggestion}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="text-sm text-muted-foreground">
                  <p>Popular searches:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Einstein", "Sherlock", "Curie", "Tesla"].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link
                    href="/collections"
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-primary/5 transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Collections</p>
                      <p className="text-xs text-muted-foreground">Browse character collections</p>
                    </div>
                  </Link>
                  <Link
                    href="/characters"
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-primary/5 transition-colors"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Characters</p>
                      <p className="text-xs text-muted-foreground">View all characters</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Start a new conversation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a character to chat with or start a new conversation
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/chat" className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Start Chatting
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="text-sm">
                  <p className="font-medium mb-2">Recent conversations:</p>
                  <div className="space-y-2">
                    {[
                      { name: "Einstein", topic: "Theory of Relativity" },
                      { name: "Sherlock Holmes", topic: "Mystery Solving" },
                      { name: "Marie Curie", topic: "Radioactivity" },
                    ].map((chat, index) => (
                      <Link
                        href="/chat"
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{chat.name}</p>
                          <p className="text-xs text-muted-foreground">{chat.topic}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="relative z-10 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-muted-foreground mb-6">Don't worry! You can try one of these paths instead:</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="group relative overflow-hidden">
              <Link href="/">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <Home className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                <span className="relative z-10">Return Home</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="group relative overflow-hidden">
              <Link href="/collections">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <Search className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span className="relative z-10">Browse Collections</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="secondary" className="group relative overflow-hidden">
              <Link href="/chat">
                <span className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <MessageSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">Start a Chat</span>
              </Link>
            </Button>

            <Button variant="ghost" size="lg" onClick={() => window.history.back()} className="group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>

            <Button variant="link" onClick={() => window.location.reload()} className="group">
              <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
              Refresh Page
            </Button>
          </div>
        </motion.div>

        {/* Subtle footer */}
        <motion.div
          className="mt-12 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Lost in the digital realm? Try searching for another character.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
