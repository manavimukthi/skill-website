import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username may only contain lowercase letters, numbers, _ and -'),
  display_name: z.string().max(60).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    const { email, password, username, display_name } = parsed.data

    // Check username uniqueness before creating the auth user
    const { data: existing } = await getAdminClient()
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Create auth user — the DB trigger will create the profile row automatically
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: display_name ?? username },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { data: { user: data.user, session: data.session } },
      { status: 201 }
    )
  } catch (err) {
    console.error('/api/auth/signup POST', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
