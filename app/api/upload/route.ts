import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

const MAX_SIZE = 100 * 1024 // 100 KB

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!file.name.endsWith('.md')) {
      return NextResponse.json({ error: 'Only .md files are allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 100 KB)' }, { status: 400 })
    }

    const admin = getAdminClient()
    const storagePath = `${user.id}/${file.name}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from('skill-files')
      .upload(storagePath, bytes, {
        contentType: 'text/markdown',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage
      .from('skill-files')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      data: { url: publicUrl, path: storagePath, size: file.size },
    })
  } catch (err) {
    console.error('/api/upload POST', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
