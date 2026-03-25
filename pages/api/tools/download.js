export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { url, platform } = req.body;
  if (!url) return res.json({ ok: false, error: 'URL diperlukan' });

  const detected = platform || detectPlatform(url);
  if (!detected) return res.json({ ok: false, error: 'Platform tidak dikenali.' });

  try {
    switch (detected) {
      case 'tiktok':    return await dlTikTok(url, res);
      case 'instagram': return await dlInstagram(url, res);
      case 'youtube':   return await dlYouTube(url, res);
      case 'facebook':  return await dlFacebook(url, res);
      case 'pinterest': return await dlPinterest(url, res);
      case 'twitter':   return await dlTwitter(url, res);
      default: return res.json({ ok: false, error: 'Platform belum didukung' });
    }
  } catch (e) {
    return res.json({ ok: false, error: 'Server error: ' + e.message });
  }
}

function detectPlatform(url) {
  const u = (url || '').toLowerCase();
  if (u.includes('tiktok.com') || u.includes('vm.tiktok.com') || u.includes('vt.tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) return 'facebook';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  return null;
}

// ── TIKTOK (tikwm.com — stabil) ─────────────────────────
async function dlTikTok(url, res) {
  const r = await fetch('https://www.tikwm.com/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' },
    body: `url=${encodeURIComponent(url)}&hd=1`,
  });
  const data = await r.json();
  if (data.code !== 0) throw new Error(data.msg || 'TikTok gagal');
  const d = data.data;
  return res.json({
    ok: true, platform: 'tiktok', type: 'result',
    title: d.title, thumb: d.cover,
    items: [
      d.hdplay && { label: 'Video HD (No Watermark)', url: d.hdplay, type: 'video' },
      d.play   && { label: 'Video SD (No Watermark)', url: d.play, type: 'video' },
      d.wmplay && { label: 'Video + Watermark', url: d.wmplay, type: 'video' },
      d.music  && { label: 'Audio MP3', url: d.music, type: 'audio' },
    ].filter(Boolean),
  });
}

// ── INSTAGRAM (instaloader via allorigins proxy) ─────────
async function dlInstagram(url, res) {
  // Use instagramsave.io API
  try {
    const r = await fetch('https://instasave.website/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/112.0',
        'Origin': 'https://instasave.website',
        'Referer': 'https://instasave.website/',
      },
      body: `url=${encodeURIComponent(url)}`,
    });
    const data = await r.json();
    if (data && data.data && data.data.length > 0) {
      return res.json({
        ok: true, platform: 'instagram', type: 'result',
        title: data.title || 'Instagram Media',
        thumb: data.thumb || data.data[0]?.thumbnail,
        items: data.data.map((item, i) => ({
          label: item.type === 'video' ? `Video ${i+1}` : `Gambar ${i+1}`,
          url: item.url, type: item.type || 'image',
          thumb: item.thumbnail,
        })),
      });
    }
    throw new Error('no data');
  } catch {
    // Fallback: snapinsta API
    try {
      const r2 = await fetch('https://snapinsta.app/action.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36',
          'Origin': 'https://snapinsta.app',
          'Referer': 'https://snapinsta.app/',
        },
        body: `url=${encodeURIComponent(url)}&lang=id`,
      });
      const html = await r2.text();
      // Extract video/image links from HTML
      const videoUrls = [...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g)].map(m => m[1]);
      const imageUrls = [...html.matchAll(/href="(https:\/\/[^"]+\.(jpg|jpeg|webp)[^"]*)"/g)].map(m => m[1]);
      const items = [
        ...videoUrls.slice(0,3).map((u,i) => ({ label:`Video ${i+1}`, url: u.replace(/&amp;/g,'&'), type:'video' })),
        ...imageUrls.slice(0,6).map((u,i) => ({ label:`Gambar ${i+1}`, url: u.replace(/&amp;/g,'&'), type:'image' })),
      ];
      if (items.length > 0) {
        return res.json({ ok: true, platform:'instagram', type:'result', items });
      }
    } catch {}
    // Final fallback: direct IG embed
    return res.json({
      ok: true, platform: 'instagram', type: 'result',
      items: [
        { label: 'Buka di SnapInsta (Download Langsung)', url: `https://snapinsta.app/?url=${encodeURIComponent(url)}`, type: 'external' },
        { label: 'Buka di SaveIG', url: `https://saveig.app/?url=${encodeURIComponent(url)}`, type: 'external' },
      ],
    });
  }
}

