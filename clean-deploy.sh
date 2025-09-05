#!/bin/bash

echo "🧹 Deploy Limpo Completo"
echo "========================"

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🛑 Parando todos os containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo ""
echo "🗑️ Removendo todos os containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo ""
echo "🗑️ Removendo todas as imagens..."
docker rmi -f $(docker images -q) 2>/dev/null || true

echo ""
echo "🗑️ Limpando sistema Docker..."
docker system prune -a -f

echo ""
echo "🔨 Construindo e iniciando containers..."
docker-compose up -d --build

echo ""
echo "🔧 Aplicando correção CORS..."
sleep 5

echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 30

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🧪 Testando conectividade..."

# Testar backend
if curl -s -f http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend não está respondendo"
fi

# Testar frontend
if curl -s -f http://localhost:8080 > /dev/null; then
    echo "✅ Frontend funcionando"
else
    echo "❌ Frontend não está respondendo"
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
echo "🎉 Deploy limpo concluído!"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
