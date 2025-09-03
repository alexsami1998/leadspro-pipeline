#!/bin/bash

echo "🧪 Testando Configuração do Sistema LeadPro"
echo "=========================================="

# Verificar se o arquivo de configuração existe
if [ -f "config.js" ]; then
    echo "✅ config.js encontrado"
else
    echo "❌ config.js não encontrado"
    exit 1
fi

# Verificar se as portas estão livres
echo ""
echo "🔍 Verificando portas..."

# Verificar porta 8080 (Frontend)
if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  Porta 8080 (Frontend) está em uso"
else
    echo "✅ Porta 8080 (Frontend) está livre"
fi

# Verificar porta 5000 (Backend)
if lsof -i :5000 > /dev/null 2>&1; then
    echo "⚠️  Porta 5000 (Backend) está em uso"
else
    echo "✅ Porta 5000 (Backend) está livre"
fi

# Verificar se as portas antigas estão livres
echo ""
echo "🔍 Verificando portas antigas..."

if lsof -i :4200 > /dev/null 2>&1; then
    echo "⚠️  Porta 4200 (antiga Frontend) está em uso"
else
    echo "✅ Porta 4200 (antiga Frontend) está livre"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Porta 3000 (antiga Backend) está em uso"
else
    echo "✅ Porta 3000 (antiga Backend) está livre"
fi

# Verificar arquivos de configuração
echo ""
echo "📁 Verificando arquivos de configuração..."

# Verificar backend
if grep -q "config.deploy.backend.port" backend/server.js; then
    echo "✅ Backend configurado para usar config.js"
else
    echo "❌ Backend não configurado para usar config.js"
fi

# Verificar frontend
if grep -q "8080" web/angular.json; then
    echo "✅ Frontend configurado para porta 8080"
else
    echo "❌ Frontend não configurado para porta 8080"
fi

# Verificar variáveis de ambiente
if grep -q "localhost:5000" web/src/environments/environment.ts; then
    echo "✅ Environment dev configurado para localhost:5000"
else
    echo "❌ Environment dev não configurado corretamente"
fi

if grep -q "localhost:5000" web/src/environments/environment.prod.ts; then
    echo "✅ Environment prod configurado para localhost:5000"
else
    echo "❌ Environment prod não configurado corretamente"
fi

# Verificar scripts
echo ""
echo "📜 Verificando scripts..."

if grep -q "8080" start-system.sh; then
    echo "✅ start-system.sh configurado para porta 8080"
else
    echo "❌ start-system.sh não configurado para porta 8080"
fi

if grep -q "5000" start-system.sh; then
    echo "✅ start-system.sh configurado para porta 5000"
else
    echo "❌ start-system.sh não configurado para porta 5000"
fi

# Verificar firewall
echo ""
echo "🔥 Verificando configuração de firewall..."

if command -v ufw > /dev/null; then
    echo "✅ UFW instalado"
    echo "📊 Status do firewall:"
    sudo ufw status | grep -E "(5000|8080)" || echo "⚠️  Portas 5000 e 8080 não encontradas no firewall"
else
    echo "⚠️  UFW não instalado"
fi

echo ""
echo "🎯 Resumo da Configuração:"
echo "   Frontend: Porta 8080"
echo "   Backend: Porta 5000"
echo "   Banco: Configurado via config.js"
echo "   IP: Configurável via config.js"

echo ""
echo "📝 Para testar o sistema:"
echo "   1. ./start-system.sh"
echo "   2. Acessar http://localhost:8080"
echo "   3. Verificar API em http://localhost:5000/api"

echo ""
echo "🔧 Para configuração manual:"
echo "   1. Editar config.js"
echo "   2. Definir manual.enabled = true"
echo "   3. Configurar vmIp"
echo "   4. Reiniciar serviços"

echo ""
echo "✅ Teste de configuração concluído!"
