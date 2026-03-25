import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RefreshCw, TrendingUp, HardDrive, PieChart as PieIcon, BarChart2, Clock, File } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import HamburgerNav from '../components/HamburgerNav';
import BottomNav from '../components/BottomNav';
import Toast from '../components/Toast';

function fmtSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, s = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(Math.max(bytes,1)) / Math.log(k));
  return `${(bytes / Math.pow(k,i)).toFixed(1)} ${s[i]}`;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short' });
}

const BLUE = '#4f6ef7', GREEN = '#10b981', PURPLE = '#8b5cf6', PINK = '#ec4899', AMBER = '#f59e0b', RED = '#ef4444', CYAN = '#06b6d4';
const PIE_COLORS = [BLUE, GREEN, PURPLE, AMBER, RED];
const PROVIDER_COLORS = { supabase: BLUE, catbox: GREEN, '0x0': PURPLE, catbox_only: CYAN };

// Custom tooltip style
const TooltipStyle = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, fontSize:12, color:'var(--text)' };

function SectionTitle({ icon: Icon, title, color = BLUE }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
      <div style={{ width:28, height:28, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={14} color={color} />
      </div>
      <span style={{ fontWeight:800, fontSize:'0.88rem', color:'var(--text)' }}>{title}</span>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div className="dash-card" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:18, padding:'16px 14px', ...style }}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t); document.documentElement.setAttribute('data-theme', t);
    loadData();
  }, []);

  // Animate cards in after data loads
  useEffect(() => {
    if (!data) return;
    setTimeout(() => {
      document.querySelectorAll('.dash-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 70);
      });
    }, 50);
  }, [data]);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const [meRes, dashRes] = await Promise.all([fetch('/api/me'), fetch('/api/dashboard')]);
    if (meRes.status === 401) { router.push('/login'); return; }
    const me = await meRes.json();
    const dash = await dashRes.json();
    setUser(me.user);
    if (dash.ok) setData(dash);
    setLoading(false);
    setRefreshing(false);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('mdwa-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid var(--border)`, borderTop:`3px solid ${BLUE}`, animation:'spin 0.7s linear infinite' }} />
      <div style={{ color:'var(--text3)', fontSize:'0.8rem' }}>Memuat dashboard...</div>
    </div>
  );

  // ── Prepare chart data ─────────────────────────────────
  const activityData = (data?.activity || []).map(a => ({
    date: fmtDate(a.date),
    Upload: a.uploads,
    'MB': +(a.size / 1024 / 1024).toFixed(2),
  }));

  // Fill last 14 days if sparse
  const typeData = data ? [
    { name:'Gambar',   value: data.types.image,    fill: BLUE },
    { name:'Video',    value: data.types.video,    fill: GREEN },
    { name:'Audio',    value: data.types.audio,    fill: PURPLE },
    { name:'Dokumen',  value: data.types.document, fill: AMBER },
    { name:'Lainnya',  value: data.types.other,    fill: RED },
  ].filter(t => t.value > 0) : [];

  const providerData = data ? Object.entries(data.providers).map(([name, info]) => ({
    name: name === 'supabase' ? 'Supabase' : name === 'catbox' ? 'Catbox' : '0x0.st',
    File: info.count,
    Storage: +(info.size / 1024 / 1024).toFixed(1),
    fill: PROVIDER_COLORS[name] || '#888',
  })) : [];

  // Storage usage as % of 1GB (Supabase free tier)
  const totalMB = data ? (data.stats.totalSize / 1024 / 1024) : 0;
  const storagePercent = Math.min(100, (totalMB / 1024) * 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
        <div style={{ fontWeight:700, marginBottom:6, color:'var(--text)' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head><title>Dashboard — MDWA Cloud</title></Head>
      <div className="topbar">
        <div className="brand">
          <div className="brand-ico" style={{ background:`linear-gradient(135deg,${BLUE},${PURPLE})` }}>
            <BarChart2 size={16} color="white" />
          </div>
          Dashboard
        </div>
        <div className="topbar-right">
          <button onClick={() => loadData(true)} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text2)', display:'flex', padding:6, borderRadius:8 }}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme==='dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
          <HamburgerNav user={user} />
        </div>
      </div>

      <div className="page">
        {/* Greeting */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:'1.15rem', fontWeight:900 }}>Halo, {user?.name?.split(' ')[0]} 👋</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:3 }}>Ringkasan aktivitas cloud kamu</div>
        </div>

        {/* ── Storage Gauge ───────────────────────── */}
        <Card style={{ marginBottom:12 }}>
          <SectionTitle icon={HardDrive} title="Storage Terpakai" color={GREEN} />
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:'1.6rem', fontWeight:900, fontFamily:'Space Mono,monospace', color:'var(--text)' }}>{fmtSize(data?.stats.totalSize)}</span>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.7rem', color:'var(--text3)' }}>dari 1 GB</div>
              <div style={{ fontSize:'0.9rem', fontWeight:800, color: storagePercent > 80 ? RED : GREEN }}>{storagePercent.toFixed(1)}%</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height:10, background:'var(--border)', borderRadius:5, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:5, transition:'width 1s ease',
              width:`${storagePercent}%`,
              background: storagePercent > 80
                ? `linear-gradient(90deg,${AMBER},${RED})`
                : `linear-gradient(90deg,${BLUE},${GREEN})`,
            }} />
          </div>
          {/* Mini stats row */}
          <div style={{ display:'flex', gap:0, marginTop:12, borderTop:'1px solid var(--border)', paddingTop:12 }}>
            {[
              ['Total File', data?.stats.totalFiles || 0, BLUE],
              ['Di Sampah', data?.stats.trashCount || 0, AMBER],
              ['CDN Aktif', Object.keys(data?.providers||{}).length, GREEN],
            ].map(([l,v,c]) => (
              <div key={l} style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:'1.3rem', fontWeight:900, color:c, fontFamily:'Space Mono,monospace' }}>{v}</div>
                <div style={{ fontSize:'0.62rem', color:'var(--text3)', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.5px' }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Upload Activity Area Chart ───────────── */}
        {activityData.length > 0 ? (
          <Card style={{ marginBottom:12 }}>
            <SectionTitle icon={TrendingUp} title="Aktivitas Upload (30 Hari)" color={BLUE} />
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={activityData} margin={{ top:5, right:5, left:-28, bottom:0 }}>
                <defs>
                  <linearGradient id="gUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Upload" stroke={BLUE} strokeWidth={2.5} fill="url(#gUpload)" dot={false} activeDot={{ r:4, fill:BLUE }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card style={{ marginBottom:12, textAlign:'center', padding:'30px 14px' }}>
            <TrendingUp size={28} color="var(--text3)" />
            <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:8 }}>Belum ada data upload</div>
          </Card>
        )}

        {/* ── Size per Day Bar Chart ───────────────── */}
        {activityData.length > 0 && (
          <Card style={{ marginBottom:12 }}>
            <SectionTitle icon={BarChart2} title="Ukuran Upload per Hari (MB)" color={GREEN} />
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={activityData} margin={{ top:5, right:5, left:-28, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v} MB`]} />
                <Bar dataKey="MB" radius={[5,5,0,0]}>
                  {activityData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? GREEN : CYAN} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Tipe File + CDN side by side ────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          {/* Donut - Tipe File */}
          <Card>
            <SectionTitle icon={PieIcon} title="Tipe File" color={PURPLE} />
            {typeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} strokeWidth={0}>
                      {typeData.map((t, i) => <Cell key={i} fill={t.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={TooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:6 }}>
                  {typeData.map(t => (
                    <div key={t.name} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.65rem' }}>
                      <div style={{ width:7, height:7, borderRadius:2, background:t.fill, flexShrink:0 }} />
                      <span style={{ color:'var(--text2)', flex:1 }}>{t.name}</span>
                      <span style={{ fontWeight:800, color:'var(--text)', fontFamily:'Space Mono,monospace' }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text3)', fontSize:'0.78rem' }}>Belum ada file</div>}
          </Card>

          {/* CDN / Provider */}
          <Card>
            <SectionTitle icon={HardDrive} title="CDN Storage" color={CYAN} />
            {providerData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={providerData} dataKey="File" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} strokeWidth={0}>
                      {providerData.map((p, i) => <Cell key={i} fill={p.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={TooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:6 }}>
                  {providerData.map(p => (
                    <div key={p.name} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.65rem' }}>
                      <div style={{ width:7, height:7, borderRadius:2, background:p.fill, flexShrink:0 }} />
                      <span style={{ color:'var(--text2)', flex:1 }}>{p.name}</span>
                      <span style={{ fontWeight:800, color:'var(--text)', fontFamily:'Space Mono,monospace' }}>{p.File}f · {p.Storage}MB</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize:'0.7rem', color:'var(--text3)', marginTop:8, lineHeight:1.6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}><div style={{ width:8,height:8,borderRadius:2,background:BLUE }}/> Supabase (primary)</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}><div style={{ width:8,height:8,borderRadius:2,background:GREEN }}/> Catbox (fallback)</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:8,height:8,borderRadius:2,background:PURPLE }}/> 0x0.st (last resort)</div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Recent Uploads ───────────────────────── */}
        {data?.recentUploads?.length > 0 && (
          <Card style={{ marginBottom:12 }}>
            <SectionTitle icon={Clock} title="Upload Terbaru" color={AMBER} />
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {data.recentUploads.map(f => {
                const isImg = f.mimetype?.startsWith('image/');
                return (
                  <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, padding:'8px', background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)', textDecoration:'none' }}>
                    <div style={{ width:34, height:34, borderRadius:8, background:'var(--border)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {isImg
                        ? <img src={f.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }}/>
                        : <File size={14} color="var(--text3)" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.title}</div>
                      <div style={{ fontSize:'0.62rem', color:'var(--text3)' }}>{fmtSize(f.size)} · {fmtDate(f.created_at)}</div>
                    </div>
                    <div style={{ fontSize:'0.6rem', color:'var(--text3)', background:'var(--border)', padding:'2px 7px', borderRadius:6, flexShrink:0, fontWeight:700 }}>{f.provider || 'cdn'}</div>
                  </a>
                );
              })}
            </div>
          </Card>
        )}

        <div style={{ height:30 }} />
      </div>

      <BottomNav active='dashboard' />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
