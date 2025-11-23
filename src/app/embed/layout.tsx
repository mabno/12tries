import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Guess the Word - Embed',
  description: 'Embeddable word guessing game',
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  // Note: locale will be determined dynamically in EmbedClient from query params
  return (
    <html suppressHydrationWarning>
      <body className='antialiased'>{children}</body>
    </html>
  )
}
