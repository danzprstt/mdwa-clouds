import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, HardDrive, Files, Trash2, Upload,
  Image, Video, Music, FileText, File, TrendingUp,
  Server, Clock, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import HamburgerNav from '../components/HamburgerNav';
import Toast from '../components/Toast';

function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const PROVIDER_COLORS = { supabase: '#4f6ef7', catbox: '#10b981', '0x0': '#8b5cf6' };
const TYPE_COLORS = ['#4f6ef7','#10b981','#8b5cf6','#f59e0b','#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');
  const router = useRouter();
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    loadData();
  }, []);

  useEffect(() => {
    if (!data) return;
    // Animate cards with anime.js style using CSS
    const cards = document.querySelectorAll('.dash-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 80);
    });
  }, [data]);

  async function loadData() {
    setLoading(true);
    const [meRes, dashRes] = await Promise.all([
      fetch('/api/me'), fetch('/api/dashboard')
    ]);
    if (meRes.status === 401) { router.push('/login'); return; }
    const me = await meRes.json();
    const dash = await dashRes.json();
    setUser(me.user);
    if (dash.ok) setData(dash);
    setLoading(false);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('mdwa-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  const ThemeBtn = () => (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>
  );

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTop:'3px solid var(--blue)', animation:'spin 0.8s linear infinite' }} />
      <div style={{ color:'var(--text3)', fontSize:'0.8rem' }}>Memuat dashboard...</div>
    </div>
  );

  const typeData = data ? [
    { name:'Gambar', value: data.types.image, icon: Image },
    { name:'Video', value: data.types.video, icon: Video },
    { name:'Audio', value: data.types.audio, icon: Music },
    { name:'Dokumen', value: data.types.document, icon: FileText },
    { name:'Lainnya', value: data.types.other, icon: File },
  ].filter(t => t.value > 0) : [];

  const providerData = data ? Object.entries(data.providers).map(([name, info]) => ({
    name: name === 'supabase' ? 'Supabase' : name === 'catbox' ? 'Catbox' : '0x0.st',
    files: info.count, size: info.size, fill: PROVIDER_COLORS[name] || '#888',
  })) : [];

  // Fill missing days in activity
  const activityData = data?.activity?.map(a => ({
    date: fmtDate(a.date),
    upload: a.uploads,
    size: +(a.size / 1024 / 1024).toFixed(2),
  })) || [];

  return (
    <>
      <Head>
        <title>Dashboard — MDWA Cloud</title>
        <meta name="description" content="Dashboard MDWA Cloud" />
      </Head>

      <div className="topbar">
        <div className="brand">
          <div className="brand-ico" style={{ background:'linear-gradient(135deg,#4f6ef7,#8b5cf6)' }}>
            <LayoutDashboard size={16} color="white" />
          </div>
          Dashboard
        </div>
        <div className="topbar-right">
          <button onClick={loadData} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text2)', display:'flex', padding:6, borderRadius:8 }} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <ThemeBtn />
          <HamburgerNav user={user} />
        </div>
      </div>

      <div className="page">
        {/* Welcome */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text)' }}>
            Halo, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:3 }}>
            Berikut ringkasan aktivitas cloud kamu
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[
            { label:'Total File', value: data?.stats.totalFiles || 0, icon: Files, color:'#4f6ef7', grad:'linear-gradient(135deg,#4f6ef7,#06b6d4)' },
            { label:'Storage Terpakai', value: fmtSize(data?.stats.totalSize), icon: HardDrive, color:'#10b981', grad:'linear-gradient(135deg,#10b981,#06b6d4)' },
            { label:'Di Sampah', value: data?.stats.trashCount || 0, icon: Trash2, color:'#f59e0b', grad:'linear-gradient(135deg,#f59e0b,#ef4444)' },
            { label:'CDN Aktif', value: Object.keys(data?.providers||{}).length || 0, icon: Server, color:'#8b5cf6', grad:'linear-gradient(135deg,#8b5cf6,#ec4899)' },
          ].map(({ label, value, icon: Icon, color, grad }) => (
            <div key={label} className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 14px' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:grad, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <Icon size={18} color="white" />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--text)', fontFamily:'Space Mono,monospace' }}>{value}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text3)', fontWeight:700, marginTop:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Upload Activity Chart */}
        {activityData.length > 0 && (
          <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 14px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <TrendingUp size={16} color="var(--blue)" />
              <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Aktivitas Upload (30 Hari)</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={activityData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }}
                  labelStyle={{ color:'var(--text)', fontWeight:700 }}
                  formatter={(v, n) => [v, n === 'upload' ? 'Upload' : 'MB']}
                />
                <Area type="monotone" dataKey="upload" stroke="#4f6ef7" strokeWidth={2} fill="url(#gradUpload)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Storage Size Chart */}
        {activityData.length > 0 && (
          <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 14px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <HardDrive size={16} color="var(--green,#10b981)" />
              <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Ukuran Upload per Hari (MB)</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={activityData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }} formatter={(v) => [`${v} MB`, 'Ukuran']} />
                <Bar dataKey="size" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Type + Provider */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {/* File Types */}
          {typeData.length > 0 && (
            <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'14px' }}>
              <div style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:12 }}>Tipe File</div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3}>
                    {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:8 }}>
                {typeData.map((t, i) => (
                  <div key={t.name} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.68rem', color:'var(--text2)' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:TYPE_COLORS[i % TYPE_COLORS.length], flexShrink:0 }} />
                    {t.name} <span style={{ marginLeft:'auto', fontWeight:700 }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Providers */}
          {providerData.length > 0 && (
            <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'14px' }}>
              <div style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:12 }}>CDN / Storage</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {providerData.map(p => (
                  <div key={p.name}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', marginBottom:4 }}>
                      <span style={{ fontWeight:700, color:'var(--text2)' }}>{p.name}</span>
                      <span style={{ color:'var(--text3)' }}>{p.files} file · {fmtSize(p.size)}</span>
                    </div>
                    <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:p.fill, borderRadius:3, width:`${Math.min(100, (p.files / (data?.stats.totalFiles||1)) * 100)}%`, transition:'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:'10px', background:'var(--surface2)', borderRadius:10, fontSize:'0.68rem', color:'var(--text3)', lineHeight:1.5 }}>
                <strong style={{ color:'var(--text2)' }}>Primary:</strong> Supabase Storage<br/>
                <strong style={{ color:'var(--text2)' }}>Fallback:</strong> Catbox → 0x0.st
              </div>
            </div>
          )}
        </div>

        {/* Recent Uploads */}
        {data?.recentUploads?.length > 0 && (
          <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'16px 14px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Clock size={16} color="var(--blue)" />
              <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Upload Terbaru</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.recentUploads.map(f => {
                const isImg = f.mimetype?.startsWith('image/');
                return (
                  <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', padding:'8px', background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'var(--border)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {isImg ? <img src={f.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                        : <File size={16} color="var(--text3)" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.title}</div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text3)' }}>{fmtSize(f.size)} · {fmtDate(f.created_at)} · {f.provider}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data?.stats.totalFiles === 0 && (
          <div className="empty" style={{ marginTop:20 }}>
            <Upload size={40} color="var(--text3)" />
            <p style={{ marginTop:12 }}>Belum ada file. Upload file pertamamu!</p>
            <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop:12 }}>
              Ke Home
            </button>
          </div>
        )}

        <div style={{ height:30 }} />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
