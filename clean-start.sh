#!/bin/bash

echo "🧹 Limpeza Completa e Reinício"
echo "=============================="

# Função para detectar IP da máquina
detect_ip() {
    local ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    if [ -z "$ip" ]; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    echo "$ip"
}

DETECTED_IP=$(detect_ip)

echo "🌐 IP detectado: $DETECTED_IP"
echo ""

# Parar sistema tradicional
echo "🛑 Parando sistema tradicional..."
./stop-system.sh

# Parar containers Docker
echo "🛑 Parando containers Docker..."
docker-compose down 2>/dev/null || echo "   Nenhum container Docker rodando"

# Limpar containers Docker
echo "🧹 Limpando containers Docker..."
docker system prune -f 2>/dev/null || echo "   Nada para limpar"

# Matar processos nas portas (força bruta)
echo "🔨 Matando processos nas portas..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "   Matando processo na porta 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
fi

if lsof -ti:5000 > /dev/null 2>&1; then
    echo "   Matando processo na porta 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
fi

echo "✅ Limpeza concluída!"
echo ""

# Perguntar qual método usar
echo "🚀 Escolha o método de deploy:"
echo "   1) Sistema Tradicional (recomendado)"
echo "   2) Docker"
echo ""
read -p "Digite sua escolha (1 ou 2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Iniciando Sistema Tradicional..."
        ./start-system.sh
        echo ""
        echo "🧪 Testando sistema..."
        sleep 5
        ./test-cors-fix.sh
        ;;
    2)
        echo ""
        echo "🐳 Iniciando Docker..."
        ./deploy.sh
        echo ""
        echo "🧪 Testando sistema..."
        sleep 10
        ./test-docker.sh
        ;;
    *)
        echo "❌ Opção inválida!"
        echo "   Execute novamente e escolha 1 ou 2"
        exit 1
        ;;
esac

echo ""
echo "🎉 Sistema iniciado com sucesso!"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend:  http://$DETECTED_IP:5000/api"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