// ── YOUTUBE (yt-dlp via loader.to API) ──────────────────
async function dlYouTube(url, res) {
  const videoId = (url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1];

  // Use loader.to (free, reliable JSON API)
  try {
    const r = await fetch(`https://loader.to/api/button/?url=${encodeURIComponent(url)}&f=mp4`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await r.text();
    // loader.to returns a redirect/token system — use their ajax API
    const r2 = await fetch(`https://ab.loader.to/api/button/?url=${encodeURIComponent(url)}&f=mp4`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await r2.json();
    if (data && data.url) {
      return res.json({ ok: true, platform:'youtube', type:'result', items:[
        { label:'Video MP4', url: data.url, type:'video' }
      ]});
    }
  } catch {}

  // Fallback: use yt5s.io API
  try {
    const r = await fetch('https://yt5s.io/api/ajaxSearch/index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://yt5s.io',
        'Referer': 'https://yt5s.io/',
      },
      body: `q=${encodeURIComponent(url)}&vt=mp4`,
    });
    const data = await r.json();
    if (data.status === 'ok' && data.links) {
      const items = [];
      if (data.links.mp4) Object.entries(data.links.mp4).slice(0,3).forEach(([q,info]) => {
        if (info.url) items.push({ label:`Video ${q}`, url:info.url, type:'video' });
      });
      if (data.links.mp3) Object.entries(data.links.mp3).slice(0,2).forEach(([q,info]) => {
        if (info.url) items.push({ label:`Audio MP3 ${q}`, url:info.url, type:'audio' });
      });
      if (items.length > 0) return res.json({ ok:true, platform:'youtube', type:'result', title:data.t, thumb:data.a, items });
    }
  } catch {}

  // Final fallback: direct links
  return res.json({
    ok: true, platform: 'youtube', type: 'result',
    title: 'YouTube Video',
    thumb: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
    items: [
      { label: '🎬 Download via Y2Mate', url: `https://www.y2mate.com/youtube/${videoId || ''}`, type: 'external' },
      { label: '🎬 Download via SaveFrom', url: `https://en.savefrom.net/#url=${encodeURIComponent(url)}`, type: 'external' },
    ],
  });
}

