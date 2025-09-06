#!/bin/bash

# Script de Instalação Completa - LeadPro Pipeline
# Este script instala todas as dependências necessárias do zero

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

echo "🚀 Instalação Completa do LeadPro Pipeline"
echo "=========================================="

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    error "Não execute este script como root. Use um usuário normal com sudo."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "web" ]; then
    error "Execute este script no diretório raiz do projeto LeadPro Pipeline"
    exit 1
fi

# Função para instalar dependências do sistema
install_system_dependencies() {
    log "🔧 Instalando dependências do sistema..."
    
    # Atualizar sistema
    log "Atualizando lista de pacotes..."
    sudo apt update
    
    # Instalar dependências básicas
    log "Instalando dependências básicas..."
    sudo apt install -y curl wget git build-essential software-properties-common
    
    # Instalar Node.js 18+
    log "Instalando Node.js 18+..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verificar instalação do Node.js
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    success "Node.js instalado: $NODE_VERSION"
    success "npm instalado: $NPM_VERSION"
    
    # Instalar PostgreSQL
    log "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    
    # Configurar PostgreSQL
    log "Configurando PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Instalar Redis
    log "Instalando Redis..."
    sudo apt install -y redis-server
    
    # Configurar Redis
    log "Configurando Redis..."
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Instalar Nginx (opcional)
    log "Instalando Nginx..."
    sudo apt install -y nginx
    
    # Instalar PM2 globalmente
    log "Instalando PM2..."
    sudo npm install -g pm2
    
    # Instalar Angular CLI globalmente
    log "Instalando Angular CLI..."
    sudo npm install -g @angular/cli
    
    success "Todas as dependências do sistema foram instaladas"
}

# Função para configurar banco de dados
setup_database() {
    log "🗄️ Configurando banco de dados..."
    
    # Criar banco e usuário
    log "Criando banco de dados e usuário..."
    sudo -u postgres psql << EOF
CREATE DATABASE leadpro_database;
CREATE USER leadpro_user WITH PASSWORD 'leadpro123';
GRANT ALL PRIVILEGES ON DATABASE leadpro_database TO leadpro_user;
ALTER USER leadpro_user CREATEDB;
\q
EOF
    
    # Executar script de inicialização se existir
    if [ -f "setup_database.sql" ]; then
        log "Executando script de inicialização do banco..."
        psql -h localhost -U leadpro_user -d leadpro_database -f setup_database.sql
    fi
    
    success "Banco de dados configurado"
}

# Função para instalar dependências do projeto
install_project_dependencies() {
    log "📦 Instalando dependências do projeto..."
    
    # Backend dependencies
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
    
    # Frontend dependencies
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
}

# Função para configurar Nginx
setup_nginx() {
    log "🌐 Configurando Nginx..."
    
    # Copiar configuração do Nginx
    if [ -f "nginx-leadpro.conf" ]; then
        sudo cp nginx-leadpro.conf /etc/nginx/sites-available/leadpro
        sudo ln -sf /etc/nginx/sites-available/leadpro /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Testar configuração
        sudo nginx -t
        if [ $? -eq 0 ]; then
            sudo systemctl reload nginx
            success "Nginx configurado"
        else
            warning "Configuração do Nginx pode ter problemas"
        fi
    else
        warning "Arquivo nginx-leadpro.conf não encontrado"
    fi
}

# Função para configurar firewall
setup_firewall() {
    log "🔥 Configurando firewall..."
    
    # Verificar se ufw está disponível
    if command -v ufw >/dev/null 2>&1; then
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw allow 443/tcp   # HTTPS
        sudo ufw allow 4200/tcp  # Frontend
        sudo ufw allow 5000/tcp  # Backend
        sudo ufw --force enable
        success "Firewall configurado"
    else
        warning "UFW não encontrado, pulando configuração do firewall"
    fi
}

# Função para criar scripts de sistema
create_system_scripts() {
    log "📝 Criando scripts do sistema..."
    
    # Tornar scripts executáveis
    chmod +x *.sh
    
    # Criar script de inicialização do sistema
    cat > /tmp/leadpro.service << EOF
[Unit]
Description=LeadPro Pipeline
After=network.target postgresql.service redis.service

[Service]
Type=forking
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/start-system.sh
ExecStop=$(pwd)/stop-system.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    # Instalar serviço do sistema (opcional)
    if [ "$1" = "--install-service" ]; then
        sudo cp /tmp/leadpro.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable leadpro
        success "Serviço do sistema instalado"
    fi
    
    rm -f /tmp/leadpro.service
}

# Função para testar instalação
test_installation() {
    log "🧪 Testando instalação..."
    
    # Verificar Node.js
    if command -v node >/dev/null 2>&1; then
        success "Node.js: $(node --version)"
    else
        error "Node.js não encontrado"
    fi
    
    # Verificar npm
    if command -v npm >/dev/null 2>&1; then
        success "npm: $(npm --version)"
    else
        error "npm não encontrado"
    fi
    
    # Verificar PostgreSQL
    if command -v psql >/dev/null 2>&1; then
        success "PostgreSQL: $(psql --version | head -1)"
    else
        error "PostgreSQL não encontrado"
    fi
    
    # Verificar Redis
    if command -v redis-cli >/dev/null 2>&1; then
        success "Redis: $(redis-cli --version)"
    else
        error "Redis não encontrado"
    fi
    
    # Verificar Angular CLI
    if command -v ng >/dev/null 2>&1; then
        success "Angular CLI: $(ng version --json | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)"
    else
        error "Angular CLI não encontrado"
    fi
    
    # Verificar PM2
    if command -v pm2 >/dev/null 2>&1; then
        success "PM2: $(pm2 --version)"
    else
        error "PM2 não encontrado"
    fi
}

# Função principal
main() {
    echo ""
    log "Iniciando instalação completa..."
    echo ""
    
    # Instalar dependências do sistema
    install_system_dependencies
    
    # Configurar banco de dados
    setup_database
    
    # Instalar dependências do projeto
    install_project_dependencies
    
    # Configurar Nginx
    setup_nginx
    
    # Configurar firewall
    setup_firewall
    
    # Criar scripts do sistema
    create_system_scripts "$@"
    
    # Testar instalação
    test_installation
    
    echo ""
    success "🎉 Instalação completa finalizada!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Execute: ./start-system.sh"
    echo "2. Acesse: http://localhost:4200"
    echo "3. Login: admin / 123@mudar"
    echo ""
    echo "📝 Scripts disponíveis:"
    echo "  ./start-system.sh  - Iniciar sistema"
    echo "  ./stop-system.sh   - Parar sistema"
    echo "  ./deploy-update.sh - Atualizar sistema"
    echo ""
    echo "📞 Em caso de problemas, consulte o MANUAL_DEPLOY_VM.md"
    echo ""
}

# Executar função principal
main "$@"