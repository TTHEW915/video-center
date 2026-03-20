'use client'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080809',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg,#63ffb4,#63d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
          fontWeight: 500, marginBottom: 16,
        }}>Distribution Center</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12,
        }}>Upload Once.<br/>Publish Everywhere.</h1>
        <p style={{ color: '#555', fontSize: 13 }}>Sign in to connect your accounts and start publishing</p>
      </div>

      <div style={{
        background: '#0e0e10', border: '1px solid #1e1e21',
        borderRadius: 20, padding: '40px 48px', width: 400,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <button onClick={signInWithGoogle} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '14px 24px', borderRadius: 12,
          background: '#fff', border: 'none',
          color: '#000', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'DM Mono', monospace",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google (YouTube)
        </button>

        <div style={{ textAlign: 'center', color: '#333', fontSize: 11 }}>
          More platforms coming — TikTok, Instagram, Twitter
        </div>

        <div style={{
          background: '#131315', border: '1px solid #1e1e21',
          borderRadius: 10, padding: '12px 16px',
          color: '#555', fontSize: 11, lineHeight: 1.7, textAlign: 'center',
        }}>
          🔒 Your credentials are never stored by this app.<br/>
          Google handles your login securely.
        </div>
      </div>
    </div>
  )
}
