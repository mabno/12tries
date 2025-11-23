# 🎯 Guess the Word

Una aplicación web interactiva donde los usuarios adivinan la "palabra del día" usando similitud semántica impulsada por IA. El juego utiliza embeddings de OpenAI y búsqueda vectorial de pgvector para proporcionar retroalimentación "frío o caliente" sobre qué tan cerca está cada intento de la palabra objetivo.

## ✨ Características

- 🌍 **Soporte Multi-idioma**: Juega en inglés o español con traducciones correctas
- 🔥 **Retroalimentación en Tiempo Real**: Sistema "frío o caliente" basado en similitud semántica
- 🎮 **10 Intentos Diarios**: Cada usuario tiene 10 oportunidades para adivinar la palabra del día
- 🔐 **Autenticación con Google**: Sign-in seguro usando NextAuth
- 📊 **Tabla de Clasificación**: Compite con otros jugadores
- 🎨 **UI Moderna**: Interfaz colorida y profesional con shadcn/ui y Tailwind CSS
- 🤖 **Impulsado por IA**: Utiliza embeddings de OpenAI para similitud semántica
- 📱 **Diseño Responsive**: Funciona perfectamente en desktop y mobile

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - Componentes UI
- **Framer Motion** - Animaciones
- **next-intl** - Internacionalización

### Backend

- **Next.js API Routes**
- **NextAuth.js** - Autenticación
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **pgvector** - Búsqueda de similitud vectorial

### IA & ML

- **OpenAI API** - Generación de embeddings (text-embedding-3-small)

### DevOps

- **Docker & Docker Compose**
- **Prisma Migrations**

## 📋 Prerrequisitos

- Node.js 20+
- Docker & Docker Compose
- Cuenta de Google Cloud (para OAuth)
- OpenAI API Key

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd guess-the-word
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Database
DATABASE_URL="postgresql://guessword:password123@localhost:5432/guessword?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aqui-cambiar-en-produccion"

# Google OAuth - Obtén estas credenciales en Google Cloud Console
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# OpenAI API - Obtén tu clave en https://platform.openai.com/api-keys
OPENAI_API_KEY="tu-openai-api-key"
```

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth 2.0"
5. Agrega estas URIs autorizadas:
   - **Orígenes autorizados**: `http://localhost:3000`
   - **URIs de redireccionamiento**: `http://localhost:3000/api/auth/callback/google`
6. Copia el Client ID y Client Secret a tu archivo `.env`

### 5. Iniciar Servicios con Docker

```bash
# Iniciar PostgreSQL con pgvector
docker-compose up -d postgres
```

Espera unos segundos para que PostgreSQL se inicialice completamente.

### 6. Ejecutar Migraciones de Prisma

```bash
# Generar el cliente de Prisma
npm run db:generate

# Aplicar migraciones
npm run db:push
```

### 7. Poblar la Base de Datos (Seed)

```bash
npm run db:seed
```

Este comando:

- Crea palabras iniciales en inglés y español
- Genera embeddings para cada palabra usando OpenAI
- Crea el desafío del día

### 8. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🐳 Uso con Docker Compose (Producción)

Para ejecutar toda la aplicación en contenedores:

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📁 Estructura del Proyecto

```
guess-the-word/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos con soporte pgvector
│   └── seed.ts                # Script de población de datos
├── src/
│   ├── app/
│   │   ├── [locale]/          # Rutas internacionalizadas
│   │   │   ├── layout.tsx     # Layout principal
│   │   │   ├── page.tsx       # Página principal del juego
│   │   │   └── auth/
│   │   │       └── signin/    # Página de login
│   │   ├── api/               # API Routes
│   │   │   ├── challenge/     # Obtener desafío del día
│   │   │   ├── guess/         # Enviar intento
│   │   │   ├── leaderboard/   # Tabla de clasificación
│   │   │   └── auth/          # NextAuth endpoints
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── ui/                # Componentes de shadcn/ui
│   │   ├── Game.tsx           # Componente principal del juego
│   │   ├── AuthButton.tsx     # Botón de autenticación
│   │   └── LanguageSwitcher.tsx # Selector de idioma
│   ├── lib/
│   │   ├── auth.ts            # Configuración de NextAuth
│   │   ├── prisma.ts          # Cliente de Prisma
│   │   ├── embeddings.ts      # Funciones de OpenAI embeddings
│   │   └── utils.ts           # Utilidades generales
│   ├── i18n.ts                # Configuración de i18n
│   └── middleware.ts          # Middleware de Next.js
├── messages/
│   ├── en.json                # Traducciones en inglés
│   └── es.json                # Traducciones en español
├── docker-compose.yml         # Configuración de Docker
├── Dockerfile                 # Imagen de Docker
├── init.sql                   # Script de inicialización de PostgreSQL
├── next.config.js             # Configuración de Next.js
├── tailwind.config.ts         # Configuración de Tailwind
└── package.json               # Dependencias
```

## 🎮 Cómo Jugar

1. **Inicia Sesión**: Autentícate con tu cuenta de Google
2. **Lee el Desafío**: Se te presenta la palabra del día (oculta)
3. **Adivina**: Escribe una palabra que creas que es similar
4. **Recibe Retroalimentación**:
   - 🔥 On fire! (90%+) - ¡Muy cerca!
   - 🌶️ Very hot! (80-90%) - Caliente
   - ☀️ Hot (70-80%) - Tibio
   - 🌤️ Warm (50-70%) - Templado
   - ❄️ Cold (30-50%) - Frío
   - 🧊 Freezing (<30%) - Muy frío
