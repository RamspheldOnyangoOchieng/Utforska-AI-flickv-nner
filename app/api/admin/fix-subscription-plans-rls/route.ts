import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabaseAdmin = await createAdminClient()

    // Read the migration file
    const migrationPath = path.join(process.cwd(), "supabase/migrations/20240401_fix_subscription_plans_rls.sql")
    const migrationSQL = fs.readFileSync(migrationPath, "utf8")

    // Execute the migration
    const { error } = await supabaseAdmin.query(migrationSQL)

    if (error) {
      console.error("Error executing migration:", error)
      return NextResponse.json({ error: "Failed to execute migration" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Migration executed successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
