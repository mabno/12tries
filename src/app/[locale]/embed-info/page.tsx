import EmbedInfoClient from './EmbedInfoClient'

export default function EmbedInfoPage({ params }: { params: { locale: string } }) {
  return <EmbedInfoClient locale={params.locale} />
}
