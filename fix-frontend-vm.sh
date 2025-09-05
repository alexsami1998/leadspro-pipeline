#!/bin/bash

echo "🔧 Corrigindo Frontend na VM"
echo "============================"

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🛑 Parando todos os containers..."
docker-compose down --remove-orphans

echo ""
echo "🗑️ Removendo containers órfãos..."
docker container prune -f

echo ""
echo "🔍 Verificando se há containers antigos..."
OLD_CONTAINERS=$(docker ps -a --filter "name=leadpro-frontend" --format "{{.Names}}")
if [ ! -z "$OLD_CONTAINERS" ]; then
    echo "⚠️ Encontrados containers antigos: $OLD_CONTAINERS"
    echo "🗑️ Removendo containers antigos..."
    docker rm -f $OLD_CONTAINERS
fi

echo ""
echo "🔨 Reconstruindo frontend com --no-cache..."
docker-compose build --no-cache frontend

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

echo ""
echo "🔍 Verificando conteúdo do frontend..."
echo "Verificando se o index.html é do Angular ou do Nginx:"
docker exec leadpro-frontend head -5 /usr/share/nginx/html/index.html

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🧪 Testando frontend..."
if curl -s -f http://localhost:8080 | grep -q "app-root"; then
    echo "✅ Frontend Angular funcionando!"
else
    echo "❌ Frontend ainda mostra página padrão do Nginx"
    echo "🔍 Verificando logs do frontend..."
    docker-compose logs frontend --tail=20
fi

echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"

echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"

echo ""
echo "✅ Correção concluída!"
