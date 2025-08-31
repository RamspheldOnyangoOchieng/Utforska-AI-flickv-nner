import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-06-30.basil" });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const { session_id } = await req.json();
    if (!session_id) {
        return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    try {
        // Retrieve the Stripe session
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== "paid") {
            return NextResponse.json({ success: false, status: session.payment_status });
        }

        // Get user email from Stripe session
        const email = session.customer_email || (session.customer_details && session.customer_details.email);
        if (!email) {
            return NextResponse.json({ error: "No email found in Stripe session." }, { status: 400 });
        }


        // Use RPC to get user id from auth.users by email
        const { data: userIdData, error: userIdError } = await supabase
            .rpc('get_auth_user_id_by_email', { email_input: email });
        if (userIdError || !userIdData) {
            return NextResponse.json({ error: "User not found for email: " + email }, { status: 404 });
        }
        const user_id = userIdData;

        // Determine token amount from metadata or line items
        let tokenAmount = 0;
        if (session.metadata && session.metadata.tokens) {
            tokenAmount = parseInt(session.metadata.tokens);
        } else if (session.amount_total && session.currency) {
            tokenAmount = Math.floor(session.amount_total / 100); // Example: 1 token per $1
        }

        if (tokenAmount > 0) {
            // Update user_tokens table
            const { data: tokenRow, error: tokenError } = await supabase
                .from("user_tokens")
                .select("balance")
                .eq("user_id", user_id)
                .maybeSingle();
            if (tokenError) throw tokenError;
            if (tokenRow) {
                await supabase
                    .from("user_tokens")
                    .update({ balance: tokenRow.balance + tokenAmount })
                    .eq("user_id", user_id);
            } else {
                await supabase
                    .from("user_tokens")
                    .insert({ user_id, balance: tokenAmount });
            }
            // Log the transaction
            await supabase.from("token_transactions").insert({
                user_id,
                amount: tokenAmount,
                type: "manual_stripe_verification",
                description: `Manual Stripe payment verification for session ${session_id}`
            });
        }

        return NextResponse.json({ success: true, tokensGranted: tokenAmount });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
