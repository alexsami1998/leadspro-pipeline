#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
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

echo "🚀 Iniciando Sistema LeadPro Pipeline..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "web" ]; then
    error "Execute este script no diretório raiz do projeto LeadPro Pipeline"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar dependências do sistema
install_system_dependencies() {
    log "🔍 Verificando dependências do sistema..."
    
    # Verificar Node.js
    if ! command_exists node; then
        warning "Node.js não encontrado. Instalando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        NODE_VERSION=$(node --version)
        log "✅ Node.js encontrado: $NODE_VERSION"
    fi
    
    # Verificar npm
    if ! command_exists npm; then
        error "npm não encontrado. Instalando Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        NPM_VERSION=$(npm --version)
        log "✅ npm encontrado: $NPM_VERSION"
    fi
    
    # Verificar PostgreSQL
    if ! command_exists psql; then
        warning "PostgreSQL não encontrado. Instalando..."
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        log "✅ PostgreSQL encontrado"
    fi
    
    # Verificar Redis
    if ! command_exists redis-cli; then
        warning "Redis não encontrado. Instalando..."
        sudo apt install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    else
        log "✅ Redis encontrado"
    fi
    
    # Verificar Angular CLI
    if ! command_exists ng; then
        warning "Angular CLI não encontrado. Instalando globalmente..."
        sudo npm install -g @angular/cli
    else
        ANGULAR_VERSION=$(ng version --json | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)
        log "✅ Angular CLI encontrado: $ANGULAR_VERSION"
    fi
    
    # Verificar PM2
    if ! command_exists pm2; then
        warning "PM2 não encontrado. Instalando globalmente..."
        sudo npm install -g pm2
    else
        log "✅ PM2 encontrado"
    fi
}

# Função para instalar dependências do projeto
install_project_dependencies() {
    log "📦 Instalando dependências do projeto..."
    
    # Backend dependencies
    if [ ! -d "backend/node_modules" ]; then
        log "Instalando dependências do backend..."
        cd backend
        npm install
        if [ $? -eq 0 ]; then
            success "Dependências do backend instaladas"
        else
            error "Falha ao instalar dependências do backend"
            exit 1
        fi
        cd ..
    else
        log "✅ Dependências do backend já instaladas"
    fi
    
    # Frontend dependencies
    if [ ! -d "web/node_modules" ]; then
        log "Instalando dependências do frontend..."
        cd web
        npm install
        if [ $? -eq 0 ]; then
            success "Dependências do frontend instaladas"
        else
            error "Falha ao instalar dependências do frontend"
            exit 1
        fi
        cd ..
    else
        log "✅ Dependências do frontend já instaladas"
    fi
}

# Função para verificar e configurar banco de dados
setup_database() {
    log "🗄️ Verificando configuração do banco de dados..."
    
    # Verificar se o banco existe
    if ! psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw leadpro_database; then
        warning "Banco de dados não encontrado. Criando..."
        
        # Criar banco e usuário
        sudo -u postgres psql << EOF
CREATE DATABASE leadpro_database;
CREATE USER leadpro_user WITH PASSWORD 'leadpro123';
GRANT ALL PRIVILEGES ON DATABASE leadpro_database TO leadpro_user;
\q
EOF
        
        # Executar script de inicialização se existir
        if [ -f "setup_database.sql" ]; then
            log "Executando script de inicialização do banco..."
            psql -h localhost -U leadpro_user -d leadpro_database -f setup_database.sql
        fi
        
        success "Banco de dados configurado"
    else
        log "✅ Banco de dados já existe"
    fi
}

# Função para detectar IP da máquina
detect_ip() {
    local ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    
    if [ -z "$ip" ]; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    if [ -z "$ip" ]; then
        ip=$(ifconfig 2>/dev/null | grep -oP 'inet \K[0-9.]+' | grep -v '127.0.0.1' | head -1)
    fi
    
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    
    echo "$ip"
}

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função para aguardar uma porta ficar disponível
wait_for_port() {
    local port=$1
    local service=$2
    local timeout=30
    local count=0
    
    log "⏳ Aguardando $service na porta $port..."
    while ! check_port $port && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
    done
    
    if check_port $port; then
        success "$service está rodando na porta $port"
        return 0
    else
        error "$service não iniciou na porta $port após $timeout segundos"
        return 1
    fi
}

