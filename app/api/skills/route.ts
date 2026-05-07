import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import slugify from 'slugify'

const createSkillSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category_id: z.string().uuid('Invalid category ID'),
  filename: z.string().endsWith('.md', 'Filename must end with .md').optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  preview_bg: z.string().max(20).optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_size_bytes: z.number().int().positive().optional().nullable(),
  featured: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') ?? 'recent'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const featured = searchParams.get('featured') === 'true'

    const supabase = createClient()

    let query = supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, color)', { count: 'exact' })
      .eq('published', true)

    if (featured) {
      query = query.eq('featured', true)
    }

    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    switch (sort) {
      case 'popular':
      case 'downloads':
        query = query.order('download_count', { ascending: false })
        break
      case 'views':
        query = query.order('view_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ data, total: count ?? 0 })
  } catch (err) {
    console.error('/api/skills GET', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createSkillSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
    }

    const {
      title, description, content, category_id,
      tags, preview_bg, file_url, file_size_bytes, featured,
    } = parsed.data

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true })
    const { data: existing } = await supabase
      .from('skills')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const filename = parsed.data.filename ?? `${slug}.md`

    const { data: skill, error } = await supabase
      .from('skills')
      .insert({
        title,
        description,
        content,
        category_id,
        author_id: user.id,
        slug,
        filename,
        tags: tags ?? [],
        preview_bg: preview_bg ?? null,
        file_url: file_url ?? null,
        file_size_bytes: file_size_bytes ?? null,
        featured: featured ?? false,
        published: true,
      })
      .select('*, category:categories(*), author:profiles(*)')
      .single()

    if (error) throw error

    return NextResponse.json({ data: skill }, { status: 201 })
  } catch (err) {
    console.error('/api/skills POST', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