5. **Refina tu Búsqueda**: Usa la similitud semántica para acercarte
6. **Gana**: ¡Adivina la palabra exacta!

## 📦 Versión Embebible (iframe)

El juego incluye una **versión simplificada** que puede ser embebida en otras páginas web usando iframes:

- ✅ Funcionalidad completa del juego
- ✅ Leaderboard de top 5 jugadores
- ✅ Soporte multiidioma (inglés y español)
- ✅ Sin necesidad de autenticación
- ✅ UI optimizada para embeds
- ✅ Responsive y ligera

### Cómo Usar

```html
<!-- English -->
<iframe src="https://tu-dominio.com/embed?lang=en" width="100%" height="800" frameborder="0" title="Guess the Word Game"></iframe>

<!-- Spanish -->
<iframe src="https://tu-dominio.com/embed?lang=es" width="100%" height="800" frameborder="0" title="Guess the Word Game"></iframe>
```

**Documentación completa**: [`docs/EMBED.md`](docs/EMBED.md)

**Ver info y preview**: Navega a `/[locale]/embed-info` en la aplicación

## 🔧 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm start            # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run db:generate  # Generar cliente de Prisma
npm run db:push      # Aplicar cambios de schema sin migración
npm run db:migrate   # Crear y aplicar migración
npm run db:studio    # Abrir Prisma Studio (GUI)
npm run db:seed      # Poblar base de datos
```

## 🗄️ Esquema de Base de Datos

### Modelos Principales

- **User**: Usuarios autenticados
- **Word**: Palabras con embeddings vectoriales
- **DailyChallenge**: Palabra del día
- **DailyProgress**: Progreso de usuario por desafío
- **Attempt**: Cada intento de adivinanza

### Características de pgvector

El campo `embedding` en la tabla `words` utiliza el tipo `vector(1536)` de pgvector para almacenar embeddings de OpenAI. Esto permite:

- Búsqueda de similitud eficiente usando distancia coseno
- Consultas vectoriales escalables
- Cálculo rápido de similitud semántica

Ejemplo de consulta:

```sql
SELECT 1 - (embedding <=> '[...]'::vector) as similarity
FROM words
WHERE id = 'word-id';
```

## 🌐 Internacionalización

La aplicación soporta inglés y español:

- Las rutas usan prefijos de locale: `/en/` y `/es/`
- Todas las palabras tienen traducciones en ambos idiomas
- La UI se adapta automáticamente al idioma seleccionado
- Los embeddings se calculan en inglés para consistencia

## 🔐 Seguridad

- Autenticación OAuth 2.0 con Google
- Sesiones seguras con NextAuth
- Variables de entorno para credenciales sensibles
- Validación de inputs en el servidor
- Rate limiting en endpoints críticos (recomendado para producción)

## 🚀 Despliegue en Producción

### Vercel (Recomendado para Next.js)

1. Push tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Usa un servicio de PostgreSQL gestionado (Supabase, Railway, Neon)
5. Configura la URL de producción en Google OAuth

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

### Variables de Entorno para Producción

Asegúrate de configurar:

- `DATABASE_URL` - URL de PostgreSQL con pgvector
- `NEXTAUTH_URL` - URL de tu aplicación
- `NEXTAUTH_SECRET` - Genera uno nuevo: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm test

# Tests con cobertura
npm run test:coverage
```

## 📊 Monitoreo y Mantenimiento

### Prisma Studio

Para visualizar y editar datos:

```bash
npm run db:studio
```

### Logs de Docker

```bash
docker-compose logs -f postgres
docker-compose logs -f app
```

### Agregar Nuevas Palabras

```typescript
// Ejemplo en un script o API endpoint
const newWord = await prisma.word.create({
  data: {
    textEn: 'example',
    textEs: 'ejemplo',
    difficulty: 2,
  },
})

// Generar y guardar embedding
const embedding = await generateEmbedding(newWord.textEn)
await prisma.$executeRaw`
  UPDATE words 
  SET embedding = ${vectorToString(embedding)}::vector(1536)
  WHERE id = ${newWord.id}
`
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Sistema de rankings global
- [ ] Achievements y badges
- [ ] Modo multijugador
- [ ] Estadísticas de usuario
- [ ] Compartir resultados en redes sociales
- [ ] PWA para instalación en móviles
- [ ] Tests unitarios e integración
- [ ] Admin panel para gestionar palabras
- [ ] Análisis de patrones de usuarios

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

- Verifica que PostgreSQL esté corriendo: `docker ps`
- Revisa la URL de conexión en `.env`
- Intenta reiniciar el contenedor: `docker-compose restart postgres`

### Error: "OpenAI API Error"

- Verifica tu API key en `.env`
- Revisa tu balance en OpenAI
- Asegúrate de tener acceso a `text-embedding-3-small`

### Error: "Google OAuth Failed"

- Verifica las credenciales en `.env`
- Confirma las URIs de redirect en Google Console
- Asegúrate de que la API de Google+ esté habilitada

## 📄 Licencia

MIT License - siéntete libre de usar este proyecto para aprender o construir tu propia versión.

## 👨‍💻 Autor

Creado con ❤️ usando Next.js, Prisma, y OpenAI.

## 🙏 Agradecimientos

- OpenAI por los embeddings
- Vercel por Next.js
- pgvector por la búsqueda vectorial
- shadcn/ui por los componentes

---

¿Preguntas o problemas? Abre un issue en GitHub.

**¡Disfruta adivinando palabras! 🎯**
