#!/bin/bash

echo "🚀 Iniciando Sistema LeadPro com PM2..."
echo "🌐 Configurado para acesso externo via IP: localhost"

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Verificar se o PM2 está rodando
if pm2 list | grep -q "leadpro"; then
    echo "⚠️  Sistema já está rodando. Parando processos existentes..."
    pm2 stop all
    pm2 delete all
fi

# Iniciar aplicações com PM2
echo "🔧 Iniciando Backend..."
pm2 start ecosystem.config.js --only leadpro-backend

echo "🌐 Iniciando Frontend..."
pm2 start ecosystem.config.js --only leadpro-frontend

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup

echo ""
echo "🎉 Sistema LeadPro iniciado com sucesso usando PM2!"
echo ""
echo "📊 Status dos processos:"
pm2 list

echo ""
echo "📊 URLs de acesso local:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5000/api"
echo ""
echo "🌐 URLs externas (acessíveis de qualquer dispositivo):"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5000/api"
echo ""
echo "🔐 Credenciais de acesso:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
echo ""
echo "📝 Comandos úteis do PM2:"
echo "   pm2 list                    - Listar processos"
echo "   pm2 logs                    - Ver logs"
echo "   pm2 restart all             - Reiniciar todos os processos"
echo "   pm2 stop all                - Parar todos os processos"
echo "   pm2 delete all              - Remover todos os processos"
echo ""
echo "🛑 Para parar o sistema:"
echo "   pm2 stop all"
echo "   ou"
echo "   pm2 delete all"