// ── FACEBOOK (getfvid scraping) ──────────────────────────
async function dlFacebook(url, res) {
  try {
    // Use getfvid.com API
    const r = await fetch('https://getfvid.com/downloader', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/112.0',
        'Origin': 'https://getfvid.com',
        'Referer': 'https://getfvid.com/',
      },
      body: `url=${encodeURIComponent(url)}&token=`,
    });
    const html = await r.text();
    // Extract token and video links
    const sdMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>\s*(?:Normal|SD|Standard)/i);
    const hdMatch = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>\s*(?:HD|High)/i);
    // Also try generic mp4 extraction
    const allMp4 = [...html.matchAll(/href="(https:\/\/[^"]*\.mp4[^"]*)"/g)].map(m=>m[1].replace(/&amp;/g,'&')).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3);

    const items = [];
    if (hdMatch) items.push({ label:'Video HD', url:hdMatch[1].replace(/&amp;/g,'&'), type:'video' });
    if (sdMatch) items.push({ label:'Video SD', url:sdMatch[1].replace(/&amp;/g,'&'), type:'video' });
    if (items.length === 0 && allMp4.length > 0) {
      allMp4.forEach((u,i) => items.push({ label:`Video ${i+1}`, url:u, type:'video' }));
    }
    if (items.length > 0) return res.json({ ok:true, platform:'facebook', type:'result', items });
    throw new Error('no links found');
  } catch {
    // Fallback: fdown.net
    try {
      const r = await fetch(`https://fdown.net/index.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Origin': 'https://fdown.net',
          'Referer': 'https://fdown.net/',
        },
        body: `URLz=${encodeURIComponent(url)}`,
      });
      const html = await r.text();
      const sdLink = (html.match(/id="sdlink"\s+href="([^"]+)"/) || [])[1];
      const hdLink = (html.match(/id="hdlink"\s+href="([^"]+)"/) || [])[1];
      const items = [];
      if (hdLink) items.push({ label:'Video HD', url:hdLink, type:'video' });
      if (sdLink) items.push({ label:'Video SD', url:sdLink, type:'video' });
      if (items.length > 0) return res.json({ ok:true, platform:'facebook', type:'result', items });
    } catch {}
    return res.json({ ok:false, error:'Gagal mengambil video Facebook. Pastikan video bersifat publik.' });
  }
}

// ── PINTEREST ────────────────────────────────────────────
async function dlPinterest(url, res) {
  try {
    const r = await fetch(`https://www.pinterest.com/oembed/?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await r.json();
    if (data.thumbnail_url) {
      const orig = data.thumbnail_url.replace(/\/\d+x\//, '/originals/');
      return res.json({ ok:true, platform:'pinterest', type:'result', title:data.title,
        thumb:data.thumbnail_url,
        items:[
          { label:'Gambar Original (Full Size)', url:orig, type:'image' },
          { label:'Gambar Preview', url:data.thumbnail_url, type:'image' },
        ],
      });
    }
    throw new Error('no thumbnail');
  } catch {
    return res.json({ ok:false, error:'Gagal mengambil media Pinterest. Pastikan pin bersifat publik.' });
  }
}

// ── TWITTER/X (twitsave scraping) ───────────────────────
async function dlTwitter(url, res) {
  try {
    // Use twitsave.com API
    const r = await fetch(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    const html = await r.text();
    // Extract download links
    const titleMatch = html.match(/<p[^>]*class="[^"]*m-2[^"]*"[^>]*>([^<]+)<\/p>/);
    const thumbMatch = html.match(/src="(https:\/\/pbs\.twimg\.com\/[^"]+)"/);
    const links = [...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/g)].map(m=>m[1].replace(/&amp;/g,'&')).filter((v,i,a)=>a.indexOf(v)===i);
    // Label by quality
    if (links.length > 0) {
      const items = links.slice(0,4).map((u,i) => ({
        label: i===0 ? 'Video HD' : i===1 ? 'Video SD' : `Video ${i+1}`,
        url: u, type: 'video',
      }));
      return res.json({ ok:true, platform:'twitter', type:'result',
        title: titleMatch?.[1]?.trim(),
        thumb: thumbMatch?.[1],
        items,
      });
    }
    throw new Error('no links');
  } catch {
    // Fallback: twittervideodownloader.com
    try {
      const r = await fetch('https://twittervideodownloader.com/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Origin': 'https://twittervideodownloader.com',
          'Referer': 'https://twittervideodownloader.com/',
        },
        body: `tweet=${encodeURIComponent(url)}`,
      });
      const html = await r.text();
      const links = [...html.matchAll(/href="(https:\/\/video\.twimg\.com\/[^"]+\.mp4[^"]*)"/g)].map(m=>m[1].replace(/&amp;/g,'&')).filter((v,i,a)=>a.indexOf(v)===i);
      if (links.length > 0) {
        return res.json({ ok:true, platform:'twitter', type:'result',
          items: links.slice(0,3).map((u,i) => ({ label:i===0?'Video HD':i===1?'Video SD':`Video ${i+1}`, url:u, type:'video' }))
        });
      }
    } catch {}
    return res.json({ ok:false, error:'Gagal mengambil video Twitter/X. Pastikan tweet bersifat publik dan berisi video.' });
  }
}
