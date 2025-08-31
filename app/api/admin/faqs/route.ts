import { NextResponse } from "next/server"
import supabase, { hasSupabaseConfig } from "@/lib/supabase"

// Simple in-memory fallback store (dev only)
let memoryFaqs: { id: string; question: string; answer: string; created_at: string }[] = []

export async function GET() {
  // Try DB first if configured
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from("faqs").select("id, question, answer, created_at").order("created_at", { ascending: false })
      if (error) throw error
      return NextResponse.json({ data: data || [] })
    } catch (e: any) {
      console.error("FAQs GET error (DB):", e?.message)
    }
  }
  // Fallback to memory
  return NextResponse.json({ data: memoryFaqs })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.question || !body?.answer) {
    return NextResponse.json({ error: "Missing question or answer" }, { status: 400 })
  }
  const payload = {
    id: crypto.randomUUID(),
    question: String(body.question),
    answer: String(body.answer),
    created_at: new Date().toISOString(),
  }

  if (hasSupabaseConfig) {
    try {
      const { error } = await supabase.from("faqs").insert([{ question: payload.question, answer: payload.answer }])
      if (error) throw error
      return NextResponse.json({ data: payload }, { status: 201 })
    } catch (e: any) {
      console.error("FAQs POST error (DB):", e?.message)
    }
  }
  // Fallback: store in memory
  memoryFaqs.unshift(payload)
  return NextResponse.json({ data: payload }, { status: 201 })
}
// (Removed duplicate admin route implementation that caused redeclarations)
