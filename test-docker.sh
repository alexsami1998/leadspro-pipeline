#!/bin/bash

echo "🧪 Testando Sistema Docker LeadPro"
echo "=================================="

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

# Verificar se Docker está rodando
echo "🐳 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    echo "   Inicie o Docker: sudo systemctl start docker"
    exit 1
fi
echo "✅ Docker está rodando"

# Verificar containers
echo "📦 Verificando containers..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Containers não estão rodando!"
    echo "   Execute: docker-compose up -d"
    exit 1
fi
echo "✅ Containers estão rodando"

# Verificar portas
echo "🔌 Verificando portas..."
echo "   Porta 8080 (Frontend): $(lsof -i:8080 2>/dev/null | wc -l) processos"
echo "   Porta 5000 (Backend): $(lsof -i:5000 2>/dev/null | wc -l) processos"
echo ""

# Testar APIs
echo "🔌 Testando APIs..."

# Teste de health check
echo "   Health Check:"
if curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo "   ✅ http://localhost:5000/api/health - OK"
else
    echo "   ❌ http://localhost:5000/api/health - FALHOU"
fi

# Teste de leads
echo "   Leads API:"
LEADS_RESPONSE=$(curl -s "http://localhost:5000/api/leads" 2>/dev/null)
if echo "$LEADS_RESPONSE" | grep -q "\[" || echo "$LEADS_RESPONSE" | grep -q "leads"; then
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
fi

# Teste de upload (simulado)
echo "   Upload API:"
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/media/upload" \
  -F "media=@/dev/null" 2>/dev/null)

if echo "$UPLOAD_RESPONSE" | grep -q "error\|success"; then
    echo "   ✅ Upload API - OK (endpoint acessível)"
else
    echo "   ❌ Upload API - FALHOU"
fi

echo ""

# Testar frontend
echo "🌐 Testando Frontend..."
if curl -s -f "http://localhost:8080" > /dev/null 2>&1; then
    echo "   ✅ Frontend - OK"
else
    echo "   ❌ Frontend - FALHOU"
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

# Status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Teste concluído!"
echo ""
echo "💡 Para ver logs: docker-compose logs -f"
echo "💡 Para parar: docker-compose down"
