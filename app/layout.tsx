import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Formulario de Datos – Sergio Alcántara | Creappsy',
  description: 'Formulario de recopilación de datos para artistas - Creappsy',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E94560'/%3E%3Cstop offset='100%25' style='stop-color:%23FF6B35'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='%230D0D14'/%3E%3Cpath d='M16 4L4 12v8l12 8 12-8v-8L16 4z' fill='url(%23g)' opacity='0.9'/%3E%3Cpath d='M16 8l-8 5v6l8 5 8-5v-6l-8-5z' fill='%230D0D14'/%3E%3Ccircle cx='16' cy='16' r='4' fill='url(%23g)'/%3E%3Cpath d='M14 2h4v3h-4zM26 14h3v4h-3zM3 14h3v4H3zM14 27h4v3h-4z' fill='url(%23g)' opacity='0.7'/%3E%3C/svg%3E"
        />
        <link
          rel="apple-touch-icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E94560'/%3E%3Cstop offset='100%25' style='stop-color:%23FF6B35'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='180' height='180' rx='36' fill='%230D0D14'/%3E%3Cpath d='M90 22L30 67v46l60 45 60-45V67L90 22z' fill='url(%23g)' opacity='0.9'/%3E%3Cpath d='M90 45L50 73v34l40 28 40-28V73L90 45z' fill='%230D0D14'/%3E%3Ccircle cx='90' cy='90' r='22' fill='url(%23g)'/%3E%3C/svg%3E"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}