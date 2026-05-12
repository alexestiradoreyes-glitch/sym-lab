import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'SYM LAB — Portal de Ideas I+D+i',
  description: 'Comparte tu propuesta de innovación, investigación y desarrollo tecnológico con SYM LAB. Tu idea puede cambiar el futuro.',
  manifest: '/manifest.json',
  keywords: ['innovación', 'I+D+i', 'ideas', 'tecnología', 'investigación', 'SYM LAB'],
  authors: [{ name: 'SYM LAB' }],
  robots: 'noindex, nofollow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SYM LAB',
  },
}

export const viewport: Viewport = {
  themeColor: '#E8300A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* PWA icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/icon-192.svg" color="#E8300A" />

        {/* iOS standalone */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                  .catch(function(err) { console.warn('[SW] Error:', err); });
              });
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-sym-dark antialiased pb-mobile">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
