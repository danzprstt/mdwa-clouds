import { useState } from 'react';
import { Download, Trash2, Edit3, Play, Cloud, HardDrive, Database, RotateCcw } from 'lucide-react';

const WAVE_HEIGHTS = [40,60,100,75,45,90,60,30,80,55];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

function getTypeClass(type) {
  const m = { image:'t-image', video:'t-video', audio:'t-audio', pdf:'t-pdf', archive:'t-archive' };
  return m[type] || 't-other';
}

function FallbackIcon({ type }) {
  const icons = {
    image: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    video: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    audio: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    pdf: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    archive: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    file: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  };
  return <div className="thumb-fallback-ico">{icons[type] || icons.file}</div>;
}

export default function FileCard({ file, index, onDelete, onEditTitle, onRestore, isTrash = false }) {
  const [imgError, setImgError] = useState(false);
  const type = file.file_type || 'file';
  const ext = (file.ext || '').replace('.','').toUpperCase() || 'FILE';
  const downloadUrl = file.catbox_url || file.pixeldrain_url || file.supabase_url || '#';

  const renderThumb = () => {
    if (type === 'audio') {
      return (
        <div className="audio-thumb">
          <div className="waveform">
            {WAVE_HEIGHTS.map((h,i) => <div key={i} className="wave-bar" style={{ height: h+'%', animationDelay: i*0.1+'s' }} />)}
          </div>
          <div className="audio-title-sm">{file.title || file.original_name}</div>
        </div>
      );
    }
    const thumbSrc = file.thumb_url;
    if (thumbSrc && !imgError) {
      return (
        <>
          <img src={thumbSrc} alt={file.title} loading="lazy" onError={() => setImgError(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          {type === 'video' && <div className="play-overlay"><div className="play-btn-ico"><Play size={20} fill="white" /></div></div>}
        </>
      );
    }
    return <div className="thumb-fallback"><FallbackIcon type={type} /><div className="thumb-fallback-ext">{ext}</div></div>;
  };

  return (
    <div className="fcard" style={{ animationDelay: index*0.05+'s' }}>
      <div className="fcard-thumb">
        {renderThumb()}
        <div className={`fcard-type ${getTypeClass(type)}`}>{ext}</div>
        <div className="fcard-date">{formatDate(file.uploaded_at)}</div>
        {isTrash && <div style={{ position:'absolute', top:10, right:10 }}><span className="trash-badge"><Trash2 size={10} /> Terhapus</span></div>}
      </div>

      <div className="fcard-body">
        <div className="fcard-title-row">
          <div className="fcard-title">{file.title || file.original_name}</div>
          {!isTrash && <button className="edit-title-btn" onClick={onEditTitle}><Edit3 size={13} /></button>}
        </div>
        <div className="fcard-fname">{file.original_name}</div>
        <div className="fcard-meta">
          <span className="fcard-tag size"><HardDrive size={10} /> {file.size_formatted || '—'}</span>
          <span className="fcard-tag loc"><Database size={10} /> {file.folder || 'Umum'}</span>
        </div>
        {!isTrash && (
          <div className="fcard-urls">
            {file.catbox_url ? <a href={file.catbox_url} target="_blank" rel="noopener noreferrer" className="url-chip catbox"><Cloud size={10} /> Catbox</a> : <span className="url-chip pending">Catbox—</span>}
            {file.pixeldrain_url ? <a href={file.pixeldrain_url} target="_blank" rel="noopener noreferrer" className="url-chip pixeldrain"><HardDrive size={10} /> Pixeldrain</a> : <span className="url-chip pending">Pixeldrain—</span>}
            {file.supabase_url && <a href={file.supabase_url} target="_blank" rel="noopener noreferrer" className="url-chip supa"><Database size={10} /> Supa</a>}
          </div>
        )}
      </div>

      <div className="fcard-actions">
        {isTrash ? (
          <>
            <button className="fcard-btn restore" onClick={onRestore}><RotateCcw size={14} /> Pulihkan</button>
            <button className="fcard-btn del" onClick={onDelete}><Trash2 size={14} /> Hapus Permanen</button>
          </>
        ) : (
          <>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="fcard-btn dl"><Download size={14} /> Download</a>
            <button className="fcard-btn del" onClick={onDelete}><Trash2 size={14} /> Hapus</button>
          </>
        )}
      </div>
    </div>
  );
}
