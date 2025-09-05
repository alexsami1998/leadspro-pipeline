#!/bin/bash

echo "🧪 Testando Frontend Corrigido"
echo "=============================="

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

echo ""
echo "🔌 Testando Frontend na porta 8081..."
if curl -s -f http://localhost:8081 > /dev/null; then
    echo "✅ Frontend funcionando na porta 8081"
else
    echo "❌ Frontend não está funcionando na porta 8081"
fi

echo ""
echo "🔌 Testando Frontend na porta 8080..."
if curl -s -f http://localhost:8080 > /dev/null; then
    echo "✅ Frontend funcionando na porta 8080"
else
    echo "❌ Frontend não está funcionando na porta 8080"
fi

echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend (8081): http://$DETECTED_IP:8081"
echo "   Frontend (8080): http://$DETECTED_IP:8080"
echo "   Backend API: http://$DETECTED_IP:5000/api"

echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Teste concluído!"
echo ""
echo "💡 O frontend está funcionando na porta 8081"
echo "💡 Para usar na porta 8080, execute: ./deploy.sh"
