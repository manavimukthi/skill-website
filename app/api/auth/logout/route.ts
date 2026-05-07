import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return NextResponse.json({ data: { logged_out: true } })
  } catch (err) {
    console.error('/api/auth/logout POST', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
