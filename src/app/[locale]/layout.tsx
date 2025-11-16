import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Providers } from '@/components/Providers'
import '../globals.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '12Tries - Daily Word Challenge Game | Guess the Word with AI',
  description:
    'Test your vocabulary with daily word challenges! Use AI-powered semantic similarity to guess words in 12 tries. Play daily word puzzles, compete on the leaderboard, and challenge your friends in this free online word game.',
  keywords: [
    'word game',
    'daily word challenge',
    'guess the word',
    'vocabulary game',
    'semantic similarity',
    'AI word game',
    'word puzzle',
    'daily puzzle',
    'word guessing game',
    '12tries',
    'online word game',
    'free word game',
  ],
  authors: [{ name: '12Tries' }],
  creator: '12Tries',
  publisher: '12Tries',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://12tries.com'),
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      es: '/es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: '12Tries - Daily Word Challenge Game',
    description:
      'Test your vocabulary with daily word challenges! Use AI-powered semantic similarity to guess words in 12 tries. Play now and compete with friends!',
    siteName: '12Tries',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: '12Tries - Daily Word Challenge Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '12Tries - Daily Word Challenge Game',
    description: 'Test your vocabulary with daily word challenges! Use AI-powered semantic similarity to guess words in 12 tries.',
    images: ['/logo.svg'],
    creator: '@12tries',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            {/* Footer */}
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
