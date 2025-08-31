import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all payment transactions
    const { data: transactions, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment transactions:", error)
      return NextResponse.json({ error: "Failed to fetch payment transactions" }, { status: 500 })
    }

    // Fetch metadata for each transaction
    const transactionsWithMetadata = await Promise.all(
      transactions.map(async (transaction) => {
        if (!transaction.stripe_session_id) {
          return { ...transaction, metadata: {} }
        }

        try {
          const { data: metadataData, error: metadataError } = await supabase
            .from("payment_metadata")
            .select("metadata")
            .eq("session_id", transaction.stripe_session_id)
            .single()

          if (metadataError || !metadataData) {
            return { ...transaction, metadata: {} }
          }

          return {
            ...transaction,
            metadata: metadataData.metadata || {},
          }
        } catch (err) {
          console.error(`Error fetching metadata for session ${transaction.stripe_session_id}:`, err)
          return { ...transaction, metadata: {} }
        }
      }),
    )

    return NextResponse.json({ transactions: transactionsWithMetadata })
  } catch (error) {
    console.error("Error in payment-transactions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
