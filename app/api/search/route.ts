import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const supabase = createClient()

    // Try full-text search first; fall back to ilike if FTS column doesn't exist yet
    const { data, error } = await supabase
      .from('skills')
      .select('*, category:categories(id, name, slug, color)')
      .eq('published', true)
      .textSearch('fts', q, { type: 'websearch', config: 'english' })
      .order('download_count', { ascending: false })
      .limit(20)

    if (error) {
      // Fallback: ilike search (works even before fts column is added)
      const { data: fallback, error: fallbackError } = await supabase
        .from('skills')
        .select('*, category:categories(id, name, slug, color)')
        .eq('published', true)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .order('download_count', { ascending: false })
        .limit(20)

      if (fallbackError) throw fallbackError
      return NextResponse.json({ data: fallback })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('/api/search GET', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
