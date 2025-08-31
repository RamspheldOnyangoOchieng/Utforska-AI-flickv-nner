import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET() {
    const supabase = await createAdminClient()
    if (!supabase) {
        return NextResponse.json({ error: "Failed to create Supabase admin client" }, { status: 500 })
    }

    const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
        CREATE TABLE IF NOT EXISTS payment_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          stripe_session_id TEXT,
          stripe_payment_intent_id TEXT,
          stripe_customer_id TEXT,
          amount DECIMAL(10, 2),
          currency TEXT DEFAULT 'USD',
          status TEXT NOT NULL,
          payment_method TEXT,
          payment_method_details JSONB,
          billing_details JSONB,
          subscription_id TEXT,
          plan_id UUID,
          plan_name TEXT,
          plan_duration INTEGER,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (error) {
        console.error("Error creating payments table:", error)
        return NextResponse.json({ error: "Failed to create payments table" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}