import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Cloud, Plus, FolderOpen, Search, Sun, Moon, Trash2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import HamburgerNav from '../components/HamburgerNav';
import Toast from '../components/Toast';
import FileCard from '../components/FileCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('Semua');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [delModal, setDelModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('Umum');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [theme, setTheme] = useState('dark');
  const fileInputRef = useRef();
  const logRef = useRef();

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    loadFiles();
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

  function addLog(msg, cls = 'info') {
    setUploadLogs(prev => [...prev, { msg, cls }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  }

  async function loadFiles() {
    const res = await fetch('/api/files');
    if (res.status === 401) { router.push('/welcome'); return; }
    const d = await res.json();
    if (d.ok) setFiles(d.files.filter(f => !f.deleted_at));
    setLoading(false);
  }

  const folders = ['Semua', ...new Set(files.map(f => f.folder || 'Umum'))];
  const filtered = files
    .filter(f => activeFolder === 'Semua' || (f.folder || 'Umum') === activeFolder)
    .filter(f => !search || (f.title || f.original_name || '').toLowerCase().includes(search.toLowerCase()));

  async function generateVideoThumb(file, fileId) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata'; video.muted = true; video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.onloadeddata = () => { video.currentTime = Math.min(2, video.duration * 0.1); };
      video.onseeked = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 480; canvas.height = 270;
          canvas.getContext('2d').drawImage(video, 0, 0, 480, 270);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const fd = new FormData();
              fd.append('thumb', blob, 'thumb.jpg');
              fd.append('fileId', fileId);
              await fetch('/api/save-thumb', { method: 'POST', body: fd });
              addLog('  Thumbnail video tersimpan', 'ok');
            }
            URL.revokeObjectURL(objectUrl); resolve();
          }, 'image/jpeg', 0.85);
        } catch { URL.revokeObjectURL(objectUrl); resolve(); }
      };
      video.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(); };
      setTimeout(() => { URL.revokeObjectURL(objectUrl); resolve(); }, 15000);
    });
  }

  async function handleUpload(fileList) {
    if (!fileList || !fileList.length) return;
    setUploading(true); setUploadLogs([]); setUploadProgress(0);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const title = fileList.length === 1 && uploadTitle ? uploadTitle : file.name.replace(/\.[^.]+$/, '');
      addLog(`Mengupload: ${file.name}`);
      const fd = new FormData();
      fd.append('file', file); fd.append('folder', uploadFolder); fd.append('title', title);
      try {
        const xhr = new XMLHttpRequest();
        const result = await new Promise((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round(((i + e.loaded/e.total) / fileList.length) * 100));
          };
          xhr.onload = () => resolve(JSON.parse(xhr.responseText));
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.open('POST', '/api/upload'); xhr.send(fd);
        });
        if (result.ok) {
          addLog(`${file.name} berhasil!`, 'ok');
          if (result.catboxUrl) addLog(`  Catbox: ${result.catboxUrl}`, 'ok');
          if (result.pixeldrainUrl) addLog(`  Pixeldrain: OK`, 'ok');
          if (result.catboxError) addLog(`  Catbox error: ${result.catboxError}`, 'err');
          if (result.pixeldrainError) addLog(`  Pixeldrain error: ${result.pixeldrainError}`, 'err');
          const ext = file.name.split('.').pop().toLowerCase();
          if (['mp4','webm','avi','mkv','mov'].includes(ext) && result.file?.id) {
            addLog('  Generating thumbnail...', 'info');
            await generateVideoThumb(file, result.file.id);
          }
        } else { addLog(`Gagal: ${result.error}`, 'err'); }
      } catch(e) { addLog(`Error: ${e.message}`, 'err'); }
    }
    setUploadProgress(100); setUploading(false);
    showToast(`${fileList.length} file diupload!`);
    setTimeout(() => { loadFiles(); setUploadOpen(false); setUploadLogs([]); setUploadProgress(0); setUploadTitle(''); }, 1500);
  }

  async function moveToTrash(file) {
    const res = await fetch('/api/trash', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: file.id, action: 'trash' }),
    });
    const d = await res.json();
    if (d.ok) { showToast('Dipindah ke Recycle Bin'); setFiles(prev => prev.filter(f => f.id !== file.id)); }
    else showToast('Gagal', 'err');
    setDelModal(null);
  }

  async function saveTitle(id, title) {
    const res = await fetch('/api/edit-title', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    });
    const d = await res.json();
    if (d.ok) { setFiles(prev => prev.map(f => f.id === id ? { ...f, title } : f)); showToast('Judul diperbarui'); }
    else showToast('Gagal', 'err');
    setEditModal(null);
  }

  function formatTotalSize(files) {
    const total = files.reduce((a, f) => a + (f.size || 0), 0);
    if (!total) return '0 B';
    const k = 1024, s = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(total) / Math.log(k));
    return (total / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
  }

  return (
    <>
      <Head><title>MDWA Cloud</title></Head>
      <div className="topbar">
        <div className="brand">
          <div className="brand-ico"><Cloud size={18} strokeWidth={2} /></div>
          MDWA <em>Cloud</em>
        </div>
        <div className="topbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="hamburger-btn" onClick={() => router.push('/trash')} title="Recycle Bin" style={{ position: 'relative' }}>
            <Trash2 size={16} />
          </button>
          <HamburgerNav />
        </div>
      </div>

      <div className="page">
        <div className="stats">
          <div className="stat"><div className="stat-n">{files.length}</div><div className="stat-l">File</div></div>
          <div className="stat"><div className="stat-n" style={{ fontSize: '0.82rem' }}>{formatTotalSize(files)}</div><div className="stat-l">Storage</div></div>
          <div className="stat"><div className="stat-n">{folders.length - 1 || 0}</div><div className="stat-l">Folder</div></div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input className="inp" placeholder="Cari file..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>

        <div className="sec-ttl">Folder</div>
        <div className="filter-tabs">
          {folders.map(f => (
            <button key={f} className={`ftab ${activeFolder === f ? 'on' : ''}`} onClick={() => setActiveFolder(f)}>
              <FolderOpen size={11} style={{ marginRight: 3 }} />{f}
            </button>
          ))}
        </div>

        <div className="sec-ttl">File Saya</div>
        {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-ico"><Cloud size={52} strokeWidth={1} /></div>
            <p>Belum ada file.<br />Tap tombol + untuk upload!</p>
          </div>
        ) : (
          <div className="file-grid">
            {filtered.map((f, i) => (
              <FileCard key={f.id} file={f} index={i}
                onDelete={() => setDelModal(f)}
                onEditTitle={() => setEditModal(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB Upload */}
      <button className="fab" onClick={() => setUploadOpen(true)} aria-label="Upload">
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">Upload File</div>
            <div className="modal-sub">Upload ke Supabase + Catbox + Pixeldrain otomatis</div>
            <div
              className="drop-zone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dov'); }}
              onDragLeave={e => e.currentTarget.classList.remove('dov')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dov'); handleUpload(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
              <div className="drop-ico"><Plus size={32} strokeWidth={1.5} style={{ color: 'var(--blue)' }} /></div>
              <div className="drop-txt">Drop file atau <span>klik pilih</span></div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 4, fontFamily: 'Space Mono' }}>Max 200MB per file</div>
            </div>
            <div className="inp-g" style={{ marginTop: 12 }}>
              <label className="inp-label">Folder</label>
              <input className="inp" value={uploadFolder} onChange={e => setUploadFolder(e.target.value)} placeholder="Umum" />
            </div>
            <div className="inp-g">
              <label className="inp-label">Judul (opsional)</label>
              <input className="inp" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Judul file..." />
            </div>
            {uploading && (
              <div className="prog-wrap">
                <div className="prog-label"><span>Mengupload...</span><span>{uploadProgress}%</span></div>
                <div className="prog-bg"><div className="prog-fill" style={{ width: uploadProgress + '%' }} /></div>
              </div>
            )}
            {uploadLogs.length > 0 && (
              <div className="upload-log" ref={logRef}>
                {uploadLogs.map((l, i) => <div key={i} className={`log-line ${l.cls}`}>{l.msg}</div>)}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost btn-full" onClick={() => { setUploadOpen(false); setUploadLogs([]); }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">Hapus File?</div>
            <div className="modal-sub">"{delModal.title || delModal.original_name}" akan dipindah ke Recycle Bin. Bisa dipulihkan nanti.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDelModal(null)}>Batal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => moveToTrash(delModal)}>Pindah ke Bin</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {editModal && <EditTitleModal file={editModal} onSave={(t) => saveTitle(editModal.id, t)} onClose={() => setEditModal(null)} />}

      <BottomNav active="home" />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

function EditTitleModal({ file, onSave, onClose }) {
  const [title, setTitle] = useState(file.title || file.original_name || '');
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">Edit Judul</div>
        <div className="inp-g">
          <label className="inp-label">Judul Baru</label>
          <input className="inp" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave(title)} autoFocus />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Batal</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(title)}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
