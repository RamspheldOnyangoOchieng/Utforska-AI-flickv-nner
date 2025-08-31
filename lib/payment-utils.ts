import { createAdminClient } from "./supabase-admin"

// Add retry logic for database operations
async function retryDatabaseOperation(operation, maxRetries = 3, initialDelay = 1000) {
  let lastError
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries}):`, error.message)

      // Wait with exponential backoff before retrying
      const delay = initialDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

export async function savePaymentTransaction(paymentData) {
  try {
    console.log("Saving payment transaction:", paymentData)

    // Get a fresh Supabase client for each operation
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    // Extract metadata if present
    const { _metadata, ...dataToSave } = paymentData

    // First check if the record exists
    const { data: existingPayment, error: checkError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("stripe_session_id", dataToSave.stripe_session_id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing payment:", checkError)
      throw checkError
    }

    let result

    if (existingPayment) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from("payments")
        .update(dataToSave)
        .eq("stripe_session_id", dataToSave.stripe_session_id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new record
      const { data, error } = await supabaseAdmin.from("payments").insert(dataToSave).select().single()

      if (error) throw error
      result = data
    }

    // If we have metadata, store it separately
    if (_metadata) {
      await storePaymentMetadata(dataToSave.stripe_session_id, _metadata)
    }

    console.log("Payment transaction saved successfully:", result)
    return result
  } catch (error) {
    console.error("Error in savePaymentTransaction:", error)
    throw error
  }
}

export async function storePaymentMetadata(sessionId, metadata) {
  try {
    console.log(`Storing metadata for session ${sessionId}:`, metadata)

    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    // Check if metadata already exists
    const { data: existingMetadata, error: checkError } = await supabaseAdmin
      .from("payment_metadata")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing metadata:", checkError)
      throw checkError
    }

    let result

    if (existingMetadata) {
      // Update existing metadata
      const { data, error } = await supabaseAdmin
        .from("payment_metadata")
        .update({ metadata })
        .eq("session_id", sessionId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new metadata
      const { data, error } = await supabaseAdmin
        .from("payment_metadata")
        .insert({
          session_id: sessionId,
          metadata,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    console.log("Metadata stored successfully:", result)
    return result
  } catch (error) {
    console.error("Error storing payment metadata:", error)
    throw error
  }
}

export async function getPaymentMetadata(sessionId) {
  try {
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    const { data, error } = await supabaseAdmin
      .from("payment_metadata")
      .select("metadata")
      .eq("session_id", sessionId)
      .maybeSingle()

    if (error) throw error

    return data?.metadata || null
  } catch (error) {
    console.error("Error retrieving payment metadata:", error)
    return null
  }
}

export async function getPaymentTransactions(options = {}) {
  try {
    const { limit = 100, userId = null } = options

    // Get a fresh Supabase client for each operation
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    // Use retry logic for the database operation
    const { data, error } = await retryDatabaseOperation(async () => {
      let query = supabaseAdmin.from("payments").select("*").order("created_at", { ascending: false }).limit(limit)

      if (userId) {
        query = query.eq("user_id", userId)
      }

      return await query
    })

    if (error) {
      console.error("Error in getPaymentTransactions:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getPaymentTransactions:", error)
    throw error
  }
}

export async function getPaymentBySessionId(sessionId) {
  try {
    const supabaseAdmin = await createAdminClient()

    if (!supabaseAdmin) {
      throw new Error("Failed to initialize Supabase admin client")
    }

    const { data, error } = await supabaseAdmin.from("payments").select("*").eq("stripe_session_id", sessionId).single()

    if (error) {
      console.error("Error fetching payment by session ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getPaymentBySessionId:", error)
    return null
  }
}

export async function getPaymentWithMetadata(sessionId) {
  try {
    const payment = await getPaymentBySessionId(sessionId)
    if (!payment) return null

    const metadata = await getPaymentMetadata(sessionId)

    return {
      ...payment,
      metadata,
    }
  } catch (error) {
    console.error("Error getting payment with metadata:", error)
    return null
  }
}

export async function getAllPaymentsWithMetadata(options = {}) {
  try {
    const payments = await getPaymentTransactions(options)

    // Get metadata for all payments in parallel
    const paymentsWithMetadata = await Promise.all(
      payments.map(async (payment) => {
        const metadata = await getPaymentMetadata(payment.stripe_session_id)
        return {
          ...payment,
          metadata,
        }
      }),
    )

    return paymentsWithMetadata
  } catch (error) {
    console.error("Error getting all payments with metadata:", error)
    return []
  }
}
