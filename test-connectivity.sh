#!/bin/bash

echo "🔍 Testando conectividade entre Frontend e Backend..."

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

# Verificar se os serviços estão rodando
echo "📡 Verificando serviços:"
echo "   Backend (porta 5000): $(lsof -i:5000 2>/dev/null | wc -l) processos"
echo "   Frontend (porta 8080): $(lsof -i:8080 2>/dev/null | wc -l) processos"
echo ""

# Testar conectividade do backend
echo "🔌 Testando API do Backend:"

# Teste de health check
echo "   Health Check:"
if curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo "   ✅ http://localhost:5000/api/health - OK"
else
    echo "   ❌ http://localhost:5000/api/health - FALHOU"
fi

# Teste de leads
echo "   Leads API:"
if curl -s -f "http://localhost:5000/api/leads" > /dev/null 2>&1; then
    echo "   ✅ http://localhost:5000/api/leads - OK"
else
    echo "   ❌ http://localhost:5000/api/leads - FALHOU"
fi

# Teste de login
echo "   Login API:"
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"123@mudar"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo "   ✅ Login API - OK"
else
    echo "   ❌ Login API - FALHOU"
    echo "   Resposta: $LOGIN_RESPONSE"
fi

echo ""

# Testar conectividade externa
echo "🌐 Testando conectividade externa:"

# Teste de health check externo
echo "   Health Check (externo):"
if curl -s -f "http://$DETECTED_IP:5000/api/health" > /dev/null 2>&1; then
    echo "   ✅ http://$DETECTED_IP:5000/api/health - OK"
else
    echo "   ❌ http://$DETECTED_IP:5000/api/health - FALHOU"
fi

echo ""

# Verificar configuração do CORS
echo "🔧 Verificando configuração CORS:"
CORS_HEADERS=$(curl -s -I "http://localhost:5000/api/health" 2>/dev/null | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "   ✅ CORS configurado:"
    echo "$CORS_HEADERS" | sed 's/^/     /'
else
    echo "   ⚠️  CORS não detectado nos headers"
fi

echo ""

# Verificar logs do backend
echo "📝 Últimas linhas do log do backend:"
if [ -f "logs/backend.log" ]; then
    echo "   Últimas 5 linhas:"
    tail -5 logs/backend.log | sed 's/^/     /'
else
    echo "   ⚠️  Arquivo de log não encontrado"
fi

echo ""

# Verificar logs do frontend
echo "📝 Últimas linhas do log do frontend:"
if [ -f "logs/frontend.log" ]; then
    echo "   Últimas 5 linhas:"
    tail -5 logs/frontend.log | sed 's/^/     /'
else
    echo "   ⚠️  Arquivo de log não encontrado"
fi

echo ""
echo "✅ Teste de conectividade concluído!"
echo ""
echo "💡 Se houver problemas:"
echo "   1. Verifique se ambos os serviços estão rodando"
echo "   2. Verifique os logs em logs/backend.log e logs/frontend.log"
echo "   3. Verifique o console do navegador (F12)"
echo "   4. Execute: ./check-network.sh"
