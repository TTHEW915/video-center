import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set(name, value, options) { cookieStore.set({ name, value, ...options }) },
          remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const accessToken = session.provider_token
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title') || 'My Video'
    const description = formData.get('description') || ''
    const tags = formData.get('tags') || ''
    const privacyStatus = formData.get('visibility') || 'public'

    // Step 1: Insert video metadata
    const metadata = {
      snippet: {
        title,
        description,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        categoryId: '22',
      },
      status: { privacyStatus },
    }

    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': file.type,
          'X-Upload-Content-Length': file.size,
        },
        body: JSON.stringify(metadata),
      }
    )

    if (!initRes.ok) {
      const err = await initRes.text()
      return NextResponse.json({ error: 'YouTube init failed', details: err }, { status: 500 })
    }

    const uploadUrl = initRes.headers.get('location')

    // Step 2: Upload the actual file
    const fileBuffer = await file.arrayBuffer()
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size,
      },
      body: fileBuffer,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return NextResponse.json({ error: 'YouTube upload failed', details: err }, { status: 500 })
    }

    const result = await uploadRes.json()
    return NextResponse.json({
      success: true,
      videoId: result.id,
      url: `https://youtube.com/watch?v=${result.id}`,
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
