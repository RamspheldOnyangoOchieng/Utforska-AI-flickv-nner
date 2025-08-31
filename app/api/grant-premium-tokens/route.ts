// This API route grants 100 tokens to all premium users. Intended to be run monthly (e.g., via cron or manually).
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
    // 1. Get all premium users
    const { data: users, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_premium", true)

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    let granted = 0
    for (const user of users || []) {
        // 2. Add 100 tokens to their balance
        const { data: tokenRow, error: tokenError } = await supabase
            .from("user_tokens")
            .select("balance")
            .eq("user_id", user.id)
            .maybeSingle()

        if (tokenError) continue

        if (tokenRow) {
            // Update existing balance
            await supabase
                .from("user_tokens")
                .update({ balance: tokenRow.balance + 100 })
                .eq("user_id", user.id)
        } else {
            // Create new balance row
            await supabase
                .from("user_tokens")
                .insert({ user_id: user.id, balance: 100 })
        }
        // Log the transaction
        await supabase.from("token_transactions").insert({
            user_id: user.id,
            amount: 100,
            type: "monthly_premium_grant",
            description: "Monthly premium token grant"
        })
        granted++
    }

    return NextResponse.json({ success: true, granted })
}
