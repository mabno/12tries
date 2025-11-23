import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
})

export default function middleware(request: NextRequest) {
  // Skip i18n middleware for embed route
  if (request.nextUrl.pathname.startsWith('/embed')) {
    return
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
