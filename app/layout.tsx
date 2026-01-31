import type { Metadata } from 'next';
import { Rajdhani } from 'next/font/google';
import './globals.css';

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Activerse - Ultimate Arcade & Entertainment Experience',
  description: 'Enter a world where fitness meets fun and games get real.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={rajdhani.className}>{children}</body>
    </html>
  );
}
