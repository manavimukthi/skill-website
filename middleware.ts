import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip session refresh if Supabase isn't configured yet
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    const res = NextResponse.next({ request })
    res.headers.set('x-pathname', pathname)
    return res
  }

  let supabaseResponse = NextResponse.next({ request })

  const SESSION_MAX_AGE = 14 * 24 * 60 * 60 // 14 days in seconds

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, { ...options, maxAge: SESSION_MAX_AGE })
        )
      },
    },
  })

  // Refresh the session — must not have any logic between createServerClient
  // and this call, per @supabase/ssr requirements.
  await supabase.auth.getUser()

  // Pass pathname to server components so they can enforce maintenance mode
  supabaseResponse.headers.set('x-pathname', pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
