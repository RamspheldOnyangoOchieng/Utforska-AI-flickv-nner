import { Suspense } from "react"
import SubscriptionPlanForm from "@/components/subscription-plan-form"

export const metadata = {
  title: "Create Subscription Plan",
  description: "Create a new subscription plan for your AI character platform",
}

export default function CreateSubscriptionPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Subscription Plan</h1>
        <p className="text-muted-foreground">Create a new subscription plan for your users</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionPlanForm />
      </Suspense>
    </div>
  )
}
