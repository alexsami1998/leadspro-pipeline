#!/bin/bash

# Script de Deploy Automatizado - LeadPro Pipeline
# Este script automatiza o processo de deploy após git pull

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "web" ]; then
    error "Execute este script no diretório raiz do projeto LeadPro Pipeline"
    exit 1
fi

log "🚀 Iniciando processo de deploy..."

# 1. Parar sistema atual
log "⏹️  Parando sistema atual..."
if [ -f "stop-system.sh" ]; then
    ./stop-system.sh
else
    warning "Script stop-system.sh não encontrado, tentando parar processos manualmente..."
    pkill -f "node.*server.js" || true
    pkill -f "ng.*serve" || true
fi

# Aguardar um pouco para os processos pararem
sleep 3

# 2. Verificar se não há processos rodando
log "🔍 Verificando processos..."
RUNNING_PROCESSES=$(ps aux | grep -E "(node.*server\.js|ng.*serve)" | grep -v grep | wc -l)
if [ $RUNNING_PROCESSES -gt 0 ]; then
    warning "Ainda há $RUNNING_PROCESSES processos rodando. Tentando forçar parada..."
    pkill -9 -f "node.*server.js" || true
    pkill -9 -f "ng.*serve" || true
    sleep 2
fi

# 3. Fazer backup do banco (opcional)
log "💾 Fazendo backup do banco de dados..."
if command -v pg_dump &> /dev/null; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    if pg_dump -h localhost -U postgres -d leadpro_database > "$BACKUP_FILE" 2>/dev/null; then
        success "Backup salvo como: $BACKUP_FILE"
    else
        warning "Não foi possível fazer backup do banco (pode não estar configurado)"
    fi
else
    warning "pg_dump não encontrado, pulando backup"
fi

# 4. Atualizar código
log "📥 Atualizando código via git pull..."
if git pull origin main; then
    success "Código atualizado com sucesso"
else
    error "Falha ao fazer git pull"
    exit 1
fi

# 5. Instalar dependências do backend
log "📦 Instalando dependências do backend..."
cd backend
if npm install; then
    success "Dependências do backend instaladas"
else
    error "Falha ao instalar dependências do backend"
    exit 1
fi
cd ..

# 6. Instalar dependências do frontend
log "📦 Instalando dependências do frontend..."
cd web
if npm install; then
    success "Dependências do frontend instaladas"
else
    error "Falha ao instalar dependências do frontend"
    exit 1
fi

# 7. Limpar cache
log "🧹 Limpando cache..."
rm -rf .angular/cache 2>/dev/null || true
cd ..

# 8. Limpar logs antigos
log "🧹 Limpando logs antigos..."
rm -f logs/*.log logs/*.pid 2>/dev/null || true
rm -f system-logs.log 2>/dev/null || true

# 9. Recompilar frontend
log "🔨 Recompilando frontend..."
cd web
if npm run build; then
    success "Frontend recompilado com sucesso"
else
    error "Falha ao recompilar frontend"
    exit 1
fi
cd ..

# 10. Iniciar sistema
log "▶️  Iniciando sistema..."
if [ -f "start-system.sh" ]; then
    ./start-system.sh
else
    warning "Script start-system.sh não encontrado, iniciando manualmente..."
    
    # Iniciar backend
    cd backend
    nohup npm start > ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid
    cd ..
    
    # Iniciar frontend
    cd web
    nohup npm start > ../logs/frontend.log 2>&1 &
    echo $! > ../logs/frontend.pid
    cd ..
fi

# Aguardar sistema inicializar
log "⏳ Aguardando sistema inicializar..."
sleep 10

# 11. Verificar se está funcionando
log "🔍 Verificando se os serviços estão funcionando..."

# Verificar backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    success "Backend está funcionando (porta 5000)"
else
    error "Backend não está respondendo na porta 5000"
    warning "Verifique os logs: tail -f logs/backend.log"
fi

# Verificar frontend
if curl -s http://localhost:4200 > /dev/null; then
    success "Frontend está funcionando (porta 4200)"
else
    error "Frontend não está respondendo na porta 4200"
    warning "Verifique os logs: tail -f logs/frontend.log"
fi

# 12. Testar funcionalidade crítica (PDF)
log "🧪 Testando funcionalidade de exportação PDF..."
if curl -s -X GET "http://localhost:5000/api/leads/export/pdf?filterType=all" -H "Accept: application/pdf" -o /tmp/test-pdf.pdf && [ -s /tmp/test-pdf.pdf ]; then
    success "Exportação PDF funcionando corretamente"
    rm -f /tmp/test-pdf.pdf
else
    warning "Exportação PDF pode não estar funcionando corretamente"
fi

# 13. Mostrar status final
log "📊 Status final do sistema:"
echo "Processos rodando:"
ps aux | grep -E "(node.*server\.js|ng.*serve)" | grep -v grep || echo "Nenhum processo encontrado"

echo ""
echo "Portas em uso:"
ss -tlnp | grep -E "(3000|4200|5000)" || echo "Nenhuma porta encontrada"

echo ""
echo "Logs disponíveis:"
ls -la logs/ 2>/dev/null || echo "Diretório de logs não encontrado"

success "🎉 Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o sistema em: http://localhost:4200"
echo "2. Verifique os logs se houver problemas: tail -f logs/backend.log"
echo "3. Teste a funcionalidade de exportação PDF"
echo ""
echo "📞 Em caso de problemas, consulte o MANUAL_DEPLOY_VM.md"
