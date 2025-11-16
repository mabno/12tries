import { auth } from '@/lib/auth'
import HomeClient from '@/app/[locale]/HomeClient'

export default async function HomePage({ params }: { params: { locale: string } }) {
  const session = await auth()

  return <HomeClient locale={params.locale} />
}
