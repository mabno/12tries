# Feature: Versión Embebible del Juego (iframe)

## Resumen

Se ha implementado una versión embebible del juego "Guess the Word" que puede ser integrada en sitios web externos mediante iframes.

## Archivos Creados

### 1. Componentes de la App Embed (`/src/app/embed/`)

- **`page.tsx`**: Página principal del embed
- **`layout.tsx`**: Layout específico para el embed (sin headers/footers)
- **`EmbedClient.tsx`**: Componente principal con toda la lógica del juego simplificado

### 2. Página de Información (`/src/app/[locale]/embed-info/`)

- **`page.tsx`**: Página de información sobre el embed
- **`EmbedInfoClient.tsx`**: Cliente con documentación, código para copiar y preview

### 3. Documentación (`/docs/`)

- **`EMBED.md`**: Documentación completa sobre cómo usar el embed

### 4. Ejemplos (`/public/`)

- **`embed-demo.html`**: Demo completa con estilos y explicaciones
- **`embed-example.html`**: Ejemplo minimalista listo para copiar

### 5. Configuración

- **`next.config.js`**: Agregados headers para permitir embedding (X-Frame-Options, CSP)
- **`src/components/Footer.tsx`**: Agregado link a la página de información del embed
- **`README.md`**: Actualizado con sección sobre la versión embebible

## Características de la Versión Embed

### ✅ Incluye:

- Juego completo (12 intentos)
- Sistema de similitud semántica
- Top 5 del leaderboard diario
- Nickname para usuarios anónimos
- Interfaz responsive optimizada
- Animaciones y efectos visuales
- Confetti al ganar

### ❌ No incluye:

- Autenticación con Google
- Sistema de recordatorios por email
- Badges y logros complejos
- Rocky bonus feature
- Menú de navegación completo
- Footer con links

## Cómo Usar

### Opción 1: Embed Básico

```html
<iframe src="https://tu-dominio.com/embed" width="100%" height="800" frameborder="0" title="Guess the Word Game"></iframe>
```

### Opción 2: Ver desde la App

1. Ir a la página principal del juego
2. Hacer clic en "📦 Embed" en el footer
3. Ver documentación, copiar código y preview live

### Opción 3: Acceso Directo

- **Embed**: `https://tu-dominio.com/embed`
- **Demo**: `https://tu-dominio.com/embed-demo.html`
- **Info**: `https://tu-dominio.com/[locale]/embed-info`

## Dimensiones Recomendadas

- **Desktop**: 1000px × 800px
- **Tablet**: 100% × 800px
- **Mobile**: 100% × 900px

## APIs Utilizadas

El embed usa los mismos endpoints que la versión principal:

- `GET /api/challenge` - Obtener desafío actual
- `POST /api/guess` - Enviar intento
- `GET /api/leaderboard` - Obtener top 5

Todos funcionan con usuarios anónimos vía `browserId` y `nickname`.

## Seguridad

- **CORS**: Configurado para permitir embeds desde cualquier dominio
- **X-Frame-Options**: `SAMEORIGIN` por defecto (cambiar a `ALLOWALL` para dominios externos)
- **CSP**: `frame-ancestors 'self' *`
- Sin datos sensibles en localStorage
- Rate limiting heredado de las APIs existentes

## Testing Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Acceder al embed
http://localhost:3000/embed?lang=en
http://localhost:3000/embed?lang=es

# Página de info con preview
http://localhost:3000/en/embed-info
http://localhost:3000/es/embed-info
```

## Próximos Pasos (Opcionales)

- [ ] Agregar parámetros URL para personalización (idioma, tema)
- [ ] Crear versión con ancho fijo para widgets más pequeños
- [ ] Agregar postMessage API para comunicación con página padre
- [ ] Soporte multiidioma en el embed
- [ ] Analytics específicos para versión embed

## Notas Técnicas

1. **localStorage**: Se usa para persistir `browserId` y `nickname`
2. **Aislamiento**: El layout del embed no hereda header/footer de la app principal
3. **Estilos**: Usa las mismas clases de Tailwind que la app principal
4. **Componentes**: Reutiliza componentes UI de shadcn (Button, Card, Input, etc.)
5. **Estado**: Todo el estado se maneja localmente, sin dependencia de NextAuth

## Beneficios

- ✅ Fácil integración (una línea de código)
- ✅ Totalmente funcional
- ✅ Mantenimiento cero para el sitio que lo embebe
- ✅ Actualizaciones automáticas
- ✅ Responsive y accesible
- ✅ SEO-friendly para el sitio host

---

**Implementado por**: GitHub Copilot
**Fecha**: Noviembre 2025
