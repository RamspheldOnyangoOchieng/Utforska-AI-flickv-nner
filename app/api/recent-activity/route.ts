import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { cookies } from "next/headers"

export async function GET() {
    await cookies()
    const supabase = await createAdminClient()
    if (!supabase) {
        return NextResponse.json({ error: "Failed to create Supabase admin client" }, { status: 500 })
    }

    const { data, error } = await supabase
        .from("token_transactions")
        .select("*, users_view(username)")
        .order("created_at", { ascending: false })
        .limit(10)

    if (error) {
        console.error("Error fetching recent activity:", error)
        return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
    }

    return NextResponse.json({ activity: data })
}