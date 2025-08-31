"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSubscriptionPlan, updateSubscriptionPlan } from "@/lib/subscription-plans"
import type { SubscriptionPlan } from "@/types/subscription"

interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan
  isEdit?: boolean
}

export default function SubscriptionPlanForm({ plan, isEdit = false }: SubscriptionPlanFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(
    plan || {
      name: "",
      duration: 1,
      original_price: 0,
      discounted_price: null,
      discount_percentage: null,
      is_popular: false,
      features: [],
      promotional_image: "",
      features_image: "",
    },
  )
  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value === "" ? null : Number(value) })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_popular: checked })
  }

  const handleDurationChange = (value: string) => {
    setFormData({ ...formData, duration: Number(value) })
  }

  const handleAddFeature = () => {
    if (!newFeature.trim()) return

    setFormData({
      ...formData,
      features: [...(formData.features || []), newFeature.trim()],
    })
    setNewFeature("")
  }

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...(formData.features || [])]
    updatedFeatures.splice(index, 1)
    setFormData({ ...formData, features: updatedFeatures })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Plan name is required"
    }

    if (formData.original_price === undefined || formData.original_price === null || formData.original_price < 0) {
      newErrors.original_price = "Original price is required and must be a positive number"
    }

    if (
      formData.discounted_price !== null &&
      formData.discounted_price !== undefined &&
      (formData.discounted_price < 0 || formData.discounted_price >= (formData.original_price || 0))
    ) {
      newErrors.discounted_price = "Discounted price must be less than original price"
    }

    if (
      formData.discount_percentage !== null &&
      formData.discount_percentage !== undefined &&
      (formData.discount_percentage < 0 || formData.discount_percentage > 100)
    ) {
      newErrors.discount_percentage = "Discount percentage must be between 0 and 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (isEdit && plan) {
        await updateSubscriptionPlan(plan.id, formData as SubscriptionPlan)
      } else {
        await createSubscriptionPlan(formData as SubscriptionPlan)
      }
      router.push("/admin/dashboard/subscriptions")
      router.refresh()
    } catch (error) {
      console.error("Failed to save subscription plan:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="bg-[#141414] border-[#252525]">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Set the basic details for this subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="e.g., Premium Plan"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={String(formData.duration || 1)} onValueChange={handleDurationChange}>
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Monthly</SelectItem>
                <SelectItem value="3">Quarterly (3 months)</SelectItem>
                <SelectItem value="6">Bi-annually (6 months)</SelectItem>
                <SelectItem value="12">Annually (12 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_popular" checked={formData.is_popular || false} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="is_popular">Mark as Popular Plan</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#141414] border-[#252525]">
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set the pricing details for this subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price === null ? "" : formData.original_price}
                onChange={handleNumberChange}
                placeholder="0.00"
                className={`pl-7 ${errors.original_price ? "border-red-500" : ""}`}
              />
            </div>
            {errors.original_price && <p className="text-sm text-red-500">{errors.original_price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discounted_price">Discounted Price (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="discounted_price"
                name="discounted_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.discounted_price === null ? "" : formData.discounted_price}
                onChange={handleNumberChange}
                placeholder="0.00"
                className={errors.discounted_price ? "pl-7 border-red-500" : "pl-7"}
              />
            </div>
            {errors.discounted_price && <p className="text-sm text-red-500">{errors.discounted_price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_percentage">Discount Percentage (Optional)</Label>
            <div className="relative">
              <Input
                id="discount_percentage"
                name="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage === null ? "" : formData.discount_percentage}
                onChange={handleNumberChange}
                placeholder="e.g., 20"
                className={errors.discount_percentage ? "pr-7 border-red-500" : "pr-7"}
              />
              <span className="absolute right-3 top-2.5">%</span>
            </div>
            {errors.discount_percentage && <p className="text-sm text-red-500">{errors.discount_percentage}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#141414] border-[#252525]">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Add features that come with this subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
            />
            <Button type="button" onClick={handleAddFeature} variant="secondary">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {formData.features && formData.features.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5">
                    {feature}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No features added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#141414] border-[#252525]">
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Add promotional images for this subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promotional_image">Promotional Image URL</Label>
            <Input
              id="promotional_image"
              name="promotional_image"
              value={formData.promotional_image || ""}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.promotional_image && (
              <div className="mt-2 relative w-full max-w-xs h-32 rounded-md overflow-hidden border border-[#252525]">
                <Image
                  src={formData.promotional_image || "/placeholder.svg"}
                  alt="Promotional preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features_image">Features Image URL</Label>
            <Input
              id="features_image"
              name="features_image"
              value={formData.features_image || ""}
              onChange={handleChange}
              placeholder="https://example.com/features.jpg"
            />
            {formData.features_image && (
              <div className="mt-2 relative w-full max-w-xs h-32 rounded-md overflow-hidden border border-[#252525]">
                <Image
                  src={formData.features_image || "/placeholder.svg"}
                  alt="Features preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/dashboard/subscriptions")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  )
}
