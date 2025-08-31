export type Character = {
  id: string
  name: string
  age: number
  image: string
  description: string
  personality: string
  occupation: string
  hobbies: string
  body: string
  ethnicity: string
  language: string
  relationship: string
  isNew: boolean
  createdAt: string
  systemPrompt: string
  category?: "Girls" | "Anime" | "Guys" | string
  videoUrl?: string
}
