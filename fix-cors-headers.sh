#!/bin/bash

echo "🔧 Corrigindo Headers CORS"
echo "=========================="

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🛑 Parando containers..."
docker-compose down

echo ""
echo "🔨 Reconstruindo backend com correção CORS..."
docker-compose build --no-cache backend

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 15

echo ""
echo "🧪 Testando CORS..."
echo "Testando endpoint de leads:"
if curl -s -H "x-user-id: 1" -H "Origin: http://$DETECTED_IP:8080" \
   -H "Access-Control-Request-Method: GET" \
   -H "Access-Control-Request-Headers: x-user-id" \
   -X OPTIONS http://localhost:5000/api/leads | grep -q "Access-Control-Allow-Headers.*x-user-id"; then
    echo "✅ CORS configurado corretamente para x-user-id"
else
    echo "❌ CORS ainda não está permitindo x-user-id"
fi

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"

echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"

echo ""
echo "✅ Correção CORS concluída!"
echo ""
echo "💡 Teste o sistema no navegador agora"
echo "💡 Se ainda houver problemas, verifique os logs: docker-compose logs backend"
