import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '12Tries',
  description: "Guess today's word using semantic similarity!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
