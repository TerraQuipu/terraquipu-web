import type { Metadata } from 'next';
import './globals.css';
import ModuleGuidePill from '@/components/layout/ModuleGuidePill';

export const metadata: Metadata = {
  title: 'TerraQuipu — Inteligencia Satelital para la Salud del Suelo Andino',
  description:
    'Plataforma de Inteligencia Agro-Climática para los Andes Peruanos. 100+ indicadores agroclimáticos, radar NASA SMAP, NASA POWER e INIA Perú.',
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
      </head>
      <body className="min-h-screen flex flex-col antialiased text-zinc-900 bg-white selection:bg-amber-500 selection:text-white">
        {children}
        <ModuleGuidePill />
      </body>
    </html>
  );
}
