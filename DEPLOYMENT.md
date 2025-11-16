# Deployment Guide - Guess the Word

## 🚀 Opciones de Despliegue

### 1. Vercel (Recomendado - Más Fácil)

Vercel es la plataforma de los creadores de Next.js y ofrece la mejor experiencia.

#### Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub, GitLab o Bitbucket
- Base de datos PostgreSQL con soporte pgvector (ver opciones abajo)

#### Paso a Paso

1. **Push tu código a GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Importar en Vercel**

   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio
   - Configura las variables de entorno (ver abajo)
   - Deploy!

3. **Configurar Variables de Entorno en Vercel**

   En Settings → Environment Variables, agrega:

   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   NEXTAUTH_URL=https://tu-app.vercel.app
   NEXTAUTH_SECRET=genera-uno-nuevo-con-openssl-rand-base64-32
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   OPENAI_API_KEY=tu-openai-key
   ```

4. **Actualizar Google OAuth**
   - Ve a Google Cloud Console
   - En Authorized redirect URIs, agrega:
     ```
     https://tu-app.vercel.app/api/auth/callback/google
     ```
   - En Authorized JavaScript origins, agrega:
     ```
     https://tu-app.vercel.app
     ```

#### Opciones de Base de Datos para Vercel

##### Opción A: Supabase (Recomendado)

- Ve a [supabase.com](https://supabase.com)
- Crea un nuevo proyecto
- Habilita pgvector:
  ```sql
  create extension vector;
  ```
- Copia la connection string (modo "Transaction" o "Session")
- Úsala como `DATABASE_URL`

##### Opción B: Neon

- Ve a [neon.tech](https://neon.tech)
- Crea un nuevo proyecto
- El soporte de pgvector está incluido
- Copia la connection string

##### Opción C: Railway

- Ve a [railway.app](https://railway.app)
- Crea un PostgreSQL database
- Instala pgvector (ver sección Railway abajo)

---

### 2. Railway

Railway es excelente para despliegues fullstack.

#### Paso a Paso

1. **Instalar Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login**

   ```bash
   railway login
   ```

3. **Crear Proyecto**

   ```bash
   railway init
   ```

4. **Agregar PostgreSQL**

   - En el dashboard de Railway: "New" → "Database" → "PostgreSQL"
   - Espera a que se provisione

5. **Habilitar pgvector**

   ```bash
   railway run psql $DATABASE_URL -c "CREATE EXTENSION vector;"
   ```

6. **Configurar Variables de Entorno**

   ```bash
   railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
   railway variables set GOOGLE_CLIENT_ID=tu-client-id
   railway variables set GOOGLE_CLIENT_SECRET=tu-client-secret
   railway variables set OPENAI_API_KEY=tu-openai-key
   # DATABASE_URL se configura automáticamente
   ```

7. **Deploy**

   ```bash
   railway up
   ```

8. **Generar Domain**
   - En el dashboard: Settings → Generate Domain
   - Actualiza `NEXTAUTH_URL` y Google OAuth con el nuevo dominio

---

### 3. Digital Ocean App Platform

#### Paso a Paso

1. **Crear Managed PostgreSQL**

   - Ve a Digital Ocean Dashboard
   - Create → Databases → PostgreSQL
   - Selecciona el plan (mínimo $15/mes)
   - Habilita pgvector:
     ```bash
     doctl databases sql your-db-id --file init.sql
     ```
     Donde `init.sql` contiene:
     ```sql
     CREATE EXTENSION vector;
     ```

2. **Crear App**

   - Create → Apps
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Build Command**: `npm run build`
     - **Run Command**: `npm start`
     - **HTTP Port**: `3000`

3. **Variables de Entorno**

   ```
   DATABASE_URL=tu-postgres-connection-string
   NEXTAUTH_URL=https://tu-app.ondigitalocean.app
   NEXTAUTH_SECRET=genera-uno-nuevo
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   OPENAI_API_KEY=tu-openai-key
   ```

4. **Deploy**

---

### 4. AWS (Elastic Beanstalk + RDS)

#### Componentes

- **Elastic Beanstalk**: Para la aplicación Next.js
- **RDS PostgreSQL**: Para la base de datos
- **pgvector**: Necesita configuración manual

#### Paso a Paso

1. **Crear RDS PostgreSQL**

   - Ve a AWS RDS Console
   - Create database → PostgreSQL
   - Versión 15 o superior
   - Configuración: según tus necesidades

2. **Instalar pgvector en RDS**

   ```sql
   -- Conecta a tu instancia RDS
   CREATE EXTENSION vector;
   ```

3. **Configurar Elastic Beanstalk**

   ```bash
   # Instalar EB CLI
   pip install awsebcli

   # Inicializar
   eb init -p "Node.js 20" guess-the-word

   # Crear environment
   eb create production

   # Configurar variables de entorno
   eb setenv DATABASE_URL=postgresql://... \
             NEXTAUTH_URL=https://tu-app.elasticbeanstalk.com \
             NEXTAUTH_SECRET=... \
             GOOGLE_CLIENT_ID=... \
             GOOGLE_CLIENT_SECRET=... \
             OPENAI_API_KEY=...

   # Deploy
   eb deploy
   ```

---

### 5. Docker + VPS (Digital Ocean, Linode, etc.)

Para control total sobre tu infraestructura.

#### Paso a Paso

1. **Crear Droplet/VPS**

   - Ubuntu 22.04 LTS
   - Mínimo 2GB RAM
   - Instalar Docker y Docker Compose

2. **Clonar Repositorio**

   ```bash
   ssh root@tu-ip
   git clone YOUR_REPO_URL
   cd guess-the-word
   ```

3. **Configurar .env**

   ```bash
   nano .env
   # Pega tus variables de entorno
   ```

4. **Iniciar con Docker Compose**

   ```bash
   docker-compose up -d
   ```

5. **Configurar NGINX como Reverse Proxy**

   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

---

## 🔐 Checklist de Seguridad Pre-Producción

- [ ] `NEXTAUTH_SECRET` es único y aleatorio (mínimo 32 caracteres)
- [ ] Variables de entorno no están en el código
- [ ] `.env` está en `.gitignore`
- [ ] Google OAuth tiene los dominios correctos de producción
- [ ] DATABASE_URL usa SSL (`?sslmode=require`)
- [ ] OpenAI API key tiene límites de rate configurados
- [ ] CORS está configurado correctamente
- [ ] Rate limiting implementado en endpoints críticos

## 📊 Monitoreo en Producción

### Vercel Analytics

- Automático con plan Pro
- Ve a tu proyecto → Analytics

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  {
    // tu config
  },
  {
    org: 'tu-org',
    project: 'guess-the-word',
  }
)
```

