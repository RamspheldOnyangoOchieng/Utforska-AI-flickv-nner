import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { getStripeInstance } from "@/lib/stripe-utils"

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, email, successUrl, cancelUrl, metadata } = await request.json()

    if (!planId) {
      return NextResponse.json({ success: false, error: "Plan ID is required" }, { status: 400 })
    }

    // Get authenticated user if userId not provided
    let authenticatedUserId = userId
    let userEmail = email


    if (!authenticatedUserId) {
      const cookieStore = await cookies();
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
      }

      authenticatedUserId = session.user.id;
      userEmail = session.user.email;
    }

    const supabase = createClient()

    // Check if this is a token purchase
    const isTokenPurchase = planId.startsWith("token_") || (metadata && metadata.type === "token_purchase")

    let productName, productDescription, priceAmount, productMetadata

    if (isTokenPurchase) {
      // Handle token purchase
      const tokenAmount = metadata?.tokens || Number.parseInt(planId.split("_")[1]) || 0
      const price = metadata?.price || 0

      if (tokenAmount <= 0 || price <= 0) {
        return NextResponse.json({ success: false, error: "Invalid token package" }, { status: 400 })
      }

      productName = `${tokenAmount} Tokens`
      productDescription = `Purchase of ${tokenAmount} tokens`
      priceAmount = price
      productMetadata = {
        type: "token_purchase",
        tokens: tokenAmount.toString(),
        userId: authenticatedUserId,
        price: price.toString(),
      }
    } else {
      // Handle subscription plan
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single()

      if (planError || !plan) {
        return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 })
      }

      // Calculate the price to use (discounted_price if available, otherwise original_price)
      priceAmount = plan.discounted_price !== null ? plan.discounted_price : plan.original_price
      productName = plan.name
      productDescription = plan.description || `${plan.duration} month subscription`
      productMetadata = {
        type: "premium_purchase",
        userId: authenticatedUserId,
        planId: planId,
        planName: plan.name,
        planDuration: plan.duration.toString(),
        price: priceAmount.toString(),
      }
    }

    // Validate that we have a valid price
    if (typeof priceAmount !== "number" || isNaN(priceAmount)) {
      console.error("Invalid price value:", priceAmount)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid price configuration",
        },
        { status: 400 },
      )
    }

    const stripe = await getStripeInstance()
    if (!stripe) {
      return NextResponse.json({ success: false, error: "Stripe is not configured" }, { status: 500 })
    }

    // Create checkout session with validated price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(priceAmount * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${request.nextUrl.origin}/premium/success?session_id={CHECKOUT_SESSION_ID}&user_id=${authenticatedUserId}`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/premium?canceled=true`,
      customer_email: userEmail,
      metadata: {
        ...productMetadata,
        ...(metadata || {}),
      },
    })

    return NextResponse.json({ success: true, sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
