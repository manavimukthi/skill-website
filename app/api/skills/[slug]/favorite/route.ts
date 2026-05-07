import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: { slug: string } }

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: skill } = await supabase
      .from('skills')
      .select('id')
      .eq('slug', params.slug)
      .single()

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, skill_id: skill.id })

    if (error) {
      // Unique violation — already favorited
      if (error.code === '23505') {
        return NextResponse.json({ data: { favorited: true } })
      }
      throw error
    }

    return NextResponse.json({ data: { favorited: true } }, { status: 201 })
  } catch (err) {
    console.error('/api/skills/[slug]/favorite POST', err)
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

    const { data: skill } = await supabase
      .from('skills')
      .select('id')
      .eq('slug', params.slug)
      .single()

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('skill_id', skill.id)

    if (error) throw error

    return NextResponse.json({ data: { favorited: false } })
  } catch (err) {
    console.error('/api/skills/[slug]/favorite DELETE', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
