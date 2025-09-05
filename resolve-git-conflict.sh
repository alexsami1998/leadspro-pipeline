#!/bin/bash

echo "🔧 Resolvendo Conflito Git Pull"
echo "==============================="

echo ""
echo "🔍 Verificando arquivos conflitantes..."
if [ -f "fix-frontend-vm.sh" ]; then
    echo "⚠️ Arquivo fix-frontend-vm.sh encontrado localmente"
    echo "🗑️ Removendo arquivo local..."
    rm -f fix-frontend-vm.sh
fi

if [ -f "fix-cors-headers.sh" ]; then
    echo "⚠️ Arquivo fix-cors-headers.sh encontrado localmente"
    echo "🗑️ Removendo arquivo local..."
    rm -f fix-cors-headers.sh
fi

if [ -f "GUIA_CORRECAO_CORS.md" ]; then
    echo "⚠️ Arquivo GUIA_CORRECAO_CORS.md encontrado localmente"
    echo "🗑️ Removendo arquivo local..."
    rm -f GUIA_CORRECAO_CORS.md
fi

echo ""
echo "🔄 Fazendo git pull..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Git pull realizado com sucesso!"
else
    echo "❌ Erro no git pull"
    echo "🔍 Verificando status do git..."
    git status
    exit 1
fi

echo ""
echo "🔧 Aplicando permissões de execução..."
chmod +x *.sh

echo ""
echo "🚀 Executando deploy com as correções..."
./deploy.sh

echo ""
echo "✅ Atualização concluída!"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):8080"
echo "   Backend API: http://$(hostname -I | awk '{print $1}'):5000/api"
echo ""
echo "🔐 Credenciais:"
echo "   Usuário: admin"
echo "   Senha: 123@mudar"
