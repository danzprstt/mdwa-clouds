import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Cloud, Upload, Shield, Zap, ArrowRight, LogIn } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Apply saved theme
    const t = localStorage.getItem('mdwa-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  return (
    <>
      <Head><title>MDWA Cloud — Welcome</title></Head>
      <div className="welcome-page">
        <div className="welcome-orb o1" />
        <div className="welcome-orb o2" />
        <div className="welcome-orb o3" />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="welcome-logo">
            <Cloud size={36} strokeWidth={2} />
          </div>

          <h1 className="welcome-title">
            MDWA<br /><span className="grad">Cloud</span>
          </h1>
          <p className="welcome-sub">
            Cloud storage pribadi kamu. Upload, simpan, dan akses file dari mana saja — gratis selamanya.
          </p>

          <div className="welcome-features">
            <div className="welcome-feat">
              <div className="feat-ico" style={{ background: 'linear-gradient(135deg,#4f6ef7,#06b6d4)' }}>
                <Upload size={16} />
              </div>
              <span>Upload ke Catbox + Pixeldrain otomatis</span>
            </div>
            <div className="welcome-feat">
              <div className="feat-ico" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
                <Shield size={16} />
              </div>
              <span>Multi-user dengan sistem login aman</span>
            </div>
            <div className="welcome-feat">
              <div className="feat-ico" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                <Zap size={16} />
              </div>
              <span>Preview gambar & video langsung</span>
            </div>
          </div>

          <button
            className="btn btn-primary welcome-btn"
            onClick={() => router.push('/register')}
          >
            Mulai Sekarang <ArrowRight size={18} />
          </button>

          <p className="welcome-login-link">
            Sudah punya akun?{' '}
            <button onClick={() => router.push('/login')}>
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
