"use client"

const ANONYMOUS_ID_KEY = "anonymous_user_id"

export function getAnonymousId(): string {
  if (typeof window === "undefined") return ""

  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY)

  if (!anonymousId) {
    // Generate a unique ID for anonymous users
    anonymousId = `anon_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId)
  }

  return anonymousId
}
