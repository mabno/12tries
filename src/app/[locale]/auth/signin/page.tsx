import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import SignInButton from '@/components/SignInButton'
import { useTranslations } from 'next-intl'

export default function SignInPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('auth')

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='text-6xl mb-4'>🎯</div>
          <CardTitle className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            Guess the Word
          </CardTitle>
          <p className='text-muted-foreground mt-2'>{t('pleaseSignIn')}</p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <SignInButton locale={params.locale} />

          <div className='text-center'>
            <Link href={`/${params.locale}`} className='text-sm text-muted-foreground hover:underline'>
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
