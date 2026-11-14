import type { Metadata } from 'next';
import './globals.css';
import ModuleGuidePill from '@/components/layout/ModuleGuidePill';

export const metadata: Metadata = {
  metadataBase: new URL('https://terraquipu.com'),
  title: {
    default: 'TerraQuipu | Inteligencia Satelital para la Regeneración del Suelo Andino',
    template: '%s | TerraQuipu',
  },
  description:
    '100+ indicadores agroclimáticos, telemetría radar NASA SMAP, clima histórico NASA POWER y rotación biológica de nitrógeno con Tarwi validada por INIA Perú para proteger cultivos frente a El Niño.',
  keywords: [
    'agricultura andina',
    'NASA SMAP',
    'NASA POWER',
    'rotación de cultivos',
    'nitrógeno biológico',
    'Tarwi',
    'papa nativa',
    'Chinchero',
    'Urubamba',
    'Cusco',
    'El Niño',
    'telemetría satelital',
    'agroecología andina',
    'INIA Perú',
    'SENAMHI',
    'NASA Space Apps Challenge',
  ],
  authors: [{ name: 'TerraQuipu Project', url: 'https://terraquipu.com' }],
  creator: 'TerraQuipu Project',
  publisher: 'TerraQuipu',
  alternates: {
    canonical: 'https://terraquipu.com/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://terraquipu.com/',
    title: 'TerraQuipu | Inteligencia Satelital para la Regeneración del Suelo Andino',
    description:
      'Tecnología satelital libre y sabiduría ancestral para anticipar sequías, fijar nitrógeno biológico (+95 kg N/ha) y proteger las cosechas andinas.',
    siteName: 'TerraQuipu',
    images: [
      {
        url: 'https://terraquipu.com/images/crops_banner.jpg',
        width: 1200,
        height: 630,
        alt: 'TerraQuipu — Inteligencia Satelital y Agroecología Andina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerraQuipu | Inteligencia Satelital Andina',
    description:
      'Ciencia espacial y protocolos INIA para regenerar el suelo y anticipar sequías en los Andes.',
    images: ['https://terraquipu.com/images/crops_banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TerraQuipu',
              url: 'https://terraquipu.com/',
              description:
                'Sistema de inteligencia agroclimática y regeneración edáfica en los Andes Peruanos con telemetría de NASA y protocolos INIA.',
              inLanguage: 'es-PE',
              publisher: {
                '@type': 'Organization',
                name: 'TerraQuipu Project',
                url: 'https://terraquipu.com/',
                logo: 'https://terraquipu.com/images/kipu_llama_happy.png',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased text-zinc-900 bg-white selection:bg-amber-500 selection:text-white">
        {children}
        <ModuleGuidePill />
      </body>
    </html>
  );
}
