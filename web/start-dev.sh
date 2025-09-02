#!/bin/bash

# LeadPro - Script de Inicialização do Ambiente de Desenvolvimento
# Este script configura e inicia o ambiente completo para desenvolvimento

echo "🚀 LeadPro - Iniciando Ambiente de Desenvolvimento"
echo "=================================================="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o Angular CLI está instalado
if ! command -v ng &> /dev/null; then
    echo "📦 Instalando Angular CLI..."
    npm install -g @angular/cli
fi

echo "📦 Instalando dependências do projeto..."
npm install

echo "🐳 Iniciando containers do Docker..."
docker-compose up -d

echo "⏳ Aguardando PostgreSQL estar pronto..."
until docker-compose exec -T postgres pg_isready -U postgres -d leadpro; do
    echo "Aguardando PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL está pronto!"

echo "🔧 Verificando configuração do banco..."
# Aguardar um pouco mais para garantir que o banco está totalmente inicializado
sleep 5

echo "🌐 Iniciando servidor de desenvolvimento..."
echo ""
echo "🎉 Ambiente iniciado com sucesso!"
echo ""
echo "📋 Informações de Acesso:"
echo "   • Frontend: http://191.96.251.155:4200"
echo "   • Backend API: http://191.96.251.155:3000/api"
echo "   • PgAdmin: http://localhost:5050"
echo "   • PostgreSQL: localhost:5432"
echo ""
echo "🔑 Credenciais Padrão:"
echo "   • Usuário: admin"
echo "   • Senha: 123@mudar"
echo ""
echo "📊 PgAdmin Credenciais:"
echo "   • Email: admin@leadpro.com"
echo "   • Senha: admin123"
echo ""
echo "🛑 Para parar o ambiente, execute: ./stop-dev.sh"
echo ""

# Iniciar o servidor Angular
ng serve --host 0.0.0.0 --port 4200
