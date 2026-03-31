import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/context/Providers';
import { Header } from '@/components/layout/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '2026 World Cup Bracket Challenge',
  description: 'Pick your 2026 FIFA World Cup bracket. Token-gated. Real-time Polymarket odds.',
  openGraph: {
    title: '2026 World Cup Bracket Challenge',
    description: 'Pick your 2026 FIFA World Cup bracket and compete with other NFT holders.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-surface-0 text-text-primary antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
