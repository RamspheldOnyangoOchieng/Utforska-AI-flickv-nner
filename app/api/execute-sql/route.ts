import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Missing required field: sql" }, { status: 400 })
    }

    const supabaseAdmin = await createAdminClient()

    // Split the SQL into individual statements
    const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)
    const results = []

    for (const statement of statements) {
      const { data, error } = await supabaseAdmin.rpc("execute_sql", {
        sql_query: statement.trim() + ";",
      })

      if (error) {
        return NextResponse.json({ error: `Error executing SQL: ${error.message}` }, { status: 500 })
      }

      results.push(data)
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error executing SQL:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
