import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terraquipu • The Autonomous Soil Intelligence System",
  description: "Plataforma de código abierto que fusiona datos satelitales de la NASA con la sabiduría agronómica del Quipu para proteger suelos andinos frente a El Niño.",
  icons: {
    icon: "./assets/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="./assets/logo.svg" />
      </head>
      <body className="antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
