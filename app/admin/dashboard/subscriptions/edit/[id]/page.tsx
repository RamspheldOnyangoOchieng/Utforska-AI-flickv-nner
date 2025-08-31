import { notFound } from "next/navigation"
import { Suspense } from "react"
import SubscriptionPlanForm from "@/components/subscription-plan-form"
import { getSubscriptionPlanById } from "@/lib/subscription-plans"

export const metadata = {
  title: "Edit Subscription Plan",
  description: "Edit an existing subscription plan",
}

interface EditSubscriptionPlanPageProps {
  params: {
    id: string
  }
}

export default async function EditSubscriptionPlanPage({ params }: EditSubscriptionPlanPageProps) {
  const plan = await getSubscriptionPlanById(params.id)

  if (!plan) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Subscription Plan</h1>
        <p className="text-muted-foreground">Update the details for {plan.name}</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionPlanForm plan={plan} isEdit />
      </Suspense>
    </div>
  )
}
