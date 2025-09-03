#!/bin/bash

echo "🚀 Iniciando Sistema LeadPro..."

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
if ! check_port 5000; then
    node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend já está rodando na porta 5000"
fi
cd ..

# Aguardar backend ficar disponível
wait_for_port 5000 "Backend"

# Iniciar Frontend
echo "🌐 Iniciando Frontend..."
cd web
if ! check_port 8080; then
    ng serve --host 0.0.0.0 --port 8080 --disable-host-check > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
else
    echo "⚠️  Frontend já está rodando na porta 8080"
fi
cd ..

# Aguardar frontend ficar disponível
wait_for_port 8080 "Frontend"

echo ""
echo "🎉 Sistema LeadPro iniciado com sucesso!"
echo ""
echo "📊 URLs de acesso:"
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
echo "📝 Logs disponíveis em:"
echo "   Backend: logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "🛑 Para parar o sistema, execute: ./stop-system.sh"
