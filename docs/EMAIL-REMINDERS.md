# Email Reminders Feature

## Descripción

Esta feature permite a los usuarios (tanto anónimos como autenticados) suscribirse a recordatorios por correo electrónico que les notifican cuando un nuevo desafío está disponible.

## Componentes Principales

### Frontend

1. **ReminderDialog** (`src/components/ReminderDialog.tsx`)

   - Dialog que se muestra cuando el usuario quiere suscribirse
   - Muestra campos diferentes para usuarios anónimos vs autenticados
   - Incluye checkbox para aceptar términos y condiciones
   - Valida el email y maneja el envío

2. **WinState** (`src/components/game/WinState.tsx`)

   - Actualizado para mostrar botón de recordatorio
   - Solo muestra el botón si el usuario no está ya suscrito
   - Verifica estado de suscripción al cargar

3. **Páginas de Legal**
   - `/[locale]/terms` - Términos y Condiciones
   - `/[locale]/privacy` - Política de Privacidad
   - `/[locale]/unsubscribed` - Confirmación de cancelación

### Backend

#### API Endpoints

1. **POST `/api/reminders/subscribe`**

   - Suscribe a un usuario a los recordatorios
   - Acepta: `{ email: string, locale: string }`
   - Funciona tanto para usuarios autenticados como anónimos

2. **GET `/api/reminders/status`**

   - Verifica si el usuario actual está suscrito
   - Retorna: `{ isSubscribed: boolean }`

3. **GET `/api/reminders/unsubscribe?token=TOKEN`**

   - Cancela la suscripción usando el token único
   - Redirige a página de confirmación

4. **POST `/api/admin/send-reminders`** (Protegido)
   - Envía correos a todos los usuarios suscritos
   - Requiere header: `x-api-key: YOUR_ADMIN_API_KEY`
   - Envía emails en batches para evitar rate limits

### Base de Datos

**Modelo EmailReminder:**

```prisma
model EmailReminder {
  id                String   @id @default(cuid())
  userId            String   @unique
  email             String   @unique
  isSubscribed      Boolean  @default(true)
  unsubscribeToken  String   @unique @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Email Template

**ChallengeReminderEmail** (`src/emails/ChallengeReminderEmail.tsx`)

- Template profesional usando React Email
- Soporta inglés y español
- Incluye botón de unsubscribe
- Diseño responsive y atractivo

## Configuración

### 1. Variables de Entorno

Agregar a `.env`:

```env
RESEND_API_KEY="your-resend-api-key-here"
ADMIN_API_KEY="your-admin-api-key-here"
```

### 2. Instalar Dependencias

```bash
npm install resend @react-email/components
```

### 3. Migrar Base de Datos

```bash
npx prisma generate
npx prisma db push
# o
npx prisma migrate dev --name add-email-reminders
```

## Uso

### Para Usuarios

1. Completa el desafío y gana
2. Aparece botón: "¿Quieres que te recordemos cuando el próximo desafío esté disponible?"
3. Click abre dialog con formulario
4. Ingresa email (si es anónimo) o confirma email (si está autenticado)
5. Acepta términos y condiciones
6. Click en "Suscribirse"

### Para Administradores

Enviar recordatorios cuando un nuevo challenge está disponible:

```bash
curl -X POST http://localhost:3000/api/admin/send-reminders \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

O programar un cron job que ejecute esto diariamente cuando se crea un nuevo challenge.

## Flujo de Usuario

### Usuario Anónimo

1. Gana el juego
2. Ve botón de recordatorio (si no está suscrito)
3. Click abre dialog
4. Ingresa su email
5. Acepta T&C
6. Se crea registro en `EmailReminder` vinculado a su userId

### Usuario Autenticado

1. Gana el juego
2. Ve botón de recordatorio (si no está suscrito)
3. Click abre dialog
4. Email ya está pre-llenado (read-only)
5. Acepta T&C
6. Se crea registro en `EmailReminder` vinculado a su userId

### Cancelar Suscripción

1. Usuario recibe email
2. Click en "Unsubscribe" al final del email
3. Redirige a `/api/reminders/unsubscribe?token=XXX`
4. Se actualiza `isSubscribed = false`
5. Redirige a página de confirmación

## Seguridad

- ✅ Validación de email en frontend y backend
- ✅ Token único para unsubscribe (no reutilizable)
- ✅ API Key requerida para endpoint admin
- ✅ Rate limiting en envío de emails (batches)
- ✅ Enlaces a términos y privacidad
- ✅ Checkbox de consentimiento obligatorio
- ✅ OnDelete Cascade en relación User -> EmailReminder

## Personalización

### Cambiar "from" del email

En `src/app/api/admin/send-reminders/route.ts`:

```typescript
from: '12Tries <reminders@12tries.com>'
```

### Cambiar diseño del email

Editar `src/emails/ChallengeReminderEmail.tsx`

### Cambiar textos

Editar `messages/en.json` y `messages/es.json` en la sección `reminders`

## Testing

1. **Suscribirse**: Ganar juego y subscribirse con email de prueba
2. **Verificar status**: Refrescar página, botón no debe aparecer
3. **Enviar emails**: Ejecutar endpoint admin
4. **Unsubscribe**: Click en link del email recibido
5. **Re-suscribirse**: Botón debe aparecer de nuevo después de unsubscribe

## Notas

- Los emails se envían en batches de 10 para evitar rate limits
- El locale del email se determina automáticamente (puede mejorarse guardándolo en la DB)
- Los usuarios pueden re-suscribirse después de cancelar
- El mismo email puede usarse una sola vez (unique constraint)