# Função para iniciar backend
start_backend() {
    log "🔧 Iniciando Backend..."
    
    if check_port 5000; then
        warning "Backend já está rodando na porta 5000"
        return 0
    fi
    
    cd backend
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    success "Backend iniciado (PID: $BACKEND_PID)"
    cd ..
    
    # Aguardar backend ficar disponível
    if wait_for_port 5000 "Backend"; then
        return 0
    else
        error "Falha ao iniciar backend"
        return 1
    fi
}

# Função para iniciar frontend
start_frontend() {
    log "🌐 Iniciando Frontend..."
    
    if check_port 4200; then
        warning "Frontend já está rodando na porta 4200"
        return 0
    fi
    
    cd web
    
    # Verificar se precisa recompilar
    if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
        log "Recompilando frontend..."
        npm run build
        if [ $? -ne 0 ]; then
            error "Falha ao recompilar frontend"
            return 1
        fi
    fi
    
    # Iniciar servidor de desenvolvimento
    nohup ng serve --host 0.0.0.0 --port 4200 --disable-host-check > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    success "Frontend iniciado (PID: $FRONTEND_PID)"
    cd ..
    
    # Aguardar frontend ficar disponível
    if wait_for_port 4200 "Frontend"; then
        return 0
    else
        error "Falha ao iniciar frontend"
        return 1
    fi
}

# Função para testar funcionalidades
test_system() {
    log "🧪 Testando funcionalidades do sistema..."
    
    # Testar backend
    if curl -s http://localhost:5000/api/health > /dev/null; then
        success "Backend respondendo corretamente"
    else
        warning "Backend pode não estar funcionando corretamente"
    fi
    
    # Testar frontend
    if curl -s http://localhost:4200 > /dev/null; then
        success "Frontend respondendo corretamente"
    else
        warning "Frontend pode não estar funcionando corretamente"
    fi
    
    # Testar exportação PDF
    if curl -s -X GET "http://localhost:5000/api/leads/export/pdf?filterType=all" -H "Accept: application/pdf" -o /tmp/test-pdf.pdf > /dev/null && [ -s /tmp/test-pdf.pdf ]; then
        success "Exportação PDF funcionando"
        rm -f /tmp/test-pdf.pdf
    else
        warning "Exportação PDF pode não estar funcionando"
    fi
}

# Executar instalação e configuração
install_system_dependencies
install_project_dependencies
setup_database

# Detectar IP da máquina
DETECTED_IP=$(detect_ip)
log "🌐 IP detectado: $DETECTED_IP"

# Iniciar serviços
if start_backend && start_frontend; then
    echo ""
    success "🎉 Sistema LeadPro iniciado com sucesso!"
    echo ""
    echo "📊 URLs de acesso local:"
    echo "   Frontend: http://localhost:4200"
    echo "   Backend API: http://localhost:5000/api"
    echo ""
    echo "🌐 URLs externas (acessíveis de qualquer dispositivo na rede):"
    echo "   Frontend: http://$DETECTED_IP:4200"
    echo "   Backend API: http://$DETECTED_IP:5000/api"
    echo ""
    echo "🔐 Credenciais de acesso:"
    echo "   Usuário: admin"
    echo "   Senha: 123@mudar"
    echo ""
    echo "📝 Logs disponíveis em:"
    echo "   Backend: logs/backend.log"
    echo "   Frontend: logs/frontend.log"
    echo ""
    echo "🛑 Para parar o sistema, execute: ./stop-system.sh"
    echo ""
    
    # Testar sistema
    test_system
    
else
    error "Falha ao iniciar o sistema. Verifique os logs para mais detalhes."
    exit 1
fi