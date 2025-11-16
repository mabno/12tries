# Ejemplos de Uso de la API

## Endpoints Disponibles

### 1. Obtener Desafío del Día

**GET** `/api/challenge?locale=en`

**Respuesta:**

```json
{
  "challengeId": "clx123...",
  "wordLength": 8,
  "attemptsUsed": 3,
  "attemptsRemaining": 7,
  "solved": false,
  "attempts": [
    {
      "guess": "computer",
      "similarity": 0.65,
      "attemptedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "bestSimilarity": 0.65
}
```

### 2. Enviar Intento

**POST** `/api/guess`

**Body:**

```json
{
  "guess": "technology",
  "locale": "en"
}
```

**Respuesta:**

```json
{
  "correct": false,
  "similarity": 0.78,
  "attemptsRemaining": 6
}
```

**Respuesta (correcto):**

```json
{
  "correct": true,
  "similarity": 1.0,
  "attemptsRemaining": 6,
  "word": "innovation"
}
```

### 3. Tabla de Clasificación

**GET** `/api/leaderboard`

**Respuesta:**

```json
[
  {
    "rank": 1,
    "name": "Alice Smith",
    "image": "https://...",
    "attempts": 3,
    "solvedAt": "2024-01-15T09:15:00Z",
    "score": 87
  },
  {
    "rank": 2,
    "name": "Bob Johnson",
    "image": "https://...",
    "attempts": 5,
    "solvedAt": "2024-01-15T10:30:00Z",
    "score": 68
  }
]
```

## Usar la API con cURL

### Obtener Desafío

```bash
curl -X GET http://localhost:3000/api/challenge?locale=en \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Enviar Intento

```bash
curl -X POST http://localhost:3000/api/guess \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"guess": "technology", "locale": "en"}'
```

### Ver Tabla de Clasificación

```bash
curl -X GET http://localhost:3000/api/leaderboard
```

## Usar la API con JavaScript/TypeScript

### En el Frontend (React)

```typescript
// Obtener desafío
const getChallenge = async (locale: string) => {
  const response = await fetch(`/api/challenge?locale=${locale}`)
  return response.json()
}

// Enviar intento
const submitGuess = async (guess: string, locale: string) => {
  const response = await fetch('/api/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess, locale }),
  })
  return response.json()
}

// Obtener leaderboard
const getLeaderboard = async () => {
  const response = await fetch('/api/leaderboard')
  return response.json()
}
```

### Desde Node.js

```javascript
const fetch = require('node-fetch')

async function playGame() {
  // Necesitas autenticarte primero y obtener el cookie de sesión
  const sessionCookie = 'next-auth.session-token=...'

  // Obtener desafío
  const challenge = await fetch('http://localhost:3000/api/challenge?locale=en', {
    headers: {
      Cookie: sessionCookie,
    },
  }).then((r) => r.json())

  console.log('Challenge:', challenge)

  // Enviar intento
  const result = await fetch('http://localhost:3000/api/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      guess: 'technology',
      locale: 'en',
    }),
  }).then((r) => r.json())

  console.log('Result:', result)
}
```

## Códigos de Error

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

**Causa**: No estás autenticado. Debes iniciar sesión primero.

### 400 Bad Request

```json
{
  "error": "Invalid guess"
}
```

**Causa**: El intento está vacío o no es una cadena válida.

```json
{
  "error": "No attempts remaining"
}
```

**Causa**: Ya usaste tus 10 intentos para hoy.

```json
{
  "error": "Challenge already solved"
}
```

**Causa**: Ya resolviste el desafío de hoy.

### 404 Not Found

```json
{
  "error": "No challenge found"
}
```

**Causa**: No hay desafío para el día actual (ejecuta el seed).

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

**Causa**: Error en el servidor. Revisa los logs.

## Rate Limiting (Recomendado para Producción)

Para proteger la API, considera implementar rate limiting:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

Usar en las rutas:

```typescript
const allowed = await checkRateLimit(session.user.id)
if (!allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```
