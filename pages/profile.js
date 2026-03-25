import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Cloud, Edit3, Plus, LogOut, RefreshCw, Trash2, Sun, Moon, Shield, AlertTriangle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import HamburgerNav from '../components/HamburgerNav';
import Toast from '../components/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editErr, setEditErr] = useState('');
  const [addName, setAddName] = useState('');
  const [addUser, setAddUser] = useState('');
  const [addPass, setAddPass] = useState('');
  const [addErr, setAddErr] = useState('');
  const [addOk, setAddOk] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [delErr, setDelErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    loadData();
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('mdwa-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    const [meRes, filesRes] = await Promise.all([fetch('/api/me'), fetch('/api/files')]);
    if (meRes.status === 401) { router.push('/welcome'); return; }
    const meData = await meRes.json();
    const filesData = await filesRes.json();
    if (meData.ok) { setUser(meData.user); setEditName(meData.user.name); }
    if (filesData.ok) setFiles(filesData.files);
    setLoading(false);
  }

  async function doLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/welcome');
  }

  async function saveEdit() {
    setEditErr('');
    if (editPass && editPass.length < 6) return setEditErr('Password minimal 6 karakter');
    const res = await fetch('/api/edit-profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, password: editPass || undefined }),
    });
    const d = await res.json();
    if (d.ok) { showToast('Profil diperbarui!'); setEditOpen(false); setUser(u => ({ ...u, name: editName })); setEditPass(''); }
    else setEditErr(d.error || 'Gagal');
  }

  async function createAcc() {
    setAddErr(''); setAddOk('');
    if (!addName || !addUser || !addPass) return setAddErr('Isi semua field!');
    if (addPass.length < 6) return setAddErr('Password minimal 6 karakter');
    const res = await fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName, username: addUser, password: addPass }),
    });
    const d = await res.json();
    if (d.ok) { setAddOk('Akun berhasil dibuat!'); setAddName(''); setAddUser(''); setAddPass(''); }
    else setAddErr(d.error || 'Gagal');
  }

  async function deleteAccount() {
    setDelErr('');
    if (deleteConfirm !== user?.username) return setDelErr('Username tidak cocok');
    const res = await fetch('/api/delete-account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: deleteConfirm }) });
    const d = await res.json();
    if (d.ok) { router.push('/welcome'); }
    else setDelErr(d.error || 'Gagal');
  }

  const totalSize = files.reduce((a, f) => a + (f.size || 0), 0);
  const initial = (user?.name || 'U')[0].toUpperCase();

  function formatSize(b) {
    if (!b) return '0 B';
    const k = 1024, s = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
  }

  return (
    <>
      <Head><title>MDWA Cloud — Profil</title></Head>
      <div className="topbar">
        <div className="brand"><div className="brand-ico"><Cloud size={18} /></div>MDWA <em>Cloud</em></div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <HamburgerNav />
        </div>
      </div>

      <div className="page">
        {/* Profile Card */}
        <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '24px 16px', marginBottom: 14 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)' }}>Memuat...</div>
          ) : (
            <>
              <div className="avatar">{initial}</div>
              <div className="p-name">{user?.name || '—'}</div>
              <div className="p-uname">@{user?.username || '—'}</div>
              <div className="stats">
                <div className="stat"><div className="stat-n">{files.filter(f=>!f.deleted_at).length}</div><div className="stat-l">File</div></div>
                <div className="stat"><div className="stat-n" style={{ fontSize: '0.82rem' }}>{formatSize(totalSize)}</div><div className="stat-l">Storage</div></div>
                <div className="stat"><div className="stat-n">{new Set(files.map(f => f.folder || 'Umum')).size}</div><div className="stat-l">Folder</div></div>
              </div>
            </>
          )}
        </div>

        <div className="sec-ttl">Akun</div>
        <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div className="menu">
            <button className="menu-item" onClick={() => setEditOpen(true)}>
              <span className="mi-ico"><Edit3 size={17} /></span>Edit Profil
              <span className="mi-arr"><RefreshCw size={13} /></span>
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            <button className="menu-item" onClick={() => setAddOpen(true)}>
              <span className="mi-ico"><Plus size={17} /></span>Buat Akun Baru
              <span className="mi-arr"><RefreshCw size={13} /></span>
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            <button className="menu-item" onClick={doLogout}>
              <span className="mi-ico"><RefreshCw size={17} /></span>Ganti Akun
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            <button className="menu-item" onClick={doLogout}>
              <span className="mi-ico"><LogOut size={17} /></span>Keluar
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
            <button className="menu-item red" onClick={() => setDeleteOpen(true)}>
              <span className="mi-ico"><Trash2 size={17} /></span>Hapus Akun
            </button>
          </div>
        </div>

        <div className="sec-ttl">Cloud Status</div>
        <div className="glass" style={{ borderRadius: 'var(--radius)', padding: '16px' }}>
          {[
            { label: 'Status', value: 'Online', color: 'var(--green)' },
            { label: 'Primary CDN', value: 'catbox.moe', color: 'var(--blue)' },
            { label: 'Backup CDN', value: 'pixeldrain.com', color: 'var(--yellow)' },
            { label: 'Database', value: 'Supabase', color: 'var(--green)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ color: item.color, fontFamily: 'Space Mono', fontSize: '0.72rem', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">Edit Profil</div>
            <div className="inp-g"><label className="inp-label">Nama Baru</label><input className="inp" value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="inp-g"><label className="inp-label">Password Baru (kosong = tidak berubah)</label><input className="inp" type="password" value={editPass} onChange={e => setEditPass(e.target.value)} placeholder="Password baru..." /></div>
            {editErr && <div className="msg-err"><AlertTriangle size={14} />{editErr}</div>}
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setEditOpen(false)}>Batal</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={saveEdit}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {addOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">Buat Akun Baru</div>
            <div className="inp-g"><label className="inp-label">Nama</label><input className="inp" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Nama lengkap" /></div>
            <div className="inp-g"><label className="inp-label">Username</label><input className="inp" value={addUser} onChange={e => setAddUser(e.target.value)} placeholder="username" /></div>
            <div className="inp-g"><label className="inp-label">Password</label><input className="inp" type="password" value={addPass} onChange={e => setAddPass(e.target.value)} placeholder="min. 6 karakter" /></div>
            {addErr && <div className="msg-err"><AlertTriangle size={14} />{addErr}</div>}
            {addOk && <div className="msg-ok"><Shield size={14} />{addOk}</div>}
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setAddOpen(false)}>Tutup</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={createAcc}>Buat</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title" style={{ color: 'var(--red)' }}>Hapus Akun</div>
            <div className="modal-sub">Tindakan ini tidak bisa dibatalkan. Semua file akan dihapus permanen. Ketik username <strong>@{user?.username}</strong> untuk konfirmasi.</div>
            <div className="inp-g"><label className="inp-label">Ketik Username</label><input className="inp" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={user?.username} /></div>
            {delErr && <div className="msg-err"><AlertTriangle size={14} />{delErr}</div>}
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDelErr(''); }}>Batal</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={deleteAccount}>Hapus Permanen</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
