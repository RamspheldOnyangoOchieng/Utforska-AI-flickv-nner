"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase-server"

export async function updateStripeKeys(formData: FormData) {
  try {
    const supabaseAdmin = await createAdminClient()
    if (!supabaseAdmin) {
      return { error: "Failed to initialize admin client" }
    }

    const testPublishableKey = formData.get("testPublishableKey") as string
    const testSecretKey = formData.get("testSecretKey") as string
    const livePublishableKey = formData.get("livePublishableKey") as string
    const liveSecretKey = formData.get("liveSecretKey") as string
    const webhookSecret = formData.get("webhookSecret") as string
    const liveMode = formData.get("liveMode") === "on"

    // Check if the keys already exist
    const { data: existingKeys, error: fetchError } = await supabaseAdmin.from("stripe_keys").select("*").limit(1)

    if (fetchError) {
      console.error("Error fetching existing keys:", fetchError)
      return { error: "Failed to fetch existing keys" }
    }

    let result
    if (existingKeys && existingKeys.length > 0) {
      // Update existing keys
      const { error: updateError } = await supabaseAdmin
        .from("stripe_keys")
        .update({
          test_publishable_key: testPublishableKey,
          test_secret_key: testSecretKey,
          live_publishable_key: livePublishableKey,
          live_secret_key: liveSecretKey,
          webhook_secret: webhookSecret,
          live_mode: liveMode,
        })
        .eq("id", existingKeys[0].id)

      if (updateError) {
        console.error("Error updating stripe keys:", updateError)
        return { error: "Failed to update stripe keys" }
      }
      result = { message: "Stripe keys updated successfully" }
    } else {
      // Insert new keys
      const { error: insertError } = await supabaseAdmin.from("stripe_keys").insert({
        test_publishable_key: testPublishableKey,
        test_secret_key: testSecretKey,
        live_publishable_key: livePublishableKey,
        live_secret_key: liveSecretKey,
        webhook_secret: webhookSecret,
        live_mode: liveMode,
      })

      if (insertError) {
        console.error("Error inserting stripe keys:", insertError)
        return { error: "Failed to insert stripe keys" }
      }
      result = { message: "Stripe keys inserted successfully" }
    }

    // Now update env vars with Admin API
    try {
      await fetch("/api/admin/stripe-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testPublishableKey,
          testSecretKey,
          livePublishableKey,
          liveSecretKey,
          webhookSecret,
          liveMode,
        }),
      })
    } catch (error) {
      console.error("Failed to update env vars:", error)
      // Continue anyway as the DB update was successful
    }

    revalidatePath("/admin/payment-methods")
    return result
  } catch (error) {
    console.error("Error in updateStripeKeys:", error)
    return { error: "An unexpected error occurred" }
  }
}

export type StripeKeys = {
  id: string
  test_publishable_key: string
  test_secret_key: string
  live_publishable_key: string
  live_secret_key: string
  created_at: string
  updated_at: string
}

export async function getStripeKeys(): Promise<StripeKeys | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const { data, error } = await supabase.from("stripe_keys").select("*").single()

    if (error) {
      console.error("Error fetching Stripe keys:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to fetch Stripe keys:", error)
    return null
  }
}
