import { NextResponse } from "next/server"
import Stripe from "stripe"
import { savePaymentTransaction, getPaymentBySessionId } from "@/lib/payment-utils"
import { getAdminClient } from "@/lib/supabase-admin"

// Initialize Stripe with API key and configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  maxNetworkRetries: 3,
  timeout: 30000, // 30 seconds
})

// Helper function to retry operations with exponential backoff
async function retryOperation(operation, maxRetries = 3) {
  let lastError
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error.message)
      lastError = error

      // Wait with exponential backoff before retrying
      const delay = 1000 * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

export async function POST(request) {
  try {
    const supabaseAdmin = getAdminClient()
    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    const body = await request.json()
    const { sessionId, status, metadata } = body

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 })
    }

    console.log(`Updating transaction status for session ${sessionId} to ${status}`)

    // Check if payment record exists
    console.log("Checking for existing payment")
    const existingPayment = await getPaymentBySessionId(sessionId)

    if (existingPayment) {
      console.log("Existing payment found, updating status")

      // Update existing payment
      const paymentData = {
        stripe_session_id: sessionId,
        status: status || existingPayment.status,
        _metadata: metadata, // Will be extracted and stored separately
      }

      await savePaymentTransaction(paymentData)

      return NextResponse.json({ success: true })
    } else {
      console.log("No existing payment found, fetching from Stripe")

      // Fetch session from Stripe
      let session
      try {
        session = await retryOperation(async () => {
          return await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["payment_intent", "line_items"],
          })
        })
      } catch (error) {
        console.error(`Failed to retrieve session from Stripe: ${error.message}`)

        // Create a minimal payment record with available data
        const minimalPaymentData = {
          stripe_session_id: sessionId,
          status: status || "unknown",
          _metadata: metadata,
        }

        await savePaymentTransaction(minimalPaymentData)

        return NextResponse.json({
          success: true,
          warning: "Created payment with limited data due to Stripe API error",
        })
      }

      // Extract metadata from session
      const combinedMetadata = {
        ...session.metadata,
        ...metadata,
      }

      // Set user_id from metadata if available
      let userId = null
      if (combinedMetadata.userId) {
        console.log(`Setting user_id from metadata.userId: ${combinedMetadata.userId}`)
        userId = combinedMetadata.userId
      }

      // Create payment record
      const paymentData = {
        stripe_session_id: session.id,
        user_id: userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        status: status || session.payment_status || "unknown",
        payment_method: session.payment_method_types?.[0] || "unknown",
        created_at: new Date(session.created * 1000).toISOString(),
        _metadata: combinedMetadata,
      }

      await savePaymentTransaction(paymentData)

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
