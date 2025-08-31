import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase-admin"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 })
    }

    const adminClient = await getAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: "Admin client is not configured" }, { status: 503 })
    }

    try {
      await (adminClient as any).rpc?.("disable_rls")
    } catch (rlsError) {
      console.log("Could not disable RLS, continuing with service role:", rlsError)
    }

    const { error } = await adminClient.from("faqs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting FAQ:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
