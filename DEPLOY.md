# ☁ MDWA Cloud — Panduan Deploy ke Vercel + Supabase

Gratis 100%, tidak perlu kartu kredit.

---

## LANGKAH 1 — Setup Supabase (Database + Storage)

### 1.1 Buat Akun & Project
1. Buka https://supabase.com → **Sign Up** (gratis)
2. Klik **New Project**
3. Isi nama project: `mdwa-cloud`
4. Buat password database (simpan!)
5. Pilih region terdekat (Singapore)
6. Klik **Create new project** → tunggu ~2 menit

### 1.2 Buat Tabel Database
1. Di dashboard Supabase → klik **SQL Editor**
2. Klik **New query**
3. Copy-paste isi file `supabase-schema.sql`
4. Klik **Run** (▶)
5. Pastikan muncul "Success"

### 1.3 Buat Storage Bucket
1. Di sidebar kiri → klik **Storage**
2. Klik **New bucket**
3. Nama bucket: `mdwa-files`
4. **Centang "Public bucket"** ✅
5. Klik **Save**

### 1.4 Ambil Credentials
1. Di sidebar → **Settings** → **API**
2. Catat:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## LANGKAH 2 — Upload ke GitHub

### 2.1 Buat repo baru
1. Buka https://github.com → **New repository**
2. Nama: `mdwa-cloud`
3. Private ✅ (supaya .env tidak bocor)
4. Klik **Create repository**

### 2.2 Upload semua file
```bash
# Di folder mdwa-nextjs
git init
git add .
git commit -m "MDWA Cloud v3"
git branch -M main
git remote add origin https://github.com/USERNAME/mdwa-cloud.git
git push -u origin main
```

**PENTING:** Jangan commit `.env.local`! File `.gitignore` sudah mengecualikannya.

---

## LANGKAH 3 — Deploy ke Vercel

### 3.1 Buat Akun & Import
1. Buka https://vercel.com → **Sign up with GitHub**
2. Klik **Add New Project**
3. Pilih repo `mdwa-cloud` → klik **Import**
4. Framework: **Next.js** (otomatis terdeteksi)

### 3.2 Tambah Environment Variables
Sebelum deploy, klik **Environment Variables** dan tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |
| `JWT_SECRET` | string acak panjang, misal: `mdwa2026secretkeybanget123` |
| `CATBOX_USERHASH` | kosongkan dulu (opsional) |

### 3.3 Deploy!
1. Klik **Deploy**
2. Tunggu ~2-3 menit
3. Vercel akan memberi URL seperti: `https://mdwa-cloud-xxx.vercel.app`

---

## LANGKAH 4 — Tambah Domain Kustom (Opsional)

1. Di Vercel dashboard → **Settings** → **Domains**
2. Tambahkan domain kamu
3. Ikuti instruksi DNS

---

## Struktur Project

```
mdwa-nextjs/
├── pages/
│   ├── index.js          ← Home (file manager)
│   ├── login.js          ← Login & Register
│   ├── profile.js        ← Profil user
│   └── api/
│       ├── login.js      ← POST /api/login
│       ├── register.js   ← POST /api/register
│       ├── logout.js     ← POST /api/logout
│       ├── upload.js     ← POST /api/upload
│       ├── files.js      ← GET /api/files
│       ├── delete.js     ← POST /api/delete
│       ├── edit-title.js ← POST /api/edit-title
│       ├── save-thumb.js ← POST /api/save-thumb
│       ├── me.js         ← GET /api/me
│       └── edit-profile.js
├── components/
│   ├── FileCard.js       ← Komponen card file
│   ├── BottomNav.js      ← Navigasi bawah
│   └── Toast.js          ← Notifikasi
├── lib/
│   ├── supabase.js       ← Supabase client
│   ├── auth.js           ← JWT helpers
│   └── upload.js         ← Catbox + Uguu upload
├── styles/
│   └── globals.css       ← Global styles
├── supabase-schema.sql   ← Jalankan di Supabase SQL Editor
├── .env.local            ← Template env (JANGAN di-commit!)
└── package.json
```

---

## Cara Kerja Upload

```
User pilih file
     ↓
Browser → POST /api/upload
     ↓
Server upload ke 3 tempat sekaligus:
  1. Supabase Storage → dapat public URL permanen
  2. Catbox.moe       → CDN gratis, URL permanen
  3. Uguu.se          → backup CDN (48 jam)
     ↓
Metadata disimpan di Supabase PostgreSQL
     ↓
Kalau video: browser generate thumbnail via Canvas API
             → upload thumbnail ke Supabase Storage
```

---

## Batas Gratis

| Platform | Batas |
|----------|-------|
| Vercel | 100GB bandwidth/bulan, unlimited deploys |
| Supabase | 500MB database, 1GB storage, 2GB bandwidth |
| Catbox.moe | Unlimited, file permanen, max 200MB/file |
| Uguu.se | Max 128MB/file, file dihapus setelah 48 jam |

---

## Troubleshooting

**Build error "Module not found"**
```bash
npm install
```

**Upload gagal di Vercel**
- Vercel punya batas 4.5MB untuk request body di API routes
- Untuk file besar, pertimbangkan upload langsung ke Supabase dari browser

**Supabase connection error**
- Pastikan environment variables sudah benar
- Cek di Vercel → Settings → Environment Variables
