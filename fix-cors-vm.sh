#!/bin/bash

echo "🔧 Correção CORS para VM"
echo "========================"

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🛑 Parando containers..."
docker-compose down 2>/dev/null || true

echo ""
echo "🔨 Reconstruindo backend com correção CORS..."
docker-compose build --no-cache backend

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 20

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🧪 Testando CORS..."

# Testar endpoint com headers
echo "Testando endpoint /api/leads com headers CORS..."
curl -H "Origin: http://$DETECTED_IP:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-user-role" \
     -X OPTIONS \
     http://localhost:5000/api/leads \
     -v 2>&1 | grep -E "(Access-Control|HTTP/1.1)"

echo ""
echo "🎉 Correção CORS aplicada!"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
