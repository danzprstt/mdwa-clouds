import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import BottomNav from '../components/BottomNav';
import HamburgerNav from '../components/HamburgerNav';
import Toast from '../components/Toast';

const TOOL_CATEGORIES = [
  {
    id: 'downloader',
    label: 'Downloader',
    grad: 'linear-gradient(135deg,#4f6ef7,#06b6d4)',
    color: '#4f6ef7',
    tools: [
      { id: 'dl-tiktok', label: 'TikTok', icon: '🎵', desc: 'Video tanpa watermark' },
      { id: 'dl-instagram', label: 'Instagram', icon: '📸', desc: 'Foto, video, reels' },
      { id: 'dl-youtube', label: 'YouTube', icon: '▶', desc: 'Video & audio' },
      { id: 'dl-facebook', label: 'Facebook', icon: '👤', desc: 'Video Facebook' },
      { id: 'dl-pinterest', label: 'Pinterest', icon: '📌', desc: 'Gambar & video' },
      { id: 'dl-twitter', label: 'Twitter/X', icon: '✦', desc: 'Video & GIF' },
    ],
  },
  {
    id: 'generator',
    label: 'Generator',
    grad: 'linear-gradient(135deg,#10b981,#06b6d4)',
    color: '#10b981',
    tools: [
      { id: 'qr', label: 'QR Generator', icon: '▣', desc: 'Buat QR code' },
      { id: 'password', label: 'Password', icon: '🔑', desc: 'Password kuat & aman' },
      { id: 'color', label: 'Color Picker', icon: '🎨', desc: 'Picker & palette warna' },
      { id: 'lorem', label: 'Lorem Ipsum', icon: 'Aa', desc: 'Generate dummy text' },
    ],
  },
  {
    id: 'utility',
    label: 'Utilitas',
    grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    color: '#8b5cf6',
    tools: [
      { id: 'url-shortener', label: 'URL Shortener', icon: '🔗', desc: 'Persingkat URL' },
      { id: 'base64', label: 'Base64', icon: '64', desc: 'Encode & decode' },
      { id: 'wordcount', label: 'Word Counter', icon: 'W', desc: 'Hitung kata & karakter' },
      { id: 'bmi', label: 'BMI Kalkulator', icon: '⚖', desc: 'Hitung indeks massa tubuh' },
      { id: 'calc', label: 'Kalkulator', icon: '🧮', desc: 'Kalkulator scientific' },
      { id: 'currency', label: 'Konversi Mata Uang', icon: '💱', desc: 'Kurs real-time' },
      { id: 'stopwatch', label: 'Stopwatch', icon: '⏱', desc: 'Stopwatch & timer' },
      { id: 'notepad', label: 'Notepad', icon: '📝', desc: 'Catatan cepat tersimpan' },
    ],
  },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('mdwa-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Disalin!'));
  }

  const allTools = TOOL_CATEGORIES.flatMap(c => c.tools.map(t => ({ ...t, catGrad: c.grad })));
  const filteredSearch = search ? allTools.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  ) : null;

  const ThemeBtn = () => (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>
  );

  if (activeTool) {
    return (
      <>
        <Head><title>MDWA Cloud — Tools</title></Head>
        <div className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setActiveTool(null)} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text2)', display:'flex', padding:4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontWeight:800, fontSize:'0.95rem' }}>Tools</span>
          </div>
          <div className="topbar-right"><ThemeBtn /><HamburgerNav /></div>
        </div>
        <div className="page">
          <ToolContent toolId={activeTool} showToast={showToast} copyText={copyText} />
        </div>
        <BottomNav active="" />
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    );
  }

  return (
    <>
      <Head><title>MDWA Cloud — Tools</title></Head>
      <div className="topbar">
        <div className="brand">
          <div className="brand-ico" style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          Tools
        </div>
        <div className="topbar-right"><ThemeBtn /><HamburgerNav /></div>
      </div>

      <div className="page">
        <div style={{ position:'relative', marginBottom:4 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="inp" placeholder="Cari tools..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }} />
        </div>

        {filteredSearch ? (
          <>
            <div className="sec-ttl">Hasil ({filteredSearch.length})</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {filteredSearch.map(tool => <ToolCard key={tool.id} tool={tool} grad={tool.catGrad} onClick={() => setActiveTool(tool.id)} />)}
            </div>
          </>
        ) : TOOL_CATEGORIES.map(cat => (
          <div key={cat.id}>
            <div className="sec-ttl" style={{ color:cat.color }}>{cat.label}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {cat.tools.map(tool => <ToolCard key={tool.id} tool={tool} grad={cat.grad} onClick={() => setActiveTool(tool.id)} />)}
            </div>
          </div>
        ))}
        <div style={{ height:20 }} />
      </div>

      <BottomNav active="" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

function ToolCard({ tool, grad, onClick }) {
  return (
    <button onClick={onClick} style={{
      background:'var(--card)', border:'1px solid var(--border)', borderRadius:16,
      padding:'16px 14px', cursor:'pointer', textAlign:'left',
      transition:'all 0.18s', fontFamily:'Plus Jakarta Sans,sans-serif', width:'100%',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='var(--border2)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; }}
    >
      <div style={{ width:38, height:38, borderRadius:10, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'white', fontWeight:800, marginBottom:10 }}>{tool.icon}</div>
      <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text)', marginBottom:3 }}>{tool.label}</div>
      <div style={{ fontSize:'0.68rem', color:'var(--text3)', lineHeight:1.4, fontWeight:500 }}>{tool.desc}</div>
    </button>
  );
}

// ─── TOOL ROUTER ─────────────────────────────────────────
function ToolContent({ toolId, showToast, copyText }) {
  if (toolId.startsWith('dl-')) return <DownloaderTool platform={toolId.replace('dl-','')} showToast={showToast} />;
  if (toolId === 'qr') return <QRTool />;
  if (toolId === 'password') return <PasswordTool copyText={copyText} showToast={showToast} />;
  if (toolId === 'color') return <ColorTool copyText={copyText} />;
  if (toolId === 'lorem') return <LoremTool copyText={copyText} />;
  if (toolId === 'url-shortener') return <URLShortenerTool copyText={copyText} showToast={showToast} />;
  if (toolId === 'base64') return <Base64Tool copyText={copyText} />;
  if (toolId === 'wordcount') return <WordCountTool />;
  if (toolId === 'bmi') return <BMITool />;
  if (toolId === 'calc') return <CalcTool />;
  if (toolId === 'currency') return <CurrencyTool />;
  if (toolId === 'stopwatch') return <StopwatchTool />;
  if (toolId === 'notepad') return <NotepadTool />;
  return null;
}

// ─── SHARED UI ────────────────────────────────────────────
function ToolBox({ title, children }) {
  return <div><div style={{ fontSize:'1.05rem', fontWeight:800, marginBottom:18 }}>{title}</div>{children}</div>;
}

function ResultBox({ value, onCopy }) {
  if (!value) return null;
  return (
    <div style={{ marginTop:12, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
      <div style={{ fontSize:'0.82rem', color:'var(--text)', wordBreak:'break-all', fontFamily:'Space Mono,monospace', lineHeight:1.6 }}>{value}</div>
      {onCopy && <button onClick={() => onCopy(value)} style={{ marginTop:8, border:'1px solid var(--border2)', background:'none', borderRadius:8, padding:'5px 12px', fontSize:'0.73rem', color:'var(--blue)', cursor:'pointer', fontWeight:700 }}>Salin</button>}
    </div>
  );
}

// ─── DOWNLOADER ───────────────────────────────────────────
function DownloaderTool({ platform, showToast }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const info = {
    tiktok: { label:'TikTok', placeholder:'https://www.tiktok.com/@user/video/...' },
    instagram: { label:'Instagram', placeholder:'https://www.instagram.com/p/...' },
    youtube: { label:'YouTube', placeholder:'https://www.youtube.com/watch?v=...' },
    facebook: { label:'Facebook', placeholder:'https://www.facebook.com/watch?v=...' },
    pinterest: { label:'Pinterest', placeholder:'https://www.pinterest.com/pin/...' },
    twitter: { label:'Twitter/X', placeholder:'https://x.com/user/status/...' },
  }[platform] || { label: platform, placeholder: 'Paste URL...' };

  async function doDownload() {
    if (!url.trim()) return setError('Masukkan URL dulu!');
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch('/api/tools/download', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ url: url.trim(), platform }),
      });
      const d = await r.json();
      if (d.ok) setResult(d);
      else setError(d.error || 'Gagal mengambil media');
    } catch(e) { setError('Network error: ' + e.message); }
    setLoading(false);
  }

  return (
    <ToolBox title={`⬇ ${info.label} Downloader`}>
      <div className="inp-g">
        <label className="inp-label">URL {info.label}</label>
        <input className="inp" placeholder={info.placeholder} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==='Enter' && doDownload()} />
      </div>
      {error && <div className="msg-err" style={{ marginBottom:10 }}>{error}</div>}
      <button className="btn btn-primary btn-full" onClick={doDownload} disabled={loading}>
        {loading ? 'Memproses...' : `⬇ Download ${info.label}`}
      </button>

      {result && (
        <div style={{ marginTop:16 }}>
          {result.thumb && <img src={result.thumb} alt="" style={{ width:'100%', borderRadius:12, marginBottom:12, maxHeight:200, objectFit:'cover' }} />}
          {result.title && <div style={{ fontSize:'0.85rem', fontWeight:700, marginBottom:12, color:'var(--text)' }}>{result.title}</div>}

          {result.type === 'result' && result.items?.map((item, i) => {
            const isExt = item.type === 'external';
            const isAudio = item.type === 'audio';
            const bg = isExt ? 'rgba(139,92,246,0.08)' : isAudio ? 'rgba(16,185,129,0.08)' : 'rgba(79,110,247,0.08)';
            const border = isExt ? 'rgba(139,92,246,0.25)' : isAudio ? 'rgba(16,185,129,0.2)' : 'rgba(79,110,247,0.2)';
            const color = isExt ? 'var(--purple,#8b5cf6)' : isAudio ? 'var(--green)' : 'var(--blue)';
            const icon = isExt ? '🌐' : isAudio ? '🎵' : '🎬';
            const dlIcon = isExt
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
            return (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
                display:'flex', alignItems:'center', gap:10, marginBottom:8,
                background: bg, border:`1px solid ${border}`,
                borderRadius:12, padding:'12px 14px', textDecoration:'none',
                color, fontSize:'0.82rem', fontWeight:700,
              }}>
                {icon} {item.label}
                <span style={{ marginLeft:'auto', flexShrink:0 }}>{dlIcon}</span>
              </a>
            );
          })}

          {result.type === 'manual' && (
            <div>
              <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginBottom:10, lineHeight:1.5 }}>{result.message}</div>
              {result.fallbackLinks?.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  display:'flex', alignItems:'center', gap:10, marginBottom:8,
                  background:'var(--surface2)', border:'1px solid var(--border)',
                  borderRadius:12, padding:'12px 14px', textDecoration:'none',
                  color:'var(--text)', fontSize:'0.82rem', fontWeight:600,
                }}>
                  🌐 {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft:'auto', opacity:0.5 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolBox>
  );
}

// ─── QR GENERATOR ─────────────────────────────────────────
function QRTool() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [qrUrl, setQrUrl] = useState('');

  function generate() {
    if (!text) return;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10&ecc=M`);
  }

  return (
    <ToolBox title="▣ QR Code Generator">
      <div className="inp-g"><label className="inp-label">Teks / URL</label><input className="inp" placeholder="https://example.com" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && generate()} /></div>
      <div className="inp-g"><label className="inp-label">Ukuran: {size}px</label><input type="range" min="100" max="400" step="50" value={size} onChange={e => setSize(+e.target.value)} style={{ width:'100%', marginTop:6 }} /></div>
      <button className="btn btn-primary btn-full" onClick={generate}>Generate QR</button>
      {qrUrl && (
        <div style={{ marginTop:16, textAlign:'center' }}>
          <div style={{ background:'white', padding:16, borderRadius:16, display:'inline-block' }}>
            <img src={qrUrl} alt="QR" style={{ display:'block', borderRadius:8 }} />
          </div>
          <a href={qrUrl} download="qrcode.png" className="btn btn-ghost btn-full" style={{ marginTop:10, textDecoration:'none' }}>⬇ Download PNG</a>
        </div>
      )}
    </ToolBox>
  );
}

// ─── PASSWORD GENERATOR ───────────────────────────────────
function PasswordTool({ copyText, showToast }) {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper:true, lower:true, numbers:true, symbols:true });
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);

  function generate() {
    let chars = '';
    if (opts.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.numbers) chars += '0123456789';
    if (opts.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) return;
    let pwd = '';
    for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random()*chars.length)];
    setPassword(pwd);
    setStrength([opts.upper,opts.lower,opts.numbers,opts.symbols].filter(Boolean).length);
  }

  const sColors = ['','#ef4444','#f59e0b','#10b981','#4f6ef7'];
  const sLabels = ['','Lemah','Sedang','Kuat','Sangat Kuat'];

  return (
    <ToolBox title="🔑 Password Generator">
      <div className="inp-g"><label className="inp-label">Panjang: {length}</label><input type="range" min="8" max="64" value={length} onChange={e => setLength(+e.target.value)} style={{ width:'100%' }} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {[['upper','Huruf Besar'],['lower','Huruf Kecil'],['numbers','Angka'],['symbols','Simbol']].map(([k,l]) => (
          <label key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.82rem', color:'var(--text2)', cursor:'pointer', fontWeight:600 }}>
            <input type="checkbox" checked={opts[k]} onChange={e => setOpts(o => ({...o,[k]:e.target.checked}))} />
            {l}
          </label>
        ))}
      </div>
      <button className="btn btn-primary btn-full" onClick={generate}>Generate</button>
      {password && (
        <>
          <div style={{ marginTop:14, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:14, fontFamily:'Space Mono,monospace', fontSize:'0.88rem', wordBreak:'break-all', letterSpacing:1 }}>{password}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
            <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${strength*25}%`, background:sColors[strength], borderRadius:4, transition:'width 0.3s' }} />
            </div>
            <span style={{ fontSize:'0.72rem', color:sColors[strength], fontWeight:700 }}>{sLabels[strength]}</span>
          </div>
          <button onClick={() => { copyText(password); showToast('Disalin!'); }} className="btn btn-ghost btn-full" style={{ marginTop:8 }}>Salin Password</button>
        </>
      )}
    </ToolBox>
  );
}

