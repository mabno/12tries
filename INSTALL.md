# ⚡ Instalación Rápida

## Pasos Inmediatos (Copiar y Pegar)

### 1️⃣ Instalar Dependencias

```bash
cd c:/Users/maria/Desktop/guess-the-word
npm install
```

Esto instalará todas las dependencias necesarias (~5 minutos).

### 2️⃣ Configurar Variables de Entorno

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Windows (CMD)
copy .env.example .env

# En Git Bash/WSL
cp .env.example .env
```

**Luego edita `.env` con tus credenciales:**

```env
# Base de datos (dejar como está para desarrollo local)
DATABASE_URL="postgresql://guessword:password123@localhost:5432/guessword?schema=public"

# NextAuth (generar secreto nuevo)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cambia-esto-por-algo-aleatorio-de-32-caracteres"

# Google OAuth (obtener en Google Cloud Console)
GOOGLE_CLIENT_ID="tu-client-id-aqui"
GOOGLE_CLIENT_SECRET="tu-client-secret-aqui"

# OpenAI (obtener en platform.openai.com)
OPENAI_API_KEY="sk-tu-api-key-aqui"
```

### 3️⃣ Iniciar PostgreSQL

```bash
docker-compose up -d postgres
```

**Espera 10-15 segundos** para que PostgreSQL se inicialice.

Verifica que esté corriendo:

```bash
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE                    STATUS
abc123         pgvector/pgvector:pg16   Up 10 seconds
```

### 4️⃣ Configurar Base de Datos

```bash
npm run db:generate
npm run db:push
```

### 5️⃣ Poblar Datos Iniciales

```bash
npm run db:seed
```

⚠️ **IMPORTANTE**: Este paso requiere que tu `OPENAI_API_KEY` esté configurada correctamente.

### 6️⃣ Iniciar Aplicación

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

---

## 🚨 Si Encuentras Errores

### Error: "Cannot find module"

**Solución**: Las dependencias no se instalaron correctamente.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot connect to database"

**Solución**: PostgreSQL no está corriendo.

```bash
docker-compose up -d postgres
docker-compose logs postgres
```

### Error: "OpenAI API error" durante el seed

**Solución**:

1. Verifica que `OPENAI_API_KEY` esté en `.env`
2. Verifica que tenga créditos en tu cuenta OpenAI
3. Intenta de nuevo:

```bash
npm run db:seed
```

### Error: "Google OAuth failed"

**Solución**: Las credenciales no están configuradas.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copia Client ID y Secret a `.env`

---

## 📋 Checklist Rápido

Antes de ejecutar `npm run dev`, asegúrate de:

- [ ] `npm install` completado sin errores
- [ ] `.env` creado y editado con tus credenciales
- [ ] Docker está corriendo
- [ ] PostgreSQL iniciado (`docker-compose up -d postgres`)
- [ ] Base de datos configurada (`npm run db:push`)
- [ ] Datos poblados (`npm run db:seed`)

---

## 🎯 Comandos Más Usados

```bash
# Ver base de datos en GUI
npm run db:studio

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs de Docker
docker-compose logs -f postgres

# Detener todo
docker-compose down

# Limpiar todo y empezar de nuevo
docker-compose down -v
npm run db:push
npm run db:seed
```

---

## 🆘 ¿Necesitas las Credenciales?

### OpenAI API Key

1. Ve a https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Nómbrala "guess-the-word"
4. Copia la clave (solo se muestra una vez)
5. Pégala en `.env` como `OPENAI_API_KEY`

**Nota**: Necesitarás créditos ($5 mínimo recomendado). El seed cuesta ~$0.05.

### Google OAuth

1. Ve a https://console.cloud.google.com/
2. Crea un proyecto: "Guess the Word"
3. Ve a "APIs & Services" → "Library"
4. Busca y habilita "Google+ API"
5. Ve a "Credentials" → "Create Credentials" → "OAuth client ID"
6. Configura la pantalla de consentimiento (User Type: External)
7. Vuelve a crear OAuth client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copia Client ID y Client Secret a `.env`
9. Agrega tu email como "Test user" en OAuth consent screen

### NextAuth Secret

```bash
# En Git Bash, WSL, o Linux
openssl rand -base64 32

# O usa este generador online
# https://generate-secret.vercel.app/32
```

---

## ✅ Todo Listo

Si completaste todos los pasos, deberías ver:

1. Terminal mostrando: "Ready on http://localhost:3000"
2. Navegador abriendo la aplicación
3. Página de login con botón "Sign in with Google"
4. Después de login: juego funcionando

**¡Felicidades! 🎉**

---

## 📞 Ayuda Adicional

- **Documentación completa**: Ver `README.md`
- **Guía de inicio**: Ver `QUICKSTART.md`
- **Ejemplos de API**: Ver `API-EXAMPLES.md`
- **Despliegue**: Ver `DEPLOYMENT.md`
- **Resumen del proyecto**: Ver `PROJECT-SUMMARY.md`
