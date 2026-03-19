'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLATFORM_DEFS = [
  { type:'youtube', name:'YouTube', icon:'▶', color:'#FF0000', bg:'#1a0000', desc:'Upload to your channel', connected: true },
  { type:'tiktok', name:'TikTok', icon:'♪', color:'#00f2ea', bg:'#00111a', desc:'Coming soon', connected: false, soon: true },
  { type:'instagram', name:'Instagram', icon:'◈', color:'#E1306C', bg:'#1a0011', desc:'Coming soon', connected: false, soon: true },
  { type:'twitter', name:'X / Twitter', icon:'✕', color:'#ffffff', bg:'#0d0d0d', desc:'Coming soon', connected: false, soon: true },
  { type:'facebook', name:'Facebook', icon:'f', color:'#1877F2', bg:'#000a1a', desc:'Coming soon', connected: false, soon: true },
]

const emptyMeta = () => ({ title:'', description:'', tags:'', visibility:'public' })
const inp = (extra={}) => ({ width:'100%', padding:'10px 14px', borderRadius:10, background:'#141416', border:'1px solid #252528', color:'#e0e0e0', fontSize:13, outline:'none', fontFamily:"'DM Mono',monospace", boxSizing:'border-box', ...extra })
const lbl = { color:'#555', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', display:'block', marginBottom:7 }

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [meta, setMeta] = useState(emptyMeta())
  const [showMeta, setShowMeta] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/')
      else setUser(user)
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDrop = useCallback(e => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) setFile(f)
  }, [])

  const fmtSize = b => b > 1e9 ? (b/1e9).toFixed(1)+' GB' : b > 1e6 ? (b/1e6).toFixed(1)+' MB' : (b/1e3).toFixed(0)+' KB'

  const uploadToYouTube = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)
    setProgress('Preparing upload…')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', meta.title || file.name.replace(/\.[^.]+$/, ''))
      formData.append('description', meta.description)
      formData.append('tags', meta.tags)
      formData.append('visibility', meta.visibility)

      setProgress('Uploading to YouTube… (this may take a minute)')
      const res = await fetch('/api/upload/youtube', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success) {
        setProgress('')
        setResult(data)
      } else {
        setError(data.error || 'Upload failed')
        setProgress('')
      }
    } catch (err) {
      setError(err.message)
      setProgress('')
    }
    setUploading(false)
  }

  const reset = () => { setFile(null); setResult(null); setError(null); setMeta(emptyMeta()); }

  if (!user) return (
    <div style={{minHeight:'100vh',background:'#080809',display:'flex',alignItems:'center',justifyContent:'center',color:'#555',fontFamily:"'DM Mono',monospace"}}>
      Loading…
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#080809',fontFamily:"'DM Mono',monospace",padding:'40px 24px 60px',display:'flex',flexDirection:'column',alignItems:'center'}}>

      {/* Header */}
      <div style={{width:'100%',maxWidth:860,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:40}}>
        <div>
          <div style={{display:'inline-block',background:'linear-gradient(90deg,#63ffb4,#63d4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:500,marginBottom:6}}>Distribution Center</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#fff',lineHeight:1.1}}>Upload Once. Publish Everywhere.</h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color:'#555',fontSize:12}}>{user.email}</div>
          <button onClick={signOut} style={{padding:'8px 16px',borderRadius:9,background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#555',fontSize:11,cursor:'pointer',fontFamily:"'DM Mono',monospace"}}>Sign out</button>
        </div>
      </div>

      <div style={{width:'100%',maxWidth:860,display:'flex',flexDirection:'column',gap:20}}>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
          onDragLeave={()=>setIsDragging(false)}
          onDrop={handleDrop}
          onClick={()=>!file&&fileRef.current.click()}
          style={{border:`2px dashed ${isDragging?'#63ffb4':file?'#63ffb455':'#222'}`,borderRadius:20,padding:file?'22px 28px':'52px 28px',textAlign:'center',cursor:file?'default':'pointer',background:isDragging?'rgba(99,255,180,0.04)':file?'rgba(99,255,180,0.02)':'#0e0e10',transition:'all 0.25s'}}>
          <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)setFile(f);}}/>
          {file ? (
            <div style={{display:'flex',alignItems:'center',gap:18}}>
              <div style={{width:52,height:52,borderRadius:12,background:'linear-gradient(135deg,#63ffb422,#63d4ff22)',border:'1.5px solid #63ffb433',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🎬</div>
              <div style={{textAlign:'left',flex:1,minWidth:0}}>
                <div style={{color:'#fff',fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                <div style={{color:'#555',fontSize:11,marginTop:3}}>{fmtSize(file.size)}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();reset();}} style={{background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#666',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:12,fontFamily:"'DM Mono',monospace"}}>Remove</button>
            </div>
          ) : (
            <>
              <div style={{fontSize:34,marginBottom:14,opacity:0.4}}>⬆</div>
              <div style={{color:'#fff',fontSize:15,marginBottom:7}}>Drop your video here</div>
              <div style={{color:'#444',fontSize:12}}>or click to browse · MP4, MOV, AVI, WebM</div>
            </>
          )}
        </div>

        {/* Platforms */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
          {PLATFORM_DEFS.map(p => (
            <div key={p.type} style={{background:p.connected?p.bg:'#0e0e10',border:`1.5px solid ${p.connected?p.color+'55':'#1e1e21'}`,borderRadius:14,padding:'16px 18px',position:'relative',opacity:p.soon?0.5:1}}>
              <div style={{width:36,height:36,borderRadius:9,background:'#131315',border:`1.5px solid ${p.color}44`,display:'flex',alignItems:'center',justifyContent:'center',color:p.color,fontSize:14,fontWeight:700,marginBottom:10}}>{p.icon}</div>
              <div style={{color:p.connected?'#fff':'#888',fontSize:13,fontWeight:500,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:9,letterSpacing:0.5}}>
                {p.connected ? (
                  <div style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(99,255,180,0.08)',border:'1px solid rgba(99,255,180,0.2)',borderRadius:20,padding:'2px 9px',color:'#63ffb4'}}>
                    <div style={{width:4,height:4,borderRadius:'50%',background:'#63ffb4'}}/>Connected
                  </div>
                ) : (
                  <div style={{color:'#444'}}>{p.soon ? 'Coming soon' : '+ Connect'}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Caption toggle */}
        {file && (
          <button onClick={()=>setShowMeta(!showMeta)} style={{padding:'10px',borderRadius:10,background:showMeta?'rgba(99,255,180,0.07)':'#0e0e10',border:`1px solid ${showMeta?'#63ffb433':'#1e1e21'}`,color:showMeta?'#63ffb4':'#444',fontSize:11,cursor:'pointer',fontFamily:"'DM Mono',monospace",transition:'all 0.15s'}}>
            {showMeta ? '▲ Hide Caption & Details' : '▼ Add Caption & Details'}
          </button>
        )}

        {/* Meta form */}
        {file && showMeta && (
          <div style={{background:'#0e0e10',border:'1px solid #1e1e21',borderRadius:16,padding:'24px 28px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div>
              <div style={{marginBottom:16}}>
                <label style={lbl}>Title ({meta.title.length}/100)</label>
                <input value={meta.title} onChange={e=>setMeta(m=>({...m,title:e.target.value.slice(0,100)}))} placeholder="Add a title…" style={inp()}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={lbl}>Description</label>
                <textarea value={meta.description} onChange={e=>setMeta(m=>({...m,description:e.target.value}))} placeholder="Write your description…" rows={5} style={{...inp(),resize:'vertical',lineHeight:1.6}}/>
              </div>
              <div>
                <label style={lbl}>Tags (comma-separated)</label>
                <input value={meta.tags} onChange={e=>setMeta(m=>({...m,tags:e.target.value}))} placeholder="tag1, tag2, tag3…" style={inp()}/>
              </div>
            </div>
            <div>
              <div>
                <label style={lbl}>Visibility</label>
                <select value={meta.visibility} onChange={e=>setMeta(m=>({...m,visibility:e.target.value}))} style={{...inp(),appearance:'none'}}>
                  <option value="public">🌐 Public</option>
                  <option value="unlisted">🔗 Unlisted</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {progress && (
          <div style={{background:'rgba(99,255,180,0.05)',border:'1px solid rgba(99,255,180,0.2)',borderRadius:12,padding:'16px 20px',color:'#63ffb4',fontSize:13}}>
            ⏳ {progress}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{background:'rgba(255,50,50,0.05)',border:'1px solid rgba(255,50,50,0.2)',borderRadius:12,padding:'16px 20px',color:'#ff6666',fontSize:13}}>
            ❌ {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div style={{background:'rgba(99,255,180,0.05)',border:'1px solid rgba(99,255,180,0.25)',borderRadius:14,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
            <div>
              <div style={{color:'#63ffb4',fontSize:15,fontWeight:600,marginBottom:4}}>✓ Uploaded to YouTube!</div>
              <div style={{color:'#555',fontSize:12}}>Your video is live</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href={result.url} target="_blank" rel="noreferrer" style={{padding:'9px 18px',borderRadius:9,background:'#FF0000',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Mono',monospace",textDecoration:'none'}}>View on YouTube ↗</a>
              <button onClick={reset} style={{padding:'9px 16px',borderRadius:9,background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#666',fontSize:12,cursor:'pointer',fontFamily:"'DM Mono',monospace"}}>Upload Another</button>
            </div>
          </div>
        )}

        {/* Publish button */}
        {file && !result && (
          <button onClick={uploadToYouTube} disabled={uploading} style={{padding:'14px',borderRadius:12,background:uploading?'#1a1a1c':'linear-gradient(135deg,#63ffb4,#63d4ff)',border:'none',color:uploading?'#333':'#000',fontSize:13,fontWeight:700,cursor:uploading?'not-allowed':'pointer',fontFamily:"'DM Mono',monospace",transition:'all 0.2s'}}>
            {uploading ? 'Uploading…' : '⬆ Upload to YouTube'}
          </button>
        )}
      </div>
    </div>
  )
}
