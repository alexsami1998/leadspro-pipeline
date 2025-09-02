#!/bin/bash

echo "🛑 Parando Sistema LeadPro..."

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado."
    exit 1
fi

# Parar todos os processos
echo "⏹️  Parando processos..."
pm2 stop all

# Remover processos
echo "🗑️  Removendo processos..."
pm2 delete all

# Salvar configuração
pm2 save

echo ""
echo "✅ Sistema LeadPro parado com sucesso!"
echo ""
echo "📊 Status dos processos:"
pm2 list

echo ""
echo "🚀 Para iniciar novamente, execute:"
echo "   ./start-pm2.sh"