### Logs

- **Vercel**: Dashboard → Project → Logs
- **Railway**: Dashboard → Deployments → Logs
- **Docker**: `docker-compose logs -f`

## 🔄 CI/CD

### GitHub Actions (Ejemplo)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run db:generate
      # Deploy steps dependiendo de tu plataforma
```

## 🎯 Métricas de Rendimiento

### Targets Recomendados

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Lighthouse Score**: > 90

### Optimizaciones

1. Implementar ISR (Incremental Static Regeneration)
2. Usar Image Optimization de Next.js
3. Implementar caching con Redis
4. CDN para assets estáticos

## 💰 Estimación de Costos (Mensual)

### Opción Económica

- **Vercel**: Hobby (Gratis)
- **Supabase**: Free tier
- **OpenAI**: ~$5-10 (según uso)
- **Total**: ~$5-10/mes

### Opción Profesional

- **Vercel**: Pro ($20)
- **Supabase**: Pro ($25)
- **OpenAI**: ~$20-50
- **Total**: ~$65-95/mes

### Opción Enterprise

- **Railway**: ~$50
- **PostgreSQL**: ~$50-100
- **OpenAI**: ~$100+
- **Monitoring**: ~$20
- **Total**: ~$220+/mes

## 🆘 Troubleshooting en Producción

### Error: "Internal Server Error"

- Revisa logs: `vercel logs` o dashboard de tu plataforma
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que la base de datos sea accesible

### Error: "Database Connection Failed"

- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que pgvector esté instalado
- Revisa que el firewall permita conexiones

### Error: "OpenAI API Error"

- Verifica límites de rate
- Revisa balance de cuenta
- Confirma que la API key sea válida

---

¿Necesitas ayuda con el despliegue? Abre un issue en GitHub.
