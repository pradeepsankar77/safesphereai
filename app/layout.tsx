import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/offline/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'SafeSphere AI | Predict. Protect. Respond.',
  description: 'AI-Powered Emergency Response & Disaster Management System with real-time hazard mapping, AI risk prediction, and emergency dispatch.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-black text-white font-sans antialiased selection:bg-[#C6FF00] selection:text-black min-h-screen relative overflow-x-hidden">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
