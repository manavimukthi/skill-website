import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const RATE_LIMIT = 30 // max downloads per hour per IP

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

type Params = { params: { slug: string } }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()

    const { data: skill, error: fetchError } = await supabase
      .from('skills')
      .select('id, slug, filename, content, file_url, download_count')
      .eq('slug', params.slug)
      .eq('published', true)
      .single()

    if (fetchError || !skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Rate limit: max RATE_LIMIT downloads per IP per hour
    const ip = getClientIp(request)
    const ipHash = hashIp(ip)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Rate limit exceeded — try again later' },
        { status: 429 }
      )
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Log the download
    await supabase.from('downloads').insert({
      skill_id: skill.id,
      user_id: user?.id ?? null,
      ip_hash: ipHash,
    })

    // Atomic increment
    await supabase.rpc('increment_skill_download', { skill_id: skill.id })

    // If no stored file, serve the content directly as a .md download
    if (!skill.file_url) {
      return new NextResponse(skill.content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${skill.filename}"`,
        },
      })
    }

    return NextResponse.json({
      data: {
        file_url: skill.file_url,
        download_count: skill.download_count + 1,
      },
    })
  } catch (err) {
    console.error('/api/skills/[slug]/download POST', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
