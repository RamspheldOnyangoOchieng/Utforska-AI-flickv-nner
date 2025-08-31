import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { getStripeInstance } from "@/lib/stripe-utils"

async function fulfillOrder(session: any) {
  try {
    // Use admin client to avoid cookie issues
    const supabaseAdmin = await createAdminClient()
    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    const userId = session.metadata.userId

    console.log(`🎯 Fulfilling order for user: ${userId}, session: ${session.id}`);
    console.log(`📦 Session metadata:`, session.metadata);

    // Update transaction record
    await supabaseAdmin
      .from("payment_transactions")
      .update({
        status: "paid",
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        metadata: session.metadata,
      })
      .eq("stripe_session_id", session.id)

    // Add tokens if it was a token purchase
    const tokensToAdd = parseInt(session.metadata.tokens || "0", 10)
    if (tokensToAdd > 0) {
      // Fetch current balance
      const { data: currentTokens, error: fetchError } = await supabaseAdmin
        .from("user_tokens")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle()

      if (fetchError) {
        console.error("Error fetching current token balance:", fetchError)
        // Decide how to handle this error: throw, log, or default to 0
      }

      const newBalance = (currentTokens?.balance || 0) + tokensToAdd

      // Upsert the new balance
      const { error: upsertError } = await supabaseAdmin
        .from("user_tokens")
        .upsert({ user_id: userId, balance: newBalance }, { onConflict: "user_id" })

      if (upsertError) {
        console.error("Error updating user tokens:", upsertError)
        // Decide how to handle this error
      }
      const price = session.amount_total / 100; // Stripe amount is in cents
      console.log("Attempting to insert revenue transaction with amount:", price);

      if (price > 0) {
        const { error: revenueError } = await supabaseAdmin
          .from("revenue_transactions")
          .insert({ amount: price });

        if (revenueError) {
          console.error("Error inserting into revenue_transactions:", revenueError);
        } else {
          console.log("Successfully inserted into revenue_transactions with amount:", price);
        }
      } else {
        console.error("Invalid price for revenue transaction:", price);
      }
    }

    // Update premium status if it was a plan purchase
    if (session.metadata.planId && session.metadata.planDuration && session.metadata.type !== "token_purchase") {
      const planDurationMonths = parseInt(session.metadata.planDuration, 10) || 1
      const now = new Date()
      const expiresAt = new Date(now.setMonth(now.getMonth() + planDurationMonths)).toISOString()

      console.log(`💎 Creating premium profile: userId=${userId}, planId=${session.metadata.planId}, duration=${planDurationMonths} months, expires=${expiresAt}`);

      // Try multiple approaches to create premium status
      let premiumCreated = false;

      // Method 1: Try premium_profiles table
      try {
        const { data: premiumData, error: premiumError } = await supabaseAdmin
          .from("premium_profiles")
          .upsert([{
            user_id: userId,
            expires_at: expiresAt,
            plan_id: session.metadata.planId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }], { onConflict: "user_id" });

        if (premiumError) {
          console.error("❌ Error creating premium profile:", JSON.stringify(premiumError, null, 2));
        } else {
          console.log("✅ Successfully created premium profile:", premiumData);
          premiumCreated = true;
        }
      } catch (profileError) {
        console.error("❌ Exception in premium_profiles:", profileError);
      }

      // Method 2: Record in payment_transactions (this is crucial for our status detection)
      try {
        const { data: transactionData, error: transactionError } = await supabaseAdmin
          .from("payment_transactions")
          .insert({
            user_id: userId,
            stripe_session_id: session.id,
            plan_id: session.metadata.planId,
            plan_name: session.metadata.planName,
            amount: parseFloat(session.metadata.price || "0"),
            status: "completed",
            created_at: new Date().toISOString(),
            metadata: session.metadata
          });

        if (transactionError) {
          console.error("❌ Error recording payment transaction:", JSON.stringify(transactionError, null, 2));
        } else {
          console.log("✅ Successfully recorded payment transaction:", transactionData);
          premiumCreated = true; // This is sufficient for premium status detection
        }
      } catch (transactionError) {
        console.error("❌ Exception in payment_transactions:", transactionError);
      }

      // Method 3: Create a simple premium record as last resort
      if (!premiumCreated) {
        console.log("🔄 Creating simple premium record as fallback...");
        try {
          // Create a simple table entry that our status API can read
          const { error: simpleError } = await supabaseAdmin
            .from("user_premium_status")
            .upsert([{
              user_id: userId,
              is_premium: true,
              expires_at: expiresAt,
              plan_name: session.metadata.planName,
              created_at: new Date().toISOString()
            }], { onConflict: "user_id" });

          if (simpleError) {
            console.error("❌ Simple premium record also failed:", JSON.stringify(simpleError, null, 2));
          } else {
            console.log("✅ Created simple premium record");
          }
        } catch (simpleError) {
          console.error("❌ Exception in simple premium record:", simpleError);
        }
      }
    }
  } catch (error) {
    console.error("Error fulfilling order:", error)
    // Handle error appropriately
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }

    const stripe = await getStripeInstance()
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      await fulfillOrder(session)
    }

    return NextResponse.json({ isPaid: session.payment_status === "paid" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }

    const stripe = await getStripeInstance()
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      await fulfillOrder(session)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Payment not successful" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}