# 🚀 Quick Start Guide - Guess the Word

## Inicio Rápido en 5 Minutos

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` y agrega al menos:

```env
OPENAI_API_KEY="sk-..." # Obtén en https://platform.openai.com/api-keys
GOOGLE_CLIENT_ID="..."   # Configura en Google Cloud Console
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"  # Genera uno aleatorio
```

### 3. Iniciar PostgreSQL con Docker

```bash
docker-compose up -d postgres
```

Espera 10 segundos para que PostgreSQL se inicialice.

### 4. Configurar la Base de Datos

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar la Aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Configuración de Google OAuth (Detallado)

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a https://console.cloud.google.com/
2. Clic en "Select a project" → "New Project"
3. Nombre: "Guess the Word"
4. Clic en "Create"

### Paso 2: Habilitar APIs

1. En el menú lateral: "APIs & Services" → "Library"
2. Busca "Google+ API"
3. Clic en "Enable"

### Paso 3: Crear Credenciales OAuth

1. En el menú lateral: "APIs & Services" → "Credentials"
2. Clic en "Create Credentials" → "OAuth client ID"
3. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: External
   - App name: Guess the Word
   - User support email: tu email
   - Developer contact: tu email
   - Guardar y continuar (puedes omitir scopes)
4. Vuelve a "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Name: "Guess the Word Web Client"
7. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
8. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
9. Clic en "Create"
10. Copia el Client ID y Client Secret a tu `.env`

### Paso 4: Agregar Usuario de Prueba (Modo Development)

1. Ve a "OAuth consent screen"
2. En "Test users", clic en "Add Users"
3. Agrega tu email de Google
4. Ahora puedes iniciar sesión con esa cuenta

## Obtener OpenAI API Key

1. Ve a https://platform.openai.com/
2. Regístrate o inicia sesión
3. Ve a https://platform.openai.com/api-keys
4. Clic en "Create new secret key"
5. Copia la clave (solo se muestra una vez)
6. Pégala en `.env` como `OPENAI_API_KEY`

**Nota**: Necesitarás créditos en tu cuenta de OpenAI. La API de embeddings es muy económica (~$0.0001 por palabra).

## Troubleshooting Común

### "Error: Cannot connect to database"

```bash
# Verifica que PostgreSQL esté corriendo
docker ps

# Si no está corriendo, inícialo
docker-compose up -d postgres

# Verifica los logs
docker-compose logs postgres
```

### "Error: relation 'users' does not exist"

```bash
# Regenera el schema
npm run db:generate
npm run db:push
```

### "OpenAI API Error"

- Verifica que tu API key esté correcta en `.env`
- Asegúrate de tener créditos en tu cuenta OpenAI
- Revisa que puedas usar el modelo `text-embedding-3-small`

### "Google OAuth Failed"

- Verifica que las URIs de redirect estén configuradas correctamente
- Asegúrate de agregar tu email como usuario de prueba
- Verifica que la API de Google+ esté habilitada

## Scripts Útiles

```bash
# Ver la base de datos en una GUI
npm run db:studio

# Ver logs de Docker
docker-compose logs -f

# Reiniciar la base de datos
docker-compose restart postgres

# Detener todos los contenedores
docker-compose down

# Limpiar todo (¡cuidado, elimina datos!)
docker-compose down -v
npm run db:push
npm run db:seed
```

## Próximos Pasos

Una vez que la aplicación esté funcionando:

1. ✅ Inicia sesión con tu cuenta de Google
2. ✅ Intenta adivinar la palabra del día
3. ✅ Cambia el idioma entre inglés y español
4. ✅ Explora la tabla de clasificación
5. ✅ Revisa el código y personaliza la app

## Agregar Más Palabras

Edita `prisma/seed.ts` y agrega más palabras al array `INITIAL_WORDS`:

```typescript
{ textEn: 'innovation', textEs: 'innovación', difficulty: 3 },
{ textEn: 'sustainability', textEs: 'sostenibilidad', difficulty: 4 },
```

Luego ejecuta:

```bash
npm run db:seed
```

## Modo Producción Local

```bash
# Construir la aplicación
npm run build

# Iniciar en modo producción
npm start
```

¡Listo! Ya tienes tu aplicación "Guess the Word" funcionando. 🎉
