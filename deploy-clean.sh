#!/bin/bash

echo "🚀 Deploy Limpo LeadPro"
echo "======================="

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Parar sistema tradicional se estiver rodando
echo ""
echo "🛑 Parando sistema tradicional..."
./stop-system.sh 2>/dev/null || true

# Parar containers Docker
echo "🛑 Parando containers Docker..."
docker-compose down --remove-orphans 2>/dev/null || true

# Limpar containers órfãos
echo "🗑️ Limpando containers órfãos..."
docker container prune -f

# Limpar imagens não utilizadas
echo "🗑️ Limpando imagens não utilizadas..."
docker image prune -f

# Reconstruir e iniciar containers
echo ""
echo "🔨 Construindo e iniciando containers..."
docker-compose up -d --build

# Aguardar containers ficarem prontos
echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 20

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker-compose ps

# Testar conectividade
echo ""
echo "🧪 Testando conectividade..."

# Testar backend
if curl -s -f http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend não está respondendo"
    echo "📝 Logs do backend:"
    docker-compose logs backend --tail=10
fi

# Testar frontend
if curl -s -f http://localhost:8080 > /dev/null; then
    echo "✅ Frontend funcionando"
else
    echo "❌ Frontend não está respondendo"
    echo "📝 Logs do frontend:"
    docker-compose logs frontend --tail=10
fi

# Verificar se o frontend está servindo o Angular
echo ""
echo "🔍 Verificando conteúdo do frontend..."
FRONTEND_CONTENT=$(curl -s http://localhost:8080 | head -5)
if echo "$FRONTEND_CONTENT" | grep -q "app-root"; then
    echo "✅ Frontend servindo Angular corretamente"
else
    echo "❌ Frontend ainda servindo página padrão do Nginx"
    echo "📝 Conteúdo atual:"
    echo "$FRONTEND_CONTENT"
fi

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