// ─── COLOR PICKER ─────────────────────────────────────────
function ColorTool({ copyText }) {
  const [color, setColor] = useState('#4f6ef7');
  const [palette, setPalette] = useState([]);

  function hexToRgb(h) {
    const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  function hexToHsl(h) {
    let r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);let hh,s,l=(max+min)/2;
    if(max===min){hh=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:hh=(g-b)/d+(g<b?6:0);break;case g:hh=(b-r)/d+2;break;case b:hh=(r-g)/d+4;break;}hh/=6;}
    return `hsl(${Math.round(hh*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
  }
  function generatePalette() {
    const r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16);
    setPalette([0.2,0.4,0.6,0.8,1,1.15,1.3,1.5,1.8].map(s=>{
      const nr=Math.min(255,Math.round(r*s)),ng=Math.min(255,Math.round(g*s)),nb=Math.min(255,Math.round(b*s));
      return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`;
    }));
  }

  return (
    <ToolBox title="🎨 Color Picker">
      <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width:64, height:64, borderRadius:14, border:'2px solid var(--border)', cursor:'pointer', padding:2 }} />
        <div>
          <div style={{ fontFamily:'Space Mono,monospace', fontSize:'0.95rem', fontWeight:700 }}>{color.toUpperCase()}</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text2)', marginTop:3 }}>{hexToRgb(color)}</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text2)' }}>{hexToHsl(color)}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => copyText(color)}>Salin HEX</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={generatePalette}>Generate Palette</button>
      </div>
      {palette.length > 0 && (
        <div style={{ marginTop:14, display:'flex', gap:4 }}>
          {palette.map((c,i) => (
            <div key={i} onClick={() => copyText(c)} title={c} style={{ flex:1, height:52, borderRadius:8, background:c, cursor:'pointer', transition:'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scaleY(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}
            />
          ))}
        </div>
      )}
    </ToolBox>
  );
}

