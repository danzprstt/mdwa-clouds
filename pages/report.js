import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Flag, Send, CheckCircle, AlertCircle, Bug, HelpCircle, Zap } from 'lucide-react';
import HamburgerNav from '../components/HamburgerNav';
import Toast from '../components/Toast';

const TYPES = [
  { id: 'bug', label: 'Bug / Error', icon: Bug, color: '#ef4444' },
  { id: 'feature', label: 'Saran Fitur', icon: Zap, color: '#4f6ef7' },
  { id: 'security', label: 'Masalah Keamanan', icon: AlertCircle, color: '#f59e0b' },
  { id: 'other', label: 'Lainnya', icon: HelpCircle, color: '#8b5cf6' },
];

export default function ReportPage() {
  const [form, setForm] = useState({ type: '', title: '', description: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t); document.documentElement.setAttribute('data-theme', t);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('mdwa-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  async function submit() {
    if (!form.type) return setToast({ msg: 'Pilih jenis laporan', type: 'err' });
    if (!form.title.trim()) return setToast({ msg: 'Isi judul laporan', type: 'err' });
    if (form.description.trim().length < 10) return setToast({ msg: 'Deskripsi minimal 10 karakter', type: 'err' });

    setLoading(true);
    const r = await fetch('/api/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setLoading(false);

    if (d.ok) setDone(true);
    else setToast({ msg: d.error || 'Gagal mengirim', type: 'err' });
  }

  const selectedType = TYPES.find(t => t.id === form.type);

  return (
    <>
      <Head>
        <title>Laporan — MDWA Cloud</title>
      </Head>
      <div className="topbar">
        <div className="brand">
          <div className="brand-ico" style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)' }}>
            <Flag size={16} color="white" />
          </div>
          Laporan
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme==='dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
          <HamburgerNav />
        </div>
      </div>

      <div className="page">
        {done ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(16,185,129,0.12)', border:'2px solid #10b981', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <div style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:8 }}>Laporan Terkirim!</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text3)', lineHeight:1.6, maxWidth:280, margin:'0 auto' }}>
              Terima kasih telah melaporkan. Tim kami akan segera meninjau laporan kamu.
            </div>
            <button className="btn btn-ghost" style={{ marginTop:24 }} onClick={() => { setDone(false); setForm({ type:'', title:'', description:'', email:'' }); }}>
              Kirim Laporan Lain
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:'1.1rem', fontWeight:800 }}>Laporkan Masalah</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:4 }}>Temukan bug? Punya saran? Beritahu kami!</div>
            </div>

            {/* Type selector */}
            <div className="inp-g">
              <label className="inp-label">Jenis Laporan</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {TYPES.map(({ id, label, icon: Icon, color }) => (
                  <button key={id} onClick={() => setForm(f => ({ ...f, type: id }))} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'12px',
                    borderRadius:12, border:`2px solid ${form.type===id ? color : 'var(--border)'}`,
                    background: form.type===id ? `${color}14` : 'var(--card)',
                    cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif',
                    fontSize:'0.8rem', fontWeight:700,
                    color: form.type===id ? color : 'var(--text2)',
                    transition:'all 0.15s',
                  }}>
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="inp-g">
              <label className="inp-label">Judul *</label>
              <input className="inp" placeholder="Ringkasan masalah dalam 1 kalimat..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={100} />
            </div>

            <div className="inp-g">
              <label className="inp-label">Deskripsi Detail *</label>
              <textarea className="inp" rows={5} placeholder="Jelaskan masalah secara detail: apa yang terjadi, langkah reproduksi, dsb..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={2000} />
              <div style={{ textAlign:'right', fontSize:'0.65rem', color:'var(--text3)', marginTop:3 }}>{form.description.length}/2000</div>
            </div>

            <div className="inp-g">
              <label className="inp-label">Email (opsional — untuk notifikasi tindak lanjut)</label>
              <input className="inp" type="email" placeholder="kamu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
              {loading ? 'Mengirim...' : (
                <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                  <Send size={16} /> Kirim Laporan
                </span>
              )}
            </button>
          </>
        )}
        <div style={{ height:30 }} />
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
