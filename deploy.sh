#!/bin/bash

echo "🚀 Deploy LeadPro com Docker"
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

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "   Instale o Docker primeiro: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    echo "   Instale o Docker Compose primeiro: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
read -p "🗑️  Remover imagens antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removendo imagens antigas..."
    docker-compose down --rmi all
fi

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar containers ficarem prontos
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Status: docker-compose ps"
