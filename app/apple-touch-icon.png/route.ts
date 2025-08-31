import { NextResponse } from "next/server"

// This route prevents 404s for apple-touch-icon.png when no static icon is present.
// It returns 204 No Content so browsers don't keep retrying.
export async function GET() {
  return new NextResponse(null, { status: 204 })
}
