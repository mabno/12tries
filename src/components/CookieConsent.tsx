'use client'

import { useTranslations } from 'next-intl'
import CookieBanner from 'react-cookie-consent'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default function CookieConsent() {
  const t = useTranslations('cookies')

  const handleAccept = () => {
    // Activar Google Analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
  }

  const handleDecline = () => {
    // Desactivar Google Analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
      })
    }
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[100] pointer-events-none'>
      <div className='container mx-auto px-4 pb-4 pointer-events-auto'>
        <CookieBanner
          location='none'
          buttonText={t('accept')}
          declineButtonText={t('decline')}
          enableDeclineButton
          onAccept={handleAccept}
          onDecline={handleDecline}
          cookieName='12tries-cookie-consent'
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            boxShadow: '0 -4px 30px rgba(168, 85, 247, 0.15), 0 0 0 1px rgba(168, 85, 247, 0.1)',
            border: '2px solid rgba(168, 85, 247, 0.2)',
            position: 'relative',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            left: '0',
            right: '0',
            bottom: '0',
          }}
          buttonStyle={{
            background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
            color: 'white',
            fontSize: '0.875rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
            margin: '0.5rem 0.25rem',
          }}
          declineButtonStyle={{
            background: 'transparent',
            color: '#6b7280',
            fontSize: '0.875rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            border: '2px solid rgba(107, 114, 128, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            margin: '0.5rem 0.25rem',
          }}
          contentStyle={{
            flex: '1 1 auto',
            margin: '0',
            marginBottom: '0.5rem',
          }}
          buttonWrapperClasses='flex gap-2 justify-center flex-wrap'
        >
          <div className='text-center'>
            <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>🍪 {t('message')}</p>
          </div>
        </CookieBanner>
      </div>
    </div>
  )
}
