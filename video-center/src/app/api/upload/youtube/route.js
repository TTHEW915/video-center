import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    
    // Get token from session or cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const ytToken = cookieHeader.split('; ').find(r => r.startsWith('yt_token='))?.split('=')[1]
    const accessToken = session?.provider_token || ytToken

    if (!accessToken) {
      return NextResponse.json({ error: 'No YouTube access token. Please sign out and sign in again.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, tags, visibility, fileType, fileSize } = body

    const metadata = {
      snippet: {
        title: title || 'My Video',
        description: description || '',
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        categoryId: '22',
      },
      status: { privacyStatus: visibility || 'public' },
    }

    // Get resumable upload URL from YouTube
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': fileType,
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify(metadata),
      }
    )

    if (!initRes.ok) {
      const errText = await initRes.text()
      let errMsg = 'Failed to initialize YouTube upload'
      try { const j = JSON.parse(errText); errMsg = j.error?.message || errMsg } catch(e) {}
      return NextResponse.json({ error: errMsg }, { status: 500 })
    }

    const uploadUrl = initRes.headers.get('location')
    return NextResponse.json({ uploadUrl })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
