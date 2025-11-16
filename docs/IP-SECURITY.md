# Sistema de Seguridad contra Abuso de API

## Descripción

Este sistema protege la aplicación contra el abuso de la API de OpenAI al limitar el número de intentos de adivinanza por dirección IP.

## Características

### 1. Límite de Intentos por IP

- **Límite**: 200 intentos por dirección IP en 24 horas
- **Acción**: Cuando se alcanza el límite, la IP es baneada automáticamente
- **Duración del baneo**: 24 horas

### 2. Seguimiento de IPs

- Todas las adivinanzas se registran con la dirección IP del cliente
- El sistema detecta IPs reales incluso detrás de proxies/load balancers
- Soporta headers: `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip` (Cloudflare)

### 3. Base de Datos

Se agregaron dos nuevos campos/modelos:

#### Tabla `attempts`

- Nuevo campo: `ipAddress` - Registra la IP de cada intento
- Índice: `[ipAddress, attemptedAt]` - Para búsquedas rápidas

#### Tabla `banned_ips`

- `ipAddress` - IP baneada (único)
- `reason` - Razón del baneo
- `bannedAt` - Timestamp del baneo
- `expiresAt` - Cuándo expira el baneo

## Flujo de Seguridad

```
1. Usuario hace un intento de adivinanza
   ↓
2. Sistema obtiene la IP del request
   ↓
3. Verifica si la IP está baneada
   ↓
4. Cuenta intentos de la IP en últimas 24h
   ↓
5a. Si >= 200 intentos → Banear IP y rechazar request
5b. Si < 200 intentos → Permitir request y registrar IP
```

## Uso

### Verificación Automática

El sistema se ejecuta automáticamente en cada request a `/api/guess`:

```typescript
// En route.ts
const clientIp = getClientIp(request)
const securityCheck = await checkIpSecurity(clientIp)

if (!securityCheck.allowed) {
  return NextResponse.json({ error: securityCheck.reason, banned: true }, { status: 429 })
}
```

### Limpieza de Baneos Expirados

Endpoint para limpiar baneos que ya expiraron:

```bash
# Con API key de autenticación
curl -X POST http://localhost:3000/api/admin/cleanup-bans \
  -H "x-api-key: your-admin-api-key"

# Respuesta
{
  "success": true,
  "message": "Cleaned up 5 expired ban(s)",
  "deletedCount": 5
}
```

### Configuración de Cron Job (Producción)

Puedes configurar un cron job para limpiar automáticamente:

```bash
# Cada 6 horas
0 */6 * * * curl -X POST https://tu-dominio.com/api/admin/cleanup-bans -H "x-api-key: $ADMIN_API_KEY"
```

O usar servicios como:

- **Vercel Cron Jobs** (si está desplegado en Vercel)
- **EasyCron**
- **cron-job.org**

## Variables de Entorno

Agrega a tu archivo `.env`:

```env
# Admin API Key (para endpoints administrativos)
ADMIN_API_KEY="tu-clave-secreta-aqui"
```

## Constantes Configurables

En `/src/lib/ip-security.ts`:

```typescript
const MAX_DAILY_ATTEMPTS = 200 // Máximo de intentos por IP en 24h
const BAN_DURATION_HOURS = 24 // Duración del baneo en horas
```

## Funciones Disponibles

### `getClientIp(request: NextRequest): string`

Obtiene la IP real del cliente, incluso detrás de proxies.

### `isIpBanned(ipAddress: string): Promise<boolean>`

Verifica si una IP está baneada actualmente.

### `getIpAttemptCount(ipAddress: string): Promise<number>`

Cuenta los intentos de una IP en las últimas 24 horas.

### `banIp(ipAddress: string, reason?: string): Promise<void>`

Banea una IP por 24 horas.

### `checkIpSecurity(ipAddress: string): Promise<{allowed: boolean, reason?: string}>`

Verificación completa de seguridad. Usa esta función antes de procesar requests.

### `cleanupExpiredBans(): Promise<number>`

Limpia baneos expirados de la base de datos.

## Respuestas de Error

Cuando una IP es baneada, el API responde con:

```json
{
  "error": "Too many attempts. Your IP has been temporarily banned.",
  "banned": true
}
```

HTTP Status: `429 Too Many Requests`

## Logs

El sistema registra eventos de seguridad:

```
[SECURITY] IP 192.168.1.1 has made 195 attempts in the last 24 hours
[SECURITY] Banned IP: 192.168.1.1 until 2024-11-17T10:30:00.000Z
[SECURITY] Blocked request from IP: 192.168.1.1 - IP address is temporarily banned
[SECURITY] Cleaned up 3 expired IP bans
```

## Consideraciones

### Desarrollo Local

En desarrollo (localhost), todas las requests aparecen como `127.0.0.1`. Para probar el sistema:

1. Usa herramientas como ngrok para exponer tu servidor
2. O simula headers: `x-forwarded-for: 1.2.3.4`

### Producción

- Asegúrate de que tu proxy/load balancer esté configurado para pasar el header `x-forwarded-for`
- En Cloudflare, el sistema usará automáticamente `cf-connecting-ip`
- Protege el endpoint `/api/admin/cleanup-bans` con un API key fuerte

### Rate Limiting Adicional

Este sistema protege contra abuso masivo (200+ intentos/día). Para protección adicional:

- Considera usar middleware de rate limiting (ej: `express-rate-limit`)
- Implementa CAPTCHA para usuarios sospechosos
- Usa servicios como Cloudflare Rate Limiting

## Mantenimiento

### Ver IPs Baneadas

```sql
SELECT * FROM banned_ips WHERE "expiresAt" > NOW();
```

### Desbanear IP Manualmente

```sql
DELETE FROM banned_ips WHERE "ipAddress" = '1.2.3.4';
```

### Ver Estadísticas de Intentos por IP

```sql
SELECT
  "ipAddress",
  COUNT(*) as attempts,
  MAX("attemptedAt") as last_attempt
FROM attempts
WHERE "attemptedAt" > NOW() - INTERVAL '24 hours'
GROUP BY "ipAddress"
ORDER BY attempts DESC
LIMIT 20;
```

## Mejoras Futuras

- [ ] Dashboard de administración para ver/gestionar IPs baneadas
- [ ] Whitelist de IPs confiables
- [ ] Diferentes niveles de rate limiting por tipo de usuario
- [ ] Notificaciones cuando se detecta abuso
- [ ] Análisis de patrones de abuso
