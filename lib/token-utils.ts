import { createClient } from "@/lib/supabase-server"
import { createAdminClient } from "./supabase-admin"

// Get user's token balance
export async function getUserTokenBalance(userId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("user_tokens").select("balance").eq("user_id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching token balance:", error)
      return 0
    }

    return data?.balance || 0
  } catch (error) {
    console.error("Error in getUserTokenBalance:", error)
    return 0
  }
}

// Check if user has enough tokens
export async function hasEnoughTokens(userId: string, requiredTokens: number) {
  const balance = await getUserTokenBalance(userId)
  return balance >= requiredTokens
}

// Deduct tokens from user's balance
export async function deductTokens(userId: string, amount: number, description: string, metadata: any = {}) {
  try {
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    // Get current balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from("user_tokens")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle()

    if (userError) {
      throw userError
    }

    if (!userData) {
      throw new Error("User has no token balance")
    }

    if (userData.balance < amount) {
      throw new Error("Insufficient tokens")
    }

    // Update balance
    const { error: updateError } = await supabaseAdmin
      .from("user_tokens")
      .update({
        balance: userData.balance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      throw updateError
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin.from("token_transactions").insert({
      user_id: userId,
      amount: -amount, // Negative amount for usage
      type: "usage",
      description,
      metadata,
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      throw transactionError
    }

    return true
  } catch (error) {
    console.error("Error in deductTokens:", error)
    return false
  }
}

// Add tokens to user's balance
export async function addTokens(
  userId: string,
  amount: number,
  type: "purchase" | "refund" | "bonus",
  description: string,
  metadata: any = {},
) {
  try {
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    // Check if user has a token balance record
    const { data: existingBalance, error: balanceError } = await supabaseAdmin
      .from("user_tokens")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle()

    if (balanceError) {
      throw balanceError
    }

    if (existingBalance) {
      // Update existing balance
      const { error: updateError } = await supabaseAdmin
        .from("user_tokens")
        .update({
          balance: existingBalance.balance + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new balance record
      const { error: insertError } = await supabaseAdmin.from("user_tokens").insert({
        user_id: userId,
        balance: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        throw insertError
      }
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin.from("token_transactions").insert({
      user_id: userId,
      amount,
      type,
      description,
      metadata,
      created_at: new Date().toISOString(),
    })

    if (transactionError) {
      throw transactionError
    }

    return true
  } catch (error) {
    console.error("Error in addTokens:", error)
    return false
  }
}

// Get user's token transaction history
export async function getTokenTransactions(userId: string, limit = 50) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("token_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching token transactions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTokenTransactions:", error)
    return []
  }
}

// Refund tokens to user's balance (for failed operations)
export async function refundTokens(userId: string, amount: number, description: string, metadata: any = {}) {
  try {
    console.log(`🔄 Refunding ${amount} tokens to user ${userId.substring(0, 8)}...`)

    const result = await addTokens(userId, amount, "refund", description, metadata)

    if (result) {
      console.log(`✅ Successfully refunded ${amount} tokens`)
    } else {
      console.error(`❌ Failed to refund ${amount} tokens`)
    }

    return result
  } catch (error) {
    console.error("Error in refundTokens:", error)
    return false
  }
}
