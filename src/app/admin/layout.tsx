import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consola de Administración Territorial | TerraQuipu',
  description: 'Panel de gobernanza agronómica y administración de bases de datos.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
