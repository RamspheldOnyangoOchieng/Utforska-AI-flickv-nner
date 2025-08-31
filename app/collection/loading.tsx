import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Image Collection</h1>
      <div className="flex justify-center items-center h-64">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}
