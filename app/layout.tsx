import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({ variable: '--font-body', subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Loaves & Lattes | Homemade Breads & Coffee Syrups',
  description:
    'Small-batch pumpkin and banana breads with handcrafted coffee syrups, made from scratch with love.',
  icons: { icon: `${siteUrl}/favicon.svg` },
  openGraph: {
    title: 'Loaves & Lattes | Homemade Breads & Coffee Syrups',
    description:
      'Small-batch pumpkin and banana breads with handcrafted coffee syrups, made from scratch with love.',
    images: [
      {
        url: '/og-social-v2.png',
        width: 1200,
        height: 630,
        alt: 'Loaves & Lattes homemade breads and coffee syrups',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loaves & Lattes | Homemade Breads & Coffee Syrups',
    description:
      'Small-batch pumpkin and banana breads with handcrafted coffee syrups, made from scratch with love.',
    images: ['/og-social-v2.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
