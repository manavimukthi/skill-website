import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // Accept either NEXT_PUBLIC_ (used by this project) or SUPABASE_ env names
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) in .env.local, then restart the dev server.'
    )
  }

  const cookieStore = cookies()

  const SESSION_MAX_AGE = 14 * 24 * 60 * 60 // 14 days in seconds

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, maxAge: SESSION_MAX_AGE })
          )
        } catch {
          // Server Component context — cookies are read-only here
        }
      },
    },
  })
}
