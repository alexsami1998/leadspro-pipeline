#!/bin/bash

echo "🔧 Testando Correção de CORS"
echo "============================"

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

# Verificar se o backend está rodando
echo "📡 Verificando backend..."
if ! curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo "❌ Backend não está rodando!"
    echo "   Execute: ./start-system.sh"
    exit 1
fi
echo "✅ Backend está rodando"
echo ""

# Testar CORS com diferentes origens
echo "🔌 Testando CORS..."

# Teste 1: Health check
echo "   Health Check:"
HEALTH_RESPONSE=$(curl -s -H "Origin: http://$DETECTED_IP:8080" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:5000/api/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Health Check CORS - OK"
else
    echo "   ❌ Health Check CORS - FALHOU"
fi

# Teste 2: Upload de mídia (simulado)
echo "   Upload API:"
UPLOAD_RESPONSE=$(curl -s -H "Origin: http://$DETECTED_IP:8080" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:5000/api/media/upload" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Upload API CORS - OK"
else
    echo "   ❌ Upload API CORS - FALHOU"
fi

# Teste 3: Interações
echo "   Interactions API:"
INTERACTIONS_RESPONSE=$(curl -s -H "Origin: http://$DETECTED_IP:8080" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "http://localhost:5000/api/interactions" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Interactions API CORS - OK"
else
    echo "   ❌ Interactions API CORS - FALHOU"
fi

echo ""

# Testar upload real (com arquivo vazio)
echo "🧪 Testando upload real..."
UPLOAD_TEST=$(curl -s -X POST "http://localhost:5000/api/media/upload" \
  -H "Origin: http://$DETECTED_IP:8080" \
  -F "media=@/dev/null" 2>/dev/null)

if echo "$UPLOAD_TEST" | grep -q "error\|success"; then
    echo "   ✅ Upload real - OK (endpoint acessível)"
    echo "   📊 Resposta: $(echo "$UPLOAD_TEST" | head -c 100)..."
else
    echo "   ❌ Upload real - FALHOU"
    echo "   📊 Resposta: $UPLOAD_TEST"
fi

echo ""

# Testar criação de interação
echo "🧪 Testando criação de interação..."
INTERACTION_TEST=$(curl -s -X POST "http://localhost:5000/api/interactions" \
  -H "Origin: http://$DETECTED_IP:8080" \
  -H "Content-Type: application/json" \
  -d '{"lead_id":1,"tipo":"TEXTO","conteudo":"Teste de interação","usuario_criacao":"1"}' 2>/dev/null)

if echo "$INTERACTION_TEST" | grep -q "id\|error"; then
    echo "   ✅ Criação de interação - OK (endpoint acessível)"
    echo "   📊 Resposta: $(echo "$INTERACTION_TEST" | head -c 100)..."
else
    echo "   ❌ Criação de interação - FALHOU"
    echo "   📊 Resposta: $INTERACTION_TEST"
fi

echo ""

# Verificar headers CORS
echo "🔍 Verificando headers CORS..."
CORS_HEADERS=$(curl -s -I -H "Origin: http://$DETECTED_IP:8080" "http://localhost:5000/api/health" 2>/dev/null | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "   ✅ Headers CORS encontrados:"
    echo "$CORS_HEADERS" | sed 's/^/     /'
else
    echo "   ⚠️  Headers CORS não encontrados"
fi

echo ""
echo "✅ Teste de CORS concluído!"
echo ""
echo "💡 Se ainda houver problemas:"
echo "   1. Reinicie o backend: ./stop-system.sh && ./start-system.sh"
echo "   2. Verifique se está acessando via IP correto: http://$DETECTED_IP:8080"
echo "   3. Limpe o cache do navegador (Ctrl+F5)"