// ─── LOREM IPSUM ──────────────────────────────────────────
function LoremTool({ copyText }) {
  const W = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'.split(' ');
  const [count, setCount] = useState(50);
  const [type, setType] = useState('words');
  const [result, setResult] = useState('');

  function generate() {
    if (type === 'words') {
      setResult(Array.from({length:count},(_,i)=>W[i%W.length]).join(' ')+'.');
    } else {
      setResult(Array.from({length:count},()=>{
        const len=Math.floor(Math.random()*40)+15;
        return Array.from({length:len},()=>W[Math.floor(Math.random()*W.length)]).join(' ')+'.';
      }).join('\n\n'));
    }
  }

  return (
    <ToolBox title="Aa Lorem Ipsum">
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {['words','paragraphs'].map(t=>(
          <button key={t} onClick={()=>setType(t)} className={`btn ${type===t?'btn-primary':'btn-ghost'}`} style={{ flex:1 }}>
            {t==='words'?'Kata':'Paragraf'}
          </button>
        ))}
      </div>
      <div className="inp-g"><label className="inp-label">Jumlah {type==='words'?'kata':'paragraf'}: {count}</label><input type="range" min="1" max={type==='words'?200:10} value={count} onChange={e=>setCount(+e.target.value)} style={{ width:'100%' }} /></div>
      <button className="btn btn-primary btn-full" onClick={generate}>Generate</button>
      {result && <>
        <div style={{ marginTop:14, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:14, fontSize:'0.82rem', lineHeight:1.7, color:'var(--text2)', maxHeight:200, overflowY:'auto', whiteSpace:'pre-wrap' }}>{result}</div>
        <button onClick={()=>copyText(result)} className="btn btn-ghost btn-full" style={{ marginTop:8 }}>Salin Teks</button>
      </>}
    </ToolBox>
  );
}

