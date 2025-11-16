#!/bin/bash

# Script de desarrollo para Guess the Word
# Este script automatiza tareas comunes de desarrollo

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎯 Guess the Word - Development Helper${NC}"
echo ""

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar prerrequisitos
echo -e "${YELLOW}Verificando prerrequisitos...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos los prerrequisitos están instalados${NC}"
echo ""

# Menú principal
PS3='Selecciona una opción: '
options=(
    "🚀 Configuración inicial completa"
    "🐳 Iniciar PostgreSQL"
    "🗄️  Configurar base de datos"
    "🌱 Poblar datos (seed)"
    "💻 Iniciar servidor de desarrollo"
    "🧹 Limpiar y reiniciar todo"
    "📊 Abrir Prisma Studio"
    "🔍 Ver logs de Docker"
    "❌ Salir"
)

select opt in "${options[@]}"
do
    case $opt in
        "🚀 Configuración inicial completa")
            echo -e "${YELLOW}Iniciando configuración completa...${NC}"
            
            # Verificar .env
            if [ ! -f .env ]; then
                echo -e "${YELLOW}Creando archivo .env desde .env.example...${NC}"
                cp .env.example .env
                echo -e "${RED}⚠️  Por favor, edita el archivo .env con tus credenciales${NC}"
                echo -e "${RED}   Necesitas: OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET${NC}"
                exit 1
            fi
            
            # Instalar dependencias
            echo -e "${YELLOW}Instalando dependencias...${NC}"
            npm install
            
            # Iniciar PostgreSQL
            echo -e "${YELLOW}Iniciando PostgreSQL...${NC}"
            docker-compose up -d postgres
            
            # Esperar a que PostgreSQL esté listo
            echo -e "${YELLOW}Esperando a que PostgreSQL esté listo...${NC}"
            sleep 10
            
            # Configurar base de datos
            echo -e "${YELLOW}Configurando base de datos...${NC}"
            npm run db:generate
            npm run db:push
            
            # Seed
            echo -e "${YELLOW}Poblando datos iniciales...${NC}"
            npm run db:seed
            
            echo -e "${GREEN}✅ Configuración completa!${NC}"
            echo -e "${GREEN}Ejecuta: npm run dev${NC}"
            break
            ;;
        "🐳 Iniciar PostgreSQL")
            echo -e "${YELLOW}Iniciando PostgreSQL...${NC}"
            docker-compose up -d postgres
            echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
            ;;
        "🗄️  Configurar base de datos")
            echo -e "${YELLOW}Configurando base de datos...${NC}"
            npm run db:generate
            npm run db:push
            echo -e "${GREEN}✅ Base de datos configurada${NC}"
            ;;
        "🌱 Poblar datos (seed)")
            echo -e "${YELLOW}Poblando datos...${NC}"
            npm run db:seed
            echo -e "${GREEN}✅ Datos poblados${NC}"
            ;;
        "💻 Iniciar servidor de desarrollo")
            echo -e "${YELLOW}Iniciando servidor de desarrollo...${NC}"
            npm run dev
            ;;
        "🧹 Limpiar y reiniciar todo")
            echo -e "${RED}⚠️  Esto eliminará todos los datos. ¿Estás seguro? (y/n)${NC}"
            read -r confirm
            if [ "$confirm" = "y" ]; then
                echo -e "${YELLOW}Deteniendo contenedores...${NC}"
                docker-compose down -v
                
                echo -e "${YELLOW}Reiniciando PostgreSQL...${NC}"
                docker-compose up -d postgres
                sleep 10
                
                echo -e "${YELLOW}Reconfigurando base de datos...${NC}"
                npm run db:generate
                npm run db:push
                npm run db:seed
                
                echo -e "${GREEN}✅ Todo limpio y reiniciado${NC}"
            fi
            ;;
        "📊 Abrir Prisma Studio")
            echo -e "${YELLOW}Abriendo Prisma Studio...${NC}"
            npm run db:studio
            ;;
        "🔍 Ver logs de Docker")
            docker-compose logs -f
            ;;
        "❌ Salir")
            break
            ;;
        *) echo "Opción inválida $REPLY";;
    esac
done
