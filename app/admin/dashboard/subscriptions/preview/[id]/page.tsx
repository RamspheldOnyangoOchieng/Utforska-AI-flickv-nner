import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSubscriptionPlanById } from "@/lib/subscription-plans"
import { formatCurrency } from "@/lib/utils"

interface PreviewSubscriptionPlanPageProps {
  params: {
    id: string
  }
}

export default async function PreviewSubscriptionPlanPage({ params }: PreviewSubscriptionPlanPageProps) {
  const plan = await getSubscriptionPlanById(params.id)

  if (!plan) {
    notFound()
  }

  const getDurationText = (duration: number) => {
    if (duration === 1) return "Monthly"
    if (duration === 3) return "Quarterly"
    if (duration === 6) return "Bi-annually"
    if (duration === 12) return "Annually"
    return `${duration} months`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/dashboard/subscriptions">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preview Subscription Plan</h1>
          <p className="text-muted-foreground">Preview how this plan will appear to users</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Preview Card */}
        <Card className="bg-[#141414] border-[#252525] overflow-hidden">
          {plan.promotional_image && (
            <div className="relative w-full h-48">
              <Image src={plan.promotional_image || "/placeholder.svg"} alt={plan.name} fill className="object-cover" />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              {plan.is_popular && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                  <Star className="h-3 w-3 mr-1" /> Popular
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              {plan.discounted_price ? (
                <>
                  <span className="text-3xl font-bold">{formatCurrency(plan.discounted_price)}</span>
                  <span className="text-lg line-through text-muted-foreground">
                    {formatCurrency(plan.original_price)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold">{formatCurrency(plan.original_price)}</span>
              )}
              <span className="text-muted-foreground">/ {getDurationText(plan.duration)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.discount_percentage && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Save {plan.discount_percentage}%
              </Badge>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Features:</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.features_image && (
              <div className="relative w-full h-40 mt-4 rounded-md overflow-hidden">
                <Image src={plan.features_image || "/placeholder.svg"} alt="Features" fill className="object-cover" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full">Subscribe Now</Button>
          </CardFooter>
        </Card>

        {/* Plan Details */}
        <div className="space-y-6">
          <Card className="bg-[#141414] border-[#252525]">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p>{plan.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                  <p>{getDurationText(plan.duration)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Original Price</h3>
                  <p>{formatCurrency(plan.original_price)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Discounted Price</h3>
                  <p>{plan.discounted_price ? formatCurrency(plan.discounted_price) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Discount</h3>
                  <p>{plan.discount_percentage ? `${plan.discount_percentage}%` : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Popular</h3>
                  <p>{plan.is_popular ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141414] border-[#252525]">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Link href={`/admin/dashboard/subscriptions/edit/${plan.id}`}>
                  <Button className="w-full">Edit Plan</Button>
                </Link>
                <Link href="/admin/dashboard/subscriptions">
                  <Button variant="outline" className="w-full">
                    Back to Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