// ─── URL SHORTENER ────────────────────────────────────────
function URLShortenerTool({ copyText, showToast }) {
  const [url, setUrl] = useState('');
  const [short, setShort] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function shorten() {
    if (!url) return setError('Masukkan URL dulu!');
    setLoading(true); setError(''); setShort('');
    const r = await fetch('/api/tools/shorten', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url}) });
    const d = await r.json();
    setLoading(false);
    if (d.ok) setShort(d.shortUrl);
    else setError(d.error || 'Gagal');
  }

  return (
    <ToolBox title="🔗 URL Shortener">
      <div className="inp-g"><label className="inp-label">URL Panjang</label><input className="inp" placeholder="https://url-panjang.com/..." value={url} onChange={e=>setUrl(e.target.value)} /></div>
      {error && <div className="msg-err" style={{ marginBottom:10 }}>{error}</div>}
      <button className="btn btn-primary btn-full" onClick={shorten} disabled={loading}>{loading?'Mempersingkat...':'Persingkat URL'}</button>
      {short && (
        <div style={{ marginTop:14, background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:12, padding:14 }}>
          <div style={{ fontSize:'0.68rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>URL Singkat</div>
          <a href={short} target="_blank" rel="noopener noreferrer" style={{ fontFamily:'Space Mono,monospace', color:'var(--blue)', fontSize:'0.88rem' }}>{short}</a>
          <button onClick={()=>{copyText(short);showToast('Disalin!');}} className="btn btn-ghost btn-full" style={{ marginTop:10 }}>Salin URL</button>
        </div>
      )}
    </ToolBox>
  );
}

// ─── BASE64 ───────────────────────────────────────────────
function Base64Tool({ copyText }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  function convert() {
    try {
      setOutput(mode==='encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input))));
    } catch { setOutput('Error: Input tidak valid'); }
  }

  return (
    <ToolBox title="64 Base64 Encode/Decode">
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {['encode','decode'].map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`btn ${mode===m?'btn-primary':'btn-ghost'}`} style={{ flex:1 }}>{m==='encode'?'Encode':'Decode'}</button>
        ))}
      </div>
      <div className="inp-g"><label className="inp-label">Input</label><textarea className="inp" rows={4} value={input} onChange={e=>setInput(e.target.value)} placeholder={mode==='encode'?'Teks biasa...':'Base64 string...'} /></div>
      <button className="btn btn-primary btn-full" onClick={convert}>{mode==='encode'?'Encode':'Decode'}</button>
      {output && <ResultBox value={output} onCopy={copyText} />}
    </ToolBox>
  );
}

