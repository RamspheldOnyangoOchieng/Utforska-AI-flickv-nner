"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { createAdminClient } from "@/lib/supabase-admin"
import type { SubscriptionPlan } from "@/types/subscription"

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscription plans:", error)
    throw new Error("Failed to fetch subscription plans")
  }

  return data || []
}

export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching subscription plan:", error)
    return null
  }

  return data
}

export async function createSubscriptionPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
  // Use admin client to bypass RLS
  const supabaseAdmin = await createAdminClient()

  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .insert([
      {
        name: plan.name,
        duration: plan.duration,
        original_price: plan.original_price,
        discounted_price: plan.discounted_price,
        discount_percentage: plan.discount_percentage,
        is_popular: plan.is_popular,
        features: plan.features,
        promotional_image: plan.promotional_image,
        features_image: plan.features_image,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating subscription plan:", error)
    throw new Error("Failed to create subscription plan")
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to create subscription plan: No rows affected")
  }

  revalidatePath("/admin/dashboard/subscriptions")
  return data[0]
}

export async function updateSubscriptionPlan(id: string, plan: SubscriptionPlan): Promise<SubscriptionPlan> {
  // Use admin client to bypass RLS
  const supabaseAdmin = await createAdminClient()

  // First check if the plan exists
  const { data: existingPlan, error: checkError } = await supabaseAdmin
    .from("subscription_plans")
    .select("id")
    .eq("id", id)
    .single()

  if (checkError || !existingPlan) {
    console.error("Error checking subscription plan:", checkError)
    throw new Error("Subscription plan not found")
  }

  // Now update the plan
  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .update({
      name: plan.name,
      duration: plan.duration,
      original_price: plan.original_price,
      discounted_price: plan.discounted_price,
      discount_percentage: plan.discount_percentage,
      is_popular: plan.is_popular,
      features: plan.features,
      promotional_image: plan.promotional_image,
      features_image: plan.features_image,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating subscription plan:", error)
    throw new Error("Failed to update subscription plan")
  }

  // Handle case where no rows were returned
  if (!data || data.length === 0) {
    throw new Error("Failed to update subscription plan: No rows affected")
  }

  revalidatePath("/admin/dashboard/subscriptions")
  revalidatePath(`/admin/dashboard/subscriptions/edit/${id}`)
  revalidatePath(`/admin/dashboard/subscriptions/preview/${id}`)

  return data[0]
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  // Use admin client to bypass RLS
  const supabaseAdmin = await createAdminClient()

  const { error } = await supabaseAdmin.from("subscription_plans").delete().eq("id", id)

  if (error) {
    console.error("Error deleting subscription plan:", error)
    throw new Error("Failed to delete subscription plan")
  }

  revalidatePath("/admin/dashboard/subscriptions")
}

export async function togglePopularStatus(id: string, isPopular: boolean): Promise<SubscriptionPlan> {
  // Use admin client to bypass RLS
  const supabaseAdmin = await createAdminClient()

  // First check if the plan exists
  const { data: existingPlan, error: checkError } = await supabaseAdmin
    .from("subscription_plans")
    .select("id")
    .eq("id", id)
    .single()

  if (checkError || !existingPlan) {
    console.error("Error checking subscription plan:", checkError)
    throw new Error("Subscription plan not found")
  }

  // Now update the popular status
  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .update({
      is_popular: isPopular,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating popular status:", error)
    throw new Error("Failed to update popular status")
  }

  // Handle case where no rows were returned
  if (!data || data.length === 0) {
    throw new Error("Failed to update popular status: No rows affected")
  }

  revalidatePath("/admin/dashboard/subscriptions")
  return data[0]
}
