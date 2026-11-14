import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visor Territorial y Satelital de Parcelas | TerraQuipu',
  description:
    'Monitoreo satelital interactivo en tiempo real con radar NASA SMAP L4, NDVI multiespectral y recomendación de rotación de cultivos para parcelas andinas. Validación científica INIA & SENAMHI.',
  keywords: [
    'visor satelital',
    'mapa de parcelas',
    'NASA SMAP',
    'NDVI',
    'Chinchero',
    'Urubamba',
    'Cusco',
    'rotación de cultivos',
    'agricultura de precisión andina',
    'INIA Perú',
  ],
  alternates: {
    canonical: 'https://terraquipu.com/visor/',
  },
  openGraph: {
    title: 'Visor Territorial y Satelital de Parcelas | TerraQuipu',
    description:
      'Delimita tu parcela andina, consulta humedad radicular por radar satelital NASA SMAP y genera tu plan de rotación multianual.',
    url: 'https://terraquipu.com/visor/',
    siteName: 'TerraQuipu',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: 'https://terraquipu.com/images/parcel_header.jpg',
        width: 1200,
        height: 630,
        alt: 'TerraQuipu Visor Territorial Satelital de Parcelas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visor Territorial Satelital | TerraQuipu',
    description:
      'Monitoreo satelital en tiempo real para parcelas agrícolas andinas. NASA SMAP + INIA Perú.',
    images: ['https://terraquipu.com/images/parcel_header.jpg'],
  },
};

export default function VisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Schema.org WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'TerraQuipu Visor Territorial Satelital',
            url: 'https://terraquipu.com/visor/',
            description:
              'Herramienta cartográfica y satelital para el trazado de parcelas agrícolas andinas y cálculo de secuencias de rotación agroecológica.',
            applicationCategory: 'AgriculturalApplication',
            operatingSystem: 'All',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            creator: {
              '@type': 'Organization',
              name: 'TerraQuipu Project',
              url: 'https://terraquipu.com/',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
      {children}
    </>
  );
}
