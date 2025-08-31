import { NextResponse } from "next/server"
import Stripe from "stripe"
import { savePaymentTransaction } from "@/lib/payment-utils"

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

async function getStripeSession(sessionId) {
  try {
    return await retryOperation(async () => {
      return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "line_items"],
      })
    })
  } catch (error) {
    console.error(`Failed to retrieve session from Stripe: ${error.message}`)
    throw error
  }
}

async function syncStripeSessionToDatabase(sessionId) {
  try {
    console.log(`Syncing Stripe session: ${sessionId}`)

    // Retrieve session from Stripe
    const session = await getStripeSession(sessionId)

    // Extract metadata
    const metadata = session.metadata || {}

    // Set user_id from metadata if available
    let userId = null
    if (metadata.userId) {
      console.log(`Setting user_id from metadata.userId: ${metadata.userId}`)
      userId = metadata.userId
    }

    // Prepare payment data
    const paymentData = {
      stripe_session_id: session.id,
      user_id: userId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      status: session.payment_status || "unknown",
      payment_method: session.payment_method_types?.[0] || "unknown",
      created_at: new Date(session.created * 1000).toISOString(),
      _metadata: metadata, // This will be extracted and stored separately
    }

    console.log("Saving payment transaction:", paymentData)

    // Save payment transaction
    const savedPayment = await savePaymentTransaction(paymentData)

    return savedPayment
  } catch (error) {
    console.error(`Error syncing session ${sessionId}: ${error.message}`)
    throw error
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      // Sync a specific session
      const result = await syncStripeSessionToDatabase(sessionId)
      return NextResponse.json({ success: true, data: result })
    } else {
      // Sync recent sessions (could be implemented in the future)
      return NextResponse.json({ success: false, error: "No session_id provided" })
    }
  } catch (error) {
    console.error("Error in sync-stripe-transactions:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
