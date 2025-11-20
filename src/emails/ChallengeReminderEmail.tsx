import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'

interface ChallengeReminderEmailProps {
  unsubscribeToken: string
  locale: 'en' | 'es'
}

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export default function ChallengeReminderEmail({ unsubscribeToken, locale = 'en' }: ChallengeReminderEmailProps) {
  const isSpanish = locale === 'es'

  const content = {
    preview: isSpanish ? '¡Nuevo desafío disponible en 12Tries!' : 'New challenge available on 12Tries!',
    title: isSpanish ? '🎉 ¡Nuevo Desafío Disponible!' : '🎉 New Challenge Available!',
    greeting: isSpanish ? '¡Hola!' : 'Hello!',
    message: isSpanish
      ? 'Un nuevo desafío de palabra está listo para ti en 12Tries. ¿Podrás adivinarlo en 12 intentos?'
      : 'A new word challenge is ready for you on 12Tries. Can you guess it in 12 tries?',
    playButton: isSpanish ? 'Jugar Ahora' : 'Play Now',
    footer: isSpanish
      ? 'Recibiste este correo porque te suscribiste a los recordatorios de 12Tries.'
      : 'You received this email because you subscribed to 12Tries reminders.',
    unsubscribe: isSpanish ? 'Cancelar suscripción' : 'Unsubscribe',
  }

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>{content.title}</Heading>
          </Section>

          <Section style={content_section}>
            <Text style={text}>{content.greeting}</Text>
            <Text style={text}>{content.message}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${baseUrl}/${locale}`}>
              {content.playButton}
            </Button>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>{content.footer}</Text>
            <Button style={unsubscribeButton} href={`${baseUrl}/api/reminders/unsubscribe?token=${unsubscribeToken}&locale=${locale}`}>
              {content.unsubscribe}
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const header = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px 8px 0 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const content_section = {
  padding: '24px 40px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const buttonContainer = {
  padding: '0 40px 32px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  border: 'none',
  cursor: 'pointer',
}

const footer = {
  padding: '24px 40px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
}

const unsubscribeButton = {
  color: '#6b7280',
  fontSize: '12px',
  textDecoration: 'underline',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
}
