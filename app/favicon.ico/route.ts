import { NextResponse } from "next/server"

// This route prevents 404s for favicon.ico when no static icon is present.
export async function GET() {
  return new NextResponse(null, { status: 204 })
}
