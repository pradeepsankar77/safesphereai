import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafeSphere AI | Predict. Protect. Respond.',
  description: 'AI-Powered Emergency Response & Disaster Management System',
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
      </head>
      <body className="bg-black text-white antialiased selection:bg-[#C6FF00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
