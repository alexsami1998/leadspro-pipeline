#!/bin/bash

echo "🚀 Iniciando Sistema LeadPro em Modo de Produção..."
echo "🌐 Configurado para acesso externo via IP: 191.96.251.155"

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Função para aguardar uma porta ficar disponível
wait_for_port() {
    local port=$1
    local service=$2
    echo "⏳ Aguardando $service na porta $port..."
    while ! check_port $port; do
        sleep 1
    done
    echo "✅ $service está rodando na porta $port"
}

# Iniciar Backend
echo "🔧 Iniciando Backend..."
cd backend
if ! check_port 3000; then
    NODE_ENV=production node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend já está rodando na porta 3000"
fi
cd ..

# Aguardar backend ficar disponível
wait_for_port 3000 "Backend"

# Iniciar Frontend em modo de produção
echo "🌐 Iniciando Frontend em modo de produção..."
cd web
if ! check_port 4200; then
    ng serve --configuration=production --host 0.0.0.0 --port 4200 --disable-host-check > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
else
    echo "⚠️  Frontend já está rodando na porta 4200"
fi
cd ..

# Aguardar frontend ficar disponível
wait_for_port 4200 "Frontend"

echo ""
echo "🎉 Sistema LeadPro iniciado com sucesso em modo de produção!"
echo ""
echo "📊 URLs de acesso local:"
echo "   Frontend: http://localhost:4200"
echo "   Backend API: http://localhost:3000/api"
echo ""
echo "🌐 URLs externas (acessíveis de qualquer dispositivo):"
echo "   Frontend: http://191.96.251.155:4200"
echo "   Backend API: http://191.96.251.155:3000/api"
echo ""
echo "🔐 Credenciais de acesso:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
echo ""
echo "📝 Logs disponíveis em:"
echo "   Backend: logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "🛑 Para parar o sistema, execute: ./stop-system.sh"
echo ""
echo "⚠️  IMPORTANTE: Certifique-se de que as portas 3000 e 4200 estão abertas no firewall da VM"
echo "   Para abrir as portas, execute:"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 4200"
