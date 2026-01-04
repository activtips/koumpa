import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Koumpa - Creez votre application en quelques minutes',
  description:
    'Transformez vos idees en applications web grace a l\'intelligence artificielle. Decrivez ce que vous voulez, Koumpa le cree.',
  keywords: ['AI', 'application', 'web', 'generateur', 'no-code', 'low-code'],
  authors: [{ name: 'Koumpa' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://koumpa.com',
    siteName: 'Koumpa',
    title: 'Koumpa - Creez votre application en quelques minutes',
    description:
      'Transformez vos idees en applications web grace a l\'intelligence artificielle.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Koumpa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koumpa - Creez votre application en quelques minutes',
    description:
      'Transformez vos idees en applications web grace a l\'intelligence artificielle.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-dark-900 text-dark-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
