import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function getStripeInstance() {
  try {
    // Get the live mode setting from the database
    const supabase = createClient()
    const { data: settingData, error: settingError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stripe_live_mode")
      .maybeSingle()

    // Determine if we're in live mode
    // Default to false (test mode) if there's an error or no data
    const isLiveMode = settingData?.value === "true"

    console.log("Stripe mode from database:", isLiveMode ? "LIVE" : "TEST")

    // Select the appropriate key based on the mode
    let stripeSecretKey
    if (isLiveMode) {
      stripeSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
      console.log("Using LIVE Stripe key")
    } else {
      stripeSecretKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY
      console.log("Using TEST Stripe key")
    }

    if (!stripeSecretKey) {
      console.error("Stripe secret key is missing for mode:", isLiveMode ? "LIVE" : "TEST")
      return null
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
    return stripe
  } catch (error) {
    console.error("Error initializing Stripe:", error)
    return null
  }
}

export async function getStripeKeys() {
  const cookieStore = await cookies()
  const supabase = createClient()

  try {
    // Get the live mode setting
    const { data: settingData, error: settingError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stripe_live_mode")
      .maybeSingle()

    const isLiveMode = settingData?.value === "true"

    // Get the appropriate publishable key based on the mode
    let publishableKey
    if (isLiveMode) {
      publishableKey = process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    } else {
      publishableKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }

    const { data, error } = await supabase.from("stripe_keys").select("*").single()

    if (error) {
      console.error("Error fetching Stripe keys:", error)
      return {
        liveMode: isLiveMode,
        publishableKey: publishableKey || "",
        secretKey: isLiveMode
          ? process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ""
          : process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
      }
    }

    return {
      liveMode: isLiveMode,
      publishableKey: publishableKey || "",
      secretKey: isLiveMode
        ? process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ""
        : process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
      ...data,
    }
  } catch (error) {
    console.error("Failed to fetch Stripe keys:", error)
    // Default to environment variables
    const isLiveMode = process.env.STRIPE_LIVE_MODE === "true"
    return {
      liveMode: isLiveMode,
      publishableKey: isLiveMode
        ? process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
        : process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      secretKey: isLiveMode
        ? process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || ""
        : process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "",
    }
  }
}
