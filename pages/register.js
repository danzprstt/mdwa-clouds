import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Cloud, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  async function doRegister(e) {
    e.preventDefault();
    setErr('');
    if (!name || !username || !password) return setErr('Isi semua field!');
    if (password.length < 6) return setErr('Password minimal 6 karakter!');
    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.ok) router.push('/login');
    else setErr(d.error || 'Gagal daftar');
  }

  return (
    <>
      <Head><title>MDWA Cloud — Daftar</title></Head>
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="lg-ico"><Cloud size={26} strokeWidth={2} /></div>
            <h1>Buat <em style={{ background: 'var(--grad1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'normal' }}>Akun</em></h1>
            <p>Gratis selamanya, tidak perlu kartu kredit</p>
          </div>

          {err && <div className="msg-err"><AlertCircle size={14} />{err}</div>}

          <form onSubmit={doRegister}>
            <div className="inp-g">
              <label className="inp-label">Nama Lengkap</label>
              <input className="inp" placeholder="Nama kamu" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="inp-g">
              <label className="inp-label">Username</label>
              <input className="inp" placeholder="huruf, angka, underscore" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="inp-g">
              <label className="inp-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="inp" type={showPass ? 'text' : 'password'} placeholder="min. 6 karakter" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Membuat akun...' : <><UserPlus size={16} /> Buat Akun</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text2)' }}>
            Sudah punya akun?{' '}
            <button onClick={() => router.push('/login')} style={{ border: 'none', background: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans', fontSize: '0.82rem' }}>
              Login di sini
            </button>
          </div>
          <button onClick={() => router.push('/welcome')} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px auto 0', border: 'none', background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Plus Jakarta Sans' }}>
            <ArrowLeft size={14} /> Kembali ke halaman utama
          </button>
        </div>
      </div>
    </>
  );
}
