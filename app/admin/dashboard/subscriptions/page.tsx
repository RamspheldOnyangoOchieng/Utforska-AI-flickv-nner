import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import SubscriptionPlansList from "@/components/subscription-plans-list"
import { getSubscriptionPlans } from "@/lib/subscription-plans"
import { SubscriptionSettings } from "@/components/subscription-settings"

export const metadata = {
  title: "Subscription Plans Management",
  description: "Manage subscription plans for your AI character platform",
}

export default async function SubscriptionsPage() {
  const plans = await getSubscriptionPlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing for your AI character platform</p>
        </div>
        <Link href="/admin/dashboard/subscriptions/create">
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      <SubscriptionSettings />

      <Suspense fallback={<div>Loading subscription plans...</div>}>
        <SubscriptionPlansList initialPlans={plans} />
      </Suspense>
    </div>
  )
}
