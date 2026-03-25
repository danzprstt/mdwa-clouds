import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MDWA Cloud — Private Cloud Storage</title>
        <meta name="description" content="MDWA Cloud adalah layanan penyimpanan cloud pribadi dengan tools downloader, QR generator, dan berbagai fitur berguna." />
        <meta name="theme-color" content="#0d0f14" />
        {/* OG Meta Tags untuk WhatsApp, Telegram, dsb */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MDWA Cloud — Private Cloud Storage" />
        <meta property="og:description" content="Simpan, kelola, dan bagikan file dengan aman. Dilengkapi tools downloader media, QR generator, dan masih banyak lagi." />
        <meta property="og:image" content="https://mdwa-clouds.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://mdwa-clouds.vercel.app" />
        <meta property="og:site_name" content="MDWA Cloud" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MDWA Cloud — Private Cloud Storage" />
        <meta name="twitter:description" content="Simpan, kelola, dan bagikan file dengan aman." />
        <meta name="twitter:image" content="https://mdwa-clouds.vercel.app/og-image.png" />
        {/* PWA */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/og-image.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
