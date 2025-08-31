export interface SubscriptionPlan {
  id: string
  name: string
  duration: number
  original_price: number
  discounted_price: number | null
  discount_percentage: number | null
  is_popular: boolean
  features: string[]
  created_at: string
  updated_at: string
  promotional_image: string | null
  features_image: string | null
}
