import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const searchParams = request.nextUrl.searchParams
  const timeframe = searchParams.get("timeframe") || "week"

  try {
    let interval: string
    let dateFormat: string

    // Set SQL interval and date format based on timeframe
    switch (timeframe) {
      case "week":
        interval = "7 days"
        dateFormat = "Dy" // Day name (Mon, Tue, etc.)
        break
      case "month":
        interval = "30 days"
        dateFormat = "DD" // Day of month (01-31)
        break
      case "year":
        interval = "1 year"
        dateFormat = "Mon" // Month name (Jan, Feb, etc.)
        break
      default:
        interval = "7 days"
        dateFormat = "Dy"
    }

    // Query to get usage data grouped by date
    const { data: usageData, error } = await supabase
      .from('token_transactions')
      .select('created_at, amount')
      .eq('user_id', userId)
      .eq('type', 'usage')
      .gte('created_at', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error("Error fetching usage stats:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch usage stats" }, { status: 500 })
    }

    const formattedData = usageData.map(item => ({
  name: new Date(item.created_at).toLocaleDateString('sv-SE', { weekday: 'short' }),
      tokens: Math.abs(item.amount),
      images: 0,
    }))

    return NextResponse.json({
      success: true,
      usageData: usageData || [],
    })
  } catch (error) {
    console.error("Error fetching token usage stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch usage stats" }, { status: 500 })
  }
}
