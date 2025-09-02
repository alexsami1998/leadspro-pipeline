#!/bin/bash

echo "🛑 Parando Sistema LeadPro..."

# Função para parar processo por PID
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Parando $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
            echo "✅ $service_name parado"
        else
            echo "⚠️  $service_name já não está rodando"
            rm "$pid_file"
        fi
    else
        echo "⚠️  PID file não encontrado para $service_name"
    fi
}

# Parar Frontend
stop_process "logs/frontend.pid" "Frontend"

# Parar Backend
stop_process "logs/backend.pid" "Backend"

# Parar processos por porta (fallback)
echo "🔍 Verificando processos restantes..."

# Parar processos na porta 4200 (Frontend)
if lsof -ti:4200 > /dev/null 2>&1; then
    echo "🛑 Parando processo na porta 4200..."
    lsof -ti:4200 | xargs kill -9
    echo "✅ Processo na porta 4200 parado"
fi

# Parar processos na porta 3000 (Backend)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "🛑 Parando processo na porta 3000..."
    lsof -ti:3000 | xargs kill -9
    echo "✅ Processo na porta 3000 parado"
fi

echo ""
echo "✅ Sistema LeadPro parado com sucesso!"
