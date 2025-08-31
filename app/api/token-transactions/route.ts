import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"


export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  const userIdParam = searchParams.get("userId");
  let userId = userIdParam;
  if (!userId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
  }
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");

  try {
    // Get transactions with pagination
    const { data: transactions, count } = await supabase
      .from("token_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    return NextResponse.json({
      success: true,
      transactions,
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching token transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}
