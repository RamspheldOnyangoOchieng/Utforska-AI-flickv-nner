import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = createClient()
    const { userId } = await req.json()

    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 })
    }

    // Deduct 2 tokens from the user's balance
    const { data: userTokens, error: selectError } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', userId)
        .single()

    if (selectError) {
        console.error('Error fetching user tokens:', selectError)
        return new NextResponse(JSON.stringify({ error: selectError.message }), { status: 500 })
    }

    const newBalance = userTokens.balance - 2

    const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ balance: newBalance })
        .eq('user_id', userId)

    if (updateError) {
        console.error('Error deducting token:', updateError)
        return new NextResponse(JSON.stringify({ error: updateError.message }), { status: 500 })
    }


    return new NextResponse('Token deducted successfully', { status: 200 })
}