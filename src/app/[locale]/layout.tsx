import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Providers } from '@/components/Providers'
import '../globals.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
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
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: '/',
      title: t('ogTitle'),
      description: t('ogDescription'),
      siteName: '12Tries',
      images: [
        {
          url: '/logo.svg',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
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
}

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
        {/* Google tag (gtag.js) */}
        <script async src='https://www.googletagmanager.com/gtag/js?id=G-XX3NP0W4F2'></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XX3NP0W4F2');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            {/* Footer */}
            <Footer />
            <CookieConsent />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
