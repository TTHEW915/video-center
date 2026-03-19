'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const emptyMeta = () => ({ title:'', description:'', tags:'', visibility:'public' })

const inputStyle = {
  width:'100%', padding:'10px 14px', borderRadius:10,
  background:'#141416', border:'1px solid #252528',
  color:'#e0e0e0', fontSize:13, outline:'none',
  fontFamily:"'DM Mono',monospace", boxSizing:'border-box'
}

const labelStyle = {
  color:'#555', fontSize:10, letterSpacing:1.5,
  textTransform:'uppercase', display:'block', marginBottom:7
}

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
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else setUser(data.user)
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) setFile(f)
  }, [])

  const fmtSize = (b) => {
    if (b > 1e9) return (b/1e9).toFixed(1) + ' GB'
    if (b > 1e6) return (b/1e6).toFixed(1) + ' MB'
    return (b/1e3).toFixed(0) + ' KB'
  }

  const uploadToYouTube = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)
    setProgress('Preparing upload...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', meta.title || file.name.replace(/\.[^.]+$/, ''))
      formData.append('description', meta.description)
      formData.append('tags', meta.tags)
      formData.append('visibility', meta.visibility)
      setProgress('Uploading to YouTube... (this may take a minute)')
      const res = await fetch('/api/upload/youtube', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        setProgress('')
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

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setMeta(emptyMeta())
  }

  if (!user) {
    return (
      <div style={{minHeight:'100vh',background:'#080809',display:'flex',alignItems:'center',justifyContent:'center',color:'#555',fontFamily:"'DM Mono',monospace"}}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#080809',fontFamily:"'DM Mono',monospace",padding:'40px 24px 60px',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{width:'100%',maxWidth:860,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:40}}>
        <div>
          <div style={{background:'linear-gradient(90deg,#63ffb4,#63d4ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:10,letterSpacing:4,textTransform:'uppercase',fontWeight:500,marginBottom:6}}>
            Distribution Center
          </div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:'#fff',lineHeight:1.1}}>
            Upload Once. Publish Everywhere.
          </h1>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color:'#555',fontSize:12}}>{user.email}</div>
          <button onClick={signOut} style={{padding:'8px 16px',borderRadius:9,background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#555',fontSize:11,cursor:'pointer',fontFamily:"'DM Mono',monospace"}}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{width:'100%',maxWidth:860,display:'flex',flexDirection:'column',gap:20}}>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => { if (!file) fileRef.current.click() }}
          style={{
            border: isDragging ? '2px dashed #63ffb4' : file ? '2px dashed #63ffb455' : '2px dashed #222',
            borderRadius:20,
            padding: file ? '22px 28px' : '52px 28px',
            textAlign:'center',
            cursor: file ? 'default' : 'pointer',
            background: isDragging ? 'rgba(99,255,180,0.04)' : file ? 'rgba(99,255,180,0.02)' : '#0e0e10',
            transition:'all 0.25s'
          }}
        >
          <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}} onChange={(e) => { const f = e.target.files[0]; if (f) setFile(f) }}/>
          {file ? (
            <div style={{display:'flex',alignItems:'center',gap:18}}>
              <div style={{width:52,height:52,borderRadius:12,background:'linear-gradient(135deg,#63ffb422,#63d4ff22)',border:'1.5px solid #63ffb433',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                🎬
              </div>
              <div style={{textAlign:'left',flex:1,minWidth:0}}>
                <div style={{color:'#fff',fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
                <div style={{color:'#555',fontSize:11,marginTop:3}}>{fmtSize(file.size)}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); reset() }} style={{background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#666',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{fontSize:34,marginBottom:14,opacity:0.4}}>⬆</div>
              <div style={{color:'#fff',fontSize:15,marginBottom:7}}>Drop your video here</div>
              <div style={{color:'#444',fontSize:12}}>or click to browse · MP4, MOV, AVI, WebM</div>
            </div>
          )}
        </div>

        {/* Platforms */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
          {[
            {name:'YouTube',icon:'▶',color:'#FF0000',bg:'#1a0000',connected:true},
            {name:'TikTok',icon:'♪',color:'#00f2ea',bg:'#00111a',connected:false},
            {name:'Instagram',icon:'◈',color:'#E1306C',bg:'#1a0011',connected:false},
            {name:'Twitter',icon:'✕',color:'#ffffff',bg:'#0d0d0d',connected:false},
            {name:'Facebook',icon:'f',color:'#1877F2',bg:'#000a1a',connected:false},
          ].map((p) => (
            <div key={p.name} style={{background:p.connected?p.bg:'#0e0e10',border:`1.5px solid ${p.connected?p.color+'55':'#1e1e21'}`,borderRadius:14,padding:'16px 18px',opacity:p.connected?1:0.5}}>
              <div style={{width:36,height:36,borderRadius:9,background:'#131315',border:`1.5px solid ${p.color}44`,display:'flex',alignItems:'center',justifyContent:'center',color:p.color,fontSize:14,fontWeight:700,marginBottom:10}}>
                {p.icon}
              </div>
              <div style={{color:p.connected?'#fff':'#888',fontSize:13,fontWeight:500,marginBottom:6}}>{p.name}</div>
              {p.connected ? (
                <div style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(99,255,180,0.08)',border:'1px solid rgba(99,255,180,0.2)',borderRadius:20,padding:'2px 9px',color:'#63ffb4',fontSize:9}}>
                  <div style={{width:4,height:4,borderRadius:'50%',background:'#63ffb4'}}/>Connected
                </div>
              ) : (
                <div style={{color:'#444',fontSize:9}}>Coming soon</div>
              )}
            </div>
          ))}
        </div>

        {/* Caption toggle */}
        {file && (
          <button onClick={() => setShowMeta(!showMeta)} style={{padding:'10px',borderRadius:10,background:showMeta?'rgba(99,255,180,0.07)':'#0e0e10',border:`1px solid ${showMeta?'#63ffb433':'#1e1e21'}`,color:showMeta?'#63ffb4':'#444',fontSize:11,cursor:'pointer',fontFamily:"'DM Mono',monospace"}}>
            {showMeta ? '▲ Hide Caption & Details' : '▼ Add Caption & Details'}
          </button>
        )}

        {/* Meta form */}
        {file && showMeta && (
          <div style={{background:'#0e0e10',border:'1px solid #1e1e21',borderRadius:16,padding:'24px 28px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div>
              <div style={{marginBottom:16}}>
                <label style={labelStyle}>Title ({meta.title.length}/100)</label>
                <input value={meta.title} onChange={(e) => setMeta((m) => ({...m,title:e.target.value.slice(0,100)}))} placeholder="Add a title..." style={inputStyle}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={labelStyle}>Description</label>
                <textarea value={meta.description} onChange={(e) => setMeta((m) => ({...m,description:e.target.value}))} placeholder="Write your description..." rows={5} style={{...inputStyle,resize:'vertical',lineHeight:1.6}}/>
              </div>
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input value={meta.tags} onChange={(e) => setMeta((m) => ({...m,tags:e.target.value}))} placeholder="tag1, tag2, tag3..." style={inputStyle}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Visibility</label>
              <select value={meta.visibility} onChange={(e) => setMeta((m) => ({...m,visibility:e.target.value}))} style={{...inputStyle,appearance:'none'}}>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        )}

        {progress && (
          <div style={{background:'rgba(99,255,180,0.05)',border:'1px solid rgba(99,255,180,0.2)',borderRadius:12,padding:'16px 20px',color:'#63ffb4',fontSize:13}}>
            {progress}
          </div>
        )}

        {error && (
          <div style={{background:'rgba(255,50,50,0.05)',border:'1px solid rgba(255,50,50,0.2)',borderRadius:12,padding:'16px 20px',color:'#ff6666',fontSize:13}}>
            Error: {error}
          </div>
        )}

        {result && (
          <div style={{background:'rgba(99,255,180,0.05)',border:'1px solid rgba(99,255,180,0.25)',borderRadius:14,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
            <div>
              <div style={{color:'#63ffb4',fontSize:15,fontWeight:600,marginBottom:4}}>Uploaded to YouTube!</div>
              <div style={{color:'#555',fontSize:12}}>Your video is live</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href={result.url} target="_blank" rel="noreferrer" style={{padding:'9px 18px',borderRadius:9,background:'#FF0000',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Mono',monospace",textDecoration:'none'}}>
                View on YouTube
              </a>
              <button onClick={reset} style={{padding:'9px 16px',borderRadius:9,background:'#1a1a1c',border:'1px solid #2a2a2e',color:'#666',fontSize:12,cursor:'pointer',fontFamily:"'DM Mono',monospace"}}>
                Upload Another
              </button>
            </div>
          </div>
        )}

        {file && !result && (
          <button onClick={uploadToYouTube} disabled={uploading} style={{padding:'14px',borderRadius:12,background:uploading?'#1a1a1c':'linear-gradient(135deg,#63ffb4,#63d4ff)',border:'none',color:uploading?'#333':'#000',fontSize:13,fontWeight:700,cursor:uploading?'not-allowed':'pointer',fontFamily:"'DM Mono',monospace"}}>
            {uploading ? 'Uploading...' : 'Upload to YouTube'}
          </button>
        )}

      </div>
    </div>
  )
}
