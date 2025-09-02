#!/bin/bash

# LeadPro - Script para Parar o Ambiente de Desenvolvimento

echo "🛑 LeadPro - Parando Ambiente de Desenvolvimento"
echo "================================================"

echo "🐳 Parando containers do Docker..."
docker-compose down

echo "🧹 Limpando containers parados..."
docker container prune -f

echo "✅ Ambiente parado com sucesso!"
echo ""
echo "💡 Para iniciar novamente, execute: ./start-dev.sh"