// ─── WORD COUNTER ─────────────────────────────────────────
function WordCountTool() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g,'').length;
  const sentences = text.split(/[.!?]+/).filter(s=>s.trim()).length;
  const readTime = Math.max(1, Math.ceil(words/200));

  return (
    <ToolBox title="W Word Counter">
      <textarea className="inp" rows={8} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste atau ketik teks di sini..." />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:14 }}>
        {[['Kata',words],['Karakter',chars],['Tanpa Spasi',charsNoSpace],['Kalimat',sentences],['Paragraf',text.split(/\n\n+/).filter(p=>p.trim()).length],['Baca',`${readTime}m`]].map(([l,v])=>(
          <div key={l} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
            <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--blue)', fontFamily:'Space Mono,monospace' }}>{v}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.8px', marginTop:2, fontWeight:700 }}>{l}</div>
          </div>
        ))}
      </div>
    </ToolBox>
  );
}

// ─── BMI CALCULATOR ───────────────────────────────────────
function BMITool() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  function calculate() {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmi = w / (h * h);
    let cat, color;
    if (bmi < 18.5) { cat='Kurus'; color='#06b6d4'; }
    else if (bmi < 25) { cat='Normal'; color='#10b981'; }
    else if (bmi < 30) { cat='Gemuk'; color='#f59e0b'; }
    else { cat='Obesitas'; color='#ef4444'; }
    setResult({ bmi: bmi.toFixed(1), cat, color });
  }

  return (
    <ToolBox title="⚖ BMI Kalkulator">
      <div className="inp-g"><label className="inp-label">Tinggi Badan (cm)</label><input className="inp" type="number" placeholder="170" value={height} onChange={e=>setHeight(e.target.value)} /></div>
      <div className="inp-g"><label className="inp-label">Berat Badan (kg)</label><input className="inp" type="number" placeholder="65" value={weight} onChange={e=>setWeight(e.target.value)} /></div>
      <button className="btn btn-primary btn-full" onClick={calculate}>Hitung BMI</button>
      {result && (
        <div style={{ marginTop:16, textAlign:'center', background:'var(--surface2)', border:`2px solid ${result.color}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:'3rem', fontWeight:900, color:result.color, fontFamily:'Space Mono,monospace' }}>{result.bmi}</div>
          <div style={{ fontSize:'1rem', fontWeight:700, color:result.color, marginTop:4 }}>{result.cat}</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text3)', marginTop:8 }}>Kurus &lt;18.5 · Normal 18.5–24.9 · Gemuk 25–29.9 · Obesitas ≥30</div>
        </div>
      )}
    </ToolBox>
  );
}

// ─── SCIENTIFIC CALCULATOR ────────────────────────────────
function CalcTool() {
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState([]);
  const [display, setDisplay] = useState('0');

  function press(val) {
    if (val === 'C') { setDisplay('0'); setExpr(''); return; }
    if (val === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0'); setExpr(e => e.slice(0,-1)); return; }
    if (val === '=') {
      try {
        const result = Function('"use strict"; return (' + expr + ')')();
        const r = parseFloat(result.toFixed(10)).toString();
        setHistory(h => [`${expr} = ${r}`, ...h.slice(0,9)]);
        setDisplay(r); setExpr(r);
      } catch { setDisplay('Error'); }
      return;
    }
    const mathMap = { 'sin':'Math.sin(', 'cos':'Math.cos(', 'tan':'Math.tan(', '√':'Math.sqrt(', 'π':'Math.PI', 'e':'Math.E', 'log':'Math.log10(', 'ln':'Math.log(' };
    const toAdd = mathMap[val] || val;
    setExpr(e => e + toAdd);
    setDisplay(d => (d === '0' && !isNaN(val)) ? val : d === '0' ? val : d + val);
  }

  const buttons = [
    ['C','⌫','(',')'],['^','√','π','e'],['sin','cos','tan','log'],
    ['7','8','9','÷'],['4','5','6','×'],['1','2','3','-'],['0','.','=','+'],
  ];
  const opMap = { '÷':'/', '×':'*', '^':'**' };

  function pressBtn(v) { press(opMap[v] || v); }

  return (
    <ToolBox title="🧮 Kalkulator Scientific">
      <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 16px 8px', marginBottom:12 }}>
        <div style={{ fontSize:'0.68rem', color:'var(--text3)', fontFamily:'Space Mono,monospace', minHeight:18, marginBottom:4, wordBreak:'break-all' }}>{expr || ' '}</div>
        <div style={{ fontSize:'2rem', fontWeight:800, fontFamily:'Space Mono,monospace', textAlign:'right', wordBreak:'break-all' }}>{display}</div>
      </div>
      {buttons.map((row, i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:6 }}>
          {row.map(btn => (
            <button key={btn} onClick={() => pressBtn(btn)} style={{
              padding:'14px 4px', borderRadius:12, border:'1px solid var(--border)',
              background: btn==='='?'var(--grad1)': ['C','⌫'].includes(btn)?'rgba(239,68,68,0.1)': isNaN(btn)&&btn!=='.'?'var(--surface2)':'var(--card)',
              color: btn==='='?'white': ['C','⌫'].includes(btn)?'var(--red)': isNaN(btn)&&btn!=='.'?'var(--blue)':'var(--text)',
              fontFamily:'Space Mono,monospace', fontSize:'0.82rem', fontWeight:700, cursor:'pointer',
              backgroundImage: btn==='='?'linear-gradient(135deg,var(--blue),var(--cyan))':undefined,
            }}>{btn}</button>
          ))}
        </div>
      ))}
      {history.length > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:'0.68rem', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>Riwayat</div>
          {history.map((h,i) => <div key={i} style={{ fontSize:'0.72rem', fontFamily:'Space Mono,monospace', color:'var(--text2)', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>{h}</div>)}
        </div>
      )}
    </ToolBox>
  );
}

// ─── CURRENCY CONVERTER ───────────────────────────────────
function CurrencyTool() {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('USD');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  const CURRENCIES = ['USD','IDR','EUR','GBP','JPY','SGD','MYR','AUD','CNY','KRW'];

  async function convert() {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    try {
      const r = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const data = await r.json();
      const res = {};
      CURRENCIES.forEach(c => { if (c !== from) res[c] = (parseFloat(amount) * data.rates[c]).toFixed(2); });
      setResults(res);
      setLastUpdate(new Date(data.time_last_updated * 1000).toLocaleDateString('id-ID'));
    } catch { setResults(null); }
    setLoading(false);
  }

  return (
    <ToolBox title="💱 Konversi Mata Uang">
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <div style={{ flex:2 }}><label className="inp-label">Jumlah</label><input className="inp" type="number" placeholder="100" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
        <div style={{ flex:1 }}><label className="inp-label">Dari</label>
          <select className="inp" value={from} onChange={e=>setFrom(e.target.value)}>
            {CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button className="btn btn-primary btn-full" onClick={convert} disabled={loading}>{loading?'Mengambil kurs...':'Konversi'}</button>
      {results && (
        <div style={{ marginTop:14 }}>
          {lastUpdate && <div style={{ fontSize:'0.65rem', color:'var(--text3)', marginBottom:8, fontFamily:'Space Mono,monospace' }}>Update: {lastUpdate}</div>}
          {Object.entries(results).map(([cur,val])=>(
            <div key={cur} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, marginBottom:6 }}>
              <span style={{ fontWeight:700, color:'var(--text2)' }}>{cur}</span>
              <span style={{ fontFamily:'Space Mono,monospace', fontWeight:700, color:'var(--text)' }}>{parseFloat(val).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </ToolBox>
  );
}

// ─── STOPWATCH ────────────────────────────────────────────
function StopwatchTool() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setTime(t => t + 10), 10);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function format(ms) {
    const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000), cs = Math.floor((ms%1000)/10);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${cs.toString().padStart(2,'0')}`;
  }

  return (
    <ToolBox title="⏱ Stopwatch">
      <div style={{ textAlign:'center', padding:'24px 0' }}>
        <div style={{ fontSize:'3.5rem', fontWeight:900, fontFamily:'Space Mono,monospace', letterSpacing:-2, color:'var(--text)' }}>{format(time)}</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20 }}>
          <button className="btn btn-primary" style={{ minWidth:100 }} onClick={() => setRunning(r => !r)}>
            {running ? 'Pause' : time === 0 ? 'Mulai' : 'Lanjut'}
          </button>
          {time > 0 && !running && <button className="btn btn-ghost" onClick={() => { setTime(0); setLaps([]); }}>Reset</button>}
          {running && <button className="btn btn-ghost" onClick={() => setLaps(l => [format(time), ...l])}>Lap</button>}
        </div>
      </div>
      {laps.length > 0 && (
        <div>
          {laps.map((lap,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, marginBottom:5 }}>
              <span style={{ color:'var(--text3)', fontWeight:700, fontSize:'0.8rem' }}>Lap {laps.length-i}</span>
              <span style={{ fontFamily:'Space Mono,monospace', fontSize:'0.8rem' }}>{lap}</span>
            </div>
          ))}
        </div>
      )}
    </ToolBox>
  );
}

// ─── NOTEPAD ─────────────────────────────────────────────
function NotepadTool() {
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('mdwa-notepad') || '';
    return '';
  });
  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem('mdwa-notepad', text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clear() {
    if (confirm('Hapus semua catatan?')) { setText(''); localStorage.removeItem('mdwa-notepad'); }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolBox title="📝 Notepad">
      <textarea
        className="inp" rows={14} value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Tulis catatan kamu di sini... Tersimpan otomatis di browser."
        style={{ resize:'vertical', lineHeight:1.6 }}
      />
      <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center' }}>
        <span style={{ fontSize:'0.72rem', color:'var(--text3)', flex:1, fontFamily:'Space Mono,monospace' }}>{words} kata · {text.length} karakter</span>
        <button className="btn btn-ghost btn-sm" onClick={clear}>Hapus</button>
        <button className="btn btn-primary btn-sm" onClick={save}>{saved ? '✓ Tersimpan' : 'Simpan'}</button>
      </div>
    </ToolBox>
  );
}
