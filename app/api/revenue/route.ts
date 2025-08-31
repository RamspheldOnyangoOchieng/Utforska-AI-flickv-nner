import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

export async function GET() {
    await cookies();
    const supabase = await createAdminClient();
    if (!supabase) {
        return NextResponse.json({ error: "Failed to create Supabase admin client" }, { status: 500 });
    }

    const { data, error, count } = await supabase
        .from("revenue_transactions")
        .select("amount", { count: "exact" });

    if (error) {
        console.error("Error fetching total revenue:", error);
        return NextResponse.json({ error: "Failed to fetch total revenue" }, { status: 500 });
    }

    const totalRevenue = data ? data.reduce((acc, transaction) => acc + transaction.amount, 0) : 0;

    return NextResponse.json({ totalRevenue, totalOrders: count });
}