import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  let finalUserId = userId;
  if (!finalUserId) {
    // fallback to session user if no userId param
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    finalUserId = session.user.id;
  }

  try {
    const { data, error } = await supabase.from("user_tokens").select("balance").eq("user_id", finalUserId).maybeSingle();
    if (error) {
      console.error("Error fetching token balance:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch token balance" }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      balance: data?.balance || 0,
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch token balance" }, { status: 500 });
  }
}
