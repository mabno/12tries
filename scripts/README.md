# Development Scripts

Scripts para facilitar el desarrollo de Guess the Word.

## Scripts de Daily Challenge

### 🆕 Crear Nuevo Challenge

Genera un nuevo daily challenge, reemplazando el challenge actual del día (si existe).

```bash
# Generar con palabra aleatoria
npm run challenge:new

# Generar con palabra específica (inglés o español)
npm run challenge:new -- --word=cat
npm run challenge:new -- --word=gato
```

**¿Qué hace este script?**

- ❌ Elimina el challenge actual del día (si existe)
- 🗑️ Limpia el progreso de usuarios asociado
- 🎲 Selecciona una palabra (aleatoria o específica)
- ✨ Crea un nuevo challenge para el día actual
- 📊 Muestra estadísticas de la base de datos

**Ideal para:**

- Testing en desarrollo
- Probar diferentes palabras
- Resetear el challenge del día

---

### 📊 Ver Challenge Actual

Muestra información detallada sobre el challenge del día actual.

```bash
npm run challenge:info
```

**¿Qué muestra?**

- 📝 Detalles del challenge (palabra, longitud, etc.)
- 📊 Estadísticas (jugadores, intentos, tasa de resolución)
- 🏆 Top 5 jugadores del día
- 📚 Estado del pool de palabras

**Output ejemplo:**

```
🎯 Current Daily Challenge Info

📅 Date: 2025-11-16

📝 Challenge Details:
   ID: clx1234567890
   English: mountain
   Spanish: montaña
   Length: EN=8, ES=7

📊 Statistics:
   Total players: 15
   Total attempts: 89
   Solved: 12/15 (80.0%)
   Avg attempts: 5.9
   Avg best similarity: 76.3%

🏆 Top Players (by best similarity):
   1. John Doe - Attempts: 3, Best: 95.2% ✓
   2. Anonymous Player - Attempts: 7, Best: 88.4% ✓
   ...
```

---

## Database Scripts

### 🌱 Seed Database

```bash
npm run db:seed
```

Puebla la base de datos con palabras del archivo `data/palabras.csv`.

### 🗄️ Prisma Studio

```bash
npm run db:studio
```

Abre Prisma Studio para ver/editar la base de datos visualmente.

---

## Workflow de Desarrollo

### Setup inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
npm run db:generate
npm run db:push

# 3. Poblar con palabras
npm run db:seed

# 4. Crear primer challenge
npm run challenge:new
```

### Testing diario

```bash
# Ver el challenge actual
npm run challenge:info

# Crear nuevo challenge si necesitas resetear
npm run challenge:new

# Iniciar dev server
npm run dev
```

### Testing con palabras específicas

```bash
# Testear con una palabra fácil
npm run challenge:new -- --word=cat

# Testear con una palabra difícil
npm run challenge:new -- --word=philosophy
```

---

## Notas

⚠️ **Estos scripts son solo para desarrollo**

- Modifican la base de datos directamente
- Eliminan progreso de usuarios
- No usar en producción

💡 **Tips**

- Los challenges usan UTC para la fecha
- Puedes tener un challenge por día
- Los embeddings se generan automáticamente al hacer seed

🔍 **Debugging**

- Si no hay palabras: `npm run db:seed`
- Para ver la base de datos: `npm run db:studio`
- Para ver logs: revisa la consola del script
