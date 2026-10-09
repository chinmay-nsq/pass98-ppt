import type { Metadata, Viewport } from 'next';
import './globals.css';
import { asset } from '@/lib/asset';

export const metadata: Metadata = {
  title: 'Pass98 | Product Deck',
  description: 'The AI interview gym: every feature of Pass98, presented.',
  icons: { icon: asset('/pass98-logo.png') },
};

export const viewport: Viewport = {
  themeColor: '#060202',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
