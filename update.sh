#!/bin/bash

echo "🔄 Atualizando LeadPro"
echo "======================"

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Este não é um repositório git!"
    echo "   Para atualizações automáticas, clone o repositório com git clone"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Há mudanças não commitadas no repositório local"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Atualização cancelada"
        exit 1
    fi
fi

# Fazer backup dos logs
echo "💾 Fazendo backup dos logs..."
if [ -d "logs" ]; then
    cp -r logs logs_backup_$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup dos logs criado"
fi

# Parar containers
echo "🛑 Parando containers..."
docker-compose down

# Atualizar código
echo "📥 Atualizando código do repositório..."
git pull origin main

# Verificar se houve mudanças
if [ $? -eq 0 ]; then
    echo "✅ Código atualizado com sucesso"
else
    echo "❌ Erro ao atualizar código"
    exit 1
fi

# Reconstruir e iniciar containers
echo "🔨 Reconstruindo containers..."
docker-compose up --build -d

# Aguardar containers ficarem prontos
echo "⏳ Aguardando containers ficarem prontos..."
sleep 15

# Verificar status
echo "📊 Verificando status dos containers..."
docker-compose ps

# Verificar saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."
sleep 5

# Testar backend
if curl -s -f http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend com problemas"
fi

# Testar frontend
if curl -s -f http://localhost:8080 > /dev/null; then
    echo "✅ Frontend funcionando"
else
    echo "❌ Frontend com problemas"
fi

echo ""
echo "🎉 Atualização concluída!"
echo ""
echo "📝 Para ver logs: docker-compose logs -f"
echo "📝 Para parar: docker-compose down"
