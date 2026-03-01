import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Keigo & Code',
    short_name: 'Keigo',
    description: 'Japanese for engineers — RTOS vocab, Agile Keigo, and travel phrases.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#22d3ee',
    categories: ['education', 'language'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/dashboard.png',
        sizes: '390x844',
        // @ts-expect-error — form_factor is valid but not yet in TS types
        form_factor: 'narrow',
      },
    ],
  };
}
