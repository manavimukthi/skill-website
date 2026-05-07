import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

const updateSkillSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  content: z.string().min(20).optional(),
  category_id: z.string().uuid().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  preview_bg: z.string().max(20).optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_size_bytes: z.number().int().positive().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
})

type Params = { params: { slug: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  const identifier = params.slug

  // Try admin client first (bypasses RLS); fall back to anon client if not configured
  let supabase: ReturnType<typeof createClient> | ReturnType<typeof getAdminClient>
  try {
    supabase = getAdminClient()
  } catch {
    supabase = createClient()
  }

  try {
    // Use the same select as the working listing API — avoid author:profiles(*) join
    // which can fail when the profiles RLS policy is missing
    let query = supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, color, description)')
      .eq('published', true)

    // Support both UUID (id) and human-readable slug — works with old slug links too
    query = isUUID(identifier)
      ? query.eq('id', identifier)
      : query.eq('slug', identifier)

    const { data: skill, error } = await query.single()

    if (error || !skill) {
      console.error('/api/skills/[slug] not found:', identifier, error?.message)
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Fire-and-forget view count increment
    supabase.rpc('increment_skill_view', { skill_id: skill.id }).then()

    return NextResponse.json({ data: skill })
  } catch (err) {
    console.error('/api/skills/[slug] GET', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('skills')
      .select('id, author_id')
      .eq('slug', params.slug)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }
    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateSkillSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    const { data: skill, error } = await supabase
      .from('skills')
      .update(parsed.data)
      .eq('id', existing.id)
      .select('*, category:categories(*), author:profiles(*)')
      .single()

    if (error) throw error

    return NextResponse.json({ data: skill })
  } catch (err) {
    console.error('/api/skills/[slug] PATCH', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('skills')
      .select('id, author_id')
      .eq('slug', params.slug)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }
    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('skills').delete().eq('id', existing.id)
    if (error) throw error

    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    console.error('/api/skills/[slug] DELETE', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
