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
  title: 'Guess the Word - Daily Word Challenge',
  description: 'Test your vocabulary with daily word challenges using AI-powered semantic similarity',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
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
