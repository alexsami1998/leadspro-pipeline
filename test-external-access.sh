#!/bin/bash

echo "🌐 Testando Acesso Externo do LeadPro..."

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

# Testar APIs com IP externo
echo "🔌 Testando APIs com IP externo ($DETECTED_IP):"

# Teste de health check
echo "   Health Check:"
if curl -s -f "http://$DETECTED_IP:5000/api/health" > /dev/null 2>&1; then
    echo "   ✅ http://$DETECTED_IP:5000/api/health - OK"
else
    echo "   ❌ http://$DETECTED_IP:5000/api/health - FALHOU"
fi

# Teste de leads
echo "   Leads API:"
LEADS_RESPONSE=$(curl -s "http://$DETECTED_IP:5000/api/leads" 2>/dev/null)
if echo "$LEADS_RESPONSE" | grep -q "\[" || echo "$LEADS_RESPONSE" | grep -q "leads"; then
    echo "   ✅ http://$DETECTED_IP:5000/api/leads - OK"
    echo "   📊 Resposta: $(echo "$LEADS_RESPONSE" | head -c 100)..."
else
    echo "   ❌ http://$DETECTED_IP:5000/api/leads - FALHOU"
    echo "   📊 Resposta: $LEADS_RESPONSE"
fi

# Teste de dashboard stats
echo "   Dashboard Stats:"
STATS_RESPONSE=$(curl -s "http://$DETECTED_IP:5000/api/dashboard/stats" 2>/dev/null)
if echo "$STATS_RESPONSE" | grep -q "total_leads" || echo "$STATS_RESPONSE" | grep -q "leads_novos"; then
    echo "   ✅ http://$DETECTED_IP:5000/api/dashboard/stats - OK"
    echo "   📊 Resposta: $(echo "$STATS_RESPONSE" | head -c 100)..."
else
    echo "   ❌ http://$DETECTED_IP:5000/api/dashboard/stats - FALHOU"
    echo "   📊 Resposta: $STATS_RESPONSE"
fi

# Teste de login
echo "   Login API:"
LOGIN_RESPONSE=$(curl -s -X POST "http://$DETECTED_IP:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"123@mudar"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo "   ✅ Login API - OK"
else
    echo "   ❌ Login API - FALHOU"
    echo "   📊 Resposta: $LOGIN_RESPONSE"
fi

echo ""

# Verificar configuração do CORS
echo "🔧 Verificando configuração CORS:"
CORS_HEADERS=$(curl -s -I "http://$DETECTED_IP:5000/api/health" 2>/dev/null | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "   ✅ CORS configurado:"
    echo "$CORS_HEADERS" | sed 's/^/     /'
else
    echo "   ⚠️  CORS não detectado nos headers"
fi

echo ""

# URLs de acesso
echo "🌐 URLs de acesso:"
echo "   Local:"
echo "     Frontend: http://localhost:8080"
echo "     Backend:  http://localhost:5000/api"
echo ""
echo "   Externo:"
echo "     Frontend: http://$DETECTED_IP:8080"
echo "     Backend:  http://$DETECTED_IP:5000/api"
echo ""

# Instruções para teste
echo "🧪 Para testar no navegador:"
echo "   1. Abra: http://$DETECTED_IP:8080"
echo "   2. Faça login com: admin / 123@mudar"
echo "   3. Verifique se os dados carregam"
echo "   4. Abra F12 e verifique o console"
echo ""

echo "✅ Teste de acesso externo concluído!"
