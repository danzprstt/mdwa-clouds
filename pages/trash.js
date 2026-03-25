import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Cloud, Trash2, RotateCcw, ArrowLeft, Sun, Moon } from 'lucide-react';
import Toast from '../components/Toast';
import FileCard from '../components/FileCard';

export default function TrashPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [emptyOpen, setEmptyOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    loadTrash();
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

  async function loadTrash() {
    const res = await fetch('/api/trash');
    if (res.status === 401) { router.push('/welcome'); return; }
    const d = await res.json();
    if (d.ok) setFiles(d.files);
    setLoading(false);
  }

  async function restore(id) {
    const res = await fetch('/api/trash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'restore' }) });
    const d = await res.json();
    if (d.ok) { showToast('File dipulihkan!'); setFiles(prev => prev.filter(f => f.id !== id)); }
    else showToast('Gagal', 'err');
  }

  async function deletePermanent(id) {
    const res = await fetch('/api/trash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'delete' }) });
    const d = await res.json();
    if (d.ok) { showToast('Dihapus permanen'); setFiles(prev => prev.filter(f => f.id !== id)); }
    else showToast('Gagal', 'err');
  }

  async function emptyTrash() {
    const res = await fetch('/api/trash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'empty' }) });
    const d = await res.json();
    if (d.ok) { showToast('Recycle Bin dikosongkan'); setFiles([]); }
    else showToast('Gagal', 'err');
    setEmptyOpen(false);
  }

  return (
    <>
      <Head><title>MDWA Cloud — Recycle Bin</title></Head>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <div className="brand"><div className="brand-ico" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}><Trash2 size={16} /></div>Recycle Bin</div>
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {files.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => setEmptyOpen(true)}>Kosongkan</button>
          )}
        </div>
      </div>

      <div className="page" style={{ paddingBottom: 32 }}>
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: '0.78rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash2 size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
          File di sini bisa dipulihkan atau dihapus permanen. URL Catbox/Pixeldrain tetap aktif.
        </div>

        {loading ? (
          <div className="empty"><div className="empty-ico"><Trash2 size={40} strokeWidth={1} /></div><p>Memuat...</p></div>
        ) : files.length === 0 ? (
          <div className="empty">
            <div className="empty-ico"><Trash2 size={52} strokeWidth={1} /></div>
            <p>Recycle Bin kosong.<br />Tidak ada file yang dihapus.</p>
          </div>
        ) : (
          <div className="file-grid">
            {files.map((f, i) => (
              <FileCard key={f.id} file={f} index={i} isTrash={true}
                onRestore={() => restore(f.id)}
                onDelete={() => deletePermanent(f.id)}
              />
            ))}
          </div>
        )}
      </div>

      {emptyOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title" style={{ color: 'var(--red)' }}>Kosongkan Recycle Bin?</div>
            <div className="modal-sub">Semua {files.length} file akan dihapus permanen dari Supabase. URL Catbox/Pixeldrain tetap aktif.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setEmptyOpen(false)}>Batal</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={emptyTrash}>Hapus Semua</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
