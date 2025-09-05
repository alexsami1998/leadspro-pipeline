#!/bin/bash

echo "🚀 Instalação de Dependências - LeadPro"
echo "========================================"

# Detectar IP
DETECTED_IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectado: $DETECTED_IP"

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar Node.js
install_nodejs() {
    echo ""
    echo "📦 Instalando Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        echo "✅ Node.js já instalado: $NODE_VERSION"
        
        # Verificar se a versão é compatível (>= 18)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            echo "⚠️  Versão do Node.js muito antiga. Atualizando..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    else
        echo "📥 Baixando e instalando Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Verificar instalação
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo "✅ Node.js instalado: $NODE_VERSION"
    echo "✅ NPM instalado: $NPM_VERSION"
}

# Função para instalar Docker
install_docker() {
    echo ""
    echo "🐳 Instalando Docker..."
    
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        echo "✅ Docker já instalado: $DOCKER_VERSION"
    else
        echo "📥 Baixando e instalando Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        
        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER
        echo "✅ Usuário adicionado ao grupo docker"
    fi
    
    # Verificar instalação
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker instalado: $DOCKER_VERSION"
}

# Função para instalar Docker Compose
install_docker_compose() {
    echo ""
    echo "🐳 Instalando Docker Compose..."
    
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version)
        echo "✅ Docker Compose já instalado: $COMPOSE_VERSION"
    else
        echo "📥 Baixando e instalando Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Verificar instalação
        COMPOSE_VERSION=$(docker-compose --version)
        echo "✅ Docker Compose instalado: $COMPOSE_VERSION"
    fi
}

# Função para instalar Git
install_git() {
    echo ""
    echo "📋 Instalando Git..."
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        echo "✅ Git já instalado: $GIT_VERSION"
    else
        echo "📥 Instalando Git..."
        sudo apt update
        sudo apt install -y git
        echo "✅ Git instalado"
    fi
}

# Função para instalar dependências do sistema
install_system_dependencies() {
    echo ""
    echo "🔧 Instalando dependências do sistema..."
    
    # Atualizar lista de pacotes
    sudo apt update
    
    # Instalar dependências essenciais
    sudo apt install -y \
        curl \
        wget \
        unzip \
        build-essential \
        python3 \
        python3-pip \
        ca-certificates \
        gnupg \
        lsb-release \
        software-properties-common \
        apt-transport-https
    
    echo "✅ Dependências do sistema instaladas"
}

# Função para instalar dependências do backend
install_backend_dependencies() {
    echo ""
    echo "📦 Instalando dependências do Backend..."
    
    if [ -d "backend" ]; then
        cd backend
        
        # Verificar se package.json existe
        if [ -f "package.json" ]; then
            echo "📥 Instalando dependências Node.js do backend..."
            npm install
            
            # Verificar se Puppeteer foi instalado corretamente
            if npm list puppeteer >/dev/null 2>&1; then
                echo "✅ Puppeteer instalado com sucesso"
            else
                echo "⚠️  Instalando Puppeteer manualmente..."
                npm install puppeteer
            fi
            
            echo "✅ Dependências do backend instaladas"
        else
            echo "❌ package.json não encontrado no diretório backend"
        fi
        
        cd ..
    else
        echo "❌ Diretório backend não encontrado"
    fi
}

# Função para instalar dependências do frontend
install_frontend_dependencies() {
    echo ""
    echo "📦 Instalando dependências do Frontend..."
    
    if [ -d "web" ]; then
        cd web
        
        # Verificar se package.json existe
        if [ -f "package.json" ]; then
            echo "📥 Instalando dependências Node.js do frontend..."
            npm install
            
            # Verificar se Angular CLI foi instalado
            if npm list @angular/cli >/dev/null 2>&1; then
                echo "✅ Angular CLI instalado com sucesso"
            else
                echo "⚠️  Instalando Angular CLI globalmente..."
                sudo npm install -g @angular/cli
            fi
            
            echo "✅ Dependências do frontend instaladas"
        else
            echo "❌ package.json não encontrado no diretório web"
        fi
        
        cd ..
    else
        echo "❌ Diretório web não encontrado"
    fi
}

# Função para configurar permissões
setup_permissions() {
    echo ""
    echo "🔐 Configurando permissões..."
    
    # Dar permissão de execução aos scripts
    chmod +x *.sh
    
    # Configurar permissões do Docker
    if command_exists docker; then
        # Verificar se o usuário está no grupo docker
        if ! groups $USER | grep -q docker; then
            echo "⚠️  Adicionando usuário ao grupo docker..."
            sudo usermod -aG docker $USER
            echo "✅ Usuário adicionado ao grupo docker"
            echo "⚠️  IMPORTANTE: Faça logout e login novamente para aplicar as permissões do Docker"
        else
            echo "✅ Usuário já está no grupo docker"
        fi
    fi
    
    echo "✅ Permissões configuradas"
}

# Função para verificar instalação
verify_installation() {
    echo ""
    echo "🔍 Verificando instalação..."
    
    # Verificar Node.js
    if command_exists node; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js não instalado"
    fi
    
    # Verificar NPM
    if command_exists npm; then
        echo "✅ NPM: $(npm --version)"
    else
        echo "❌ NPM não instalado"
    fi
    
    # Verificar Docker
    if command_exists docker; then
        echo "✅ Docker: $(docker --version)"
    else
        echo "❌ Docker não instalado"
    fi
    
    # Verificar Docker Compose
    if command_exists docker-compose; then
        echo "✅ Docker Compose: $(docker-compose --version)"
    else
        echo "❌ Docker Compose não instalado"
    fi
    
    # Verificar Git
    if command_exists git; then
        echo "✅ Git: $(git --version)"
    else
        echo "❌ Git não instalado"
    fi
    
    # Verificar dependências do backend
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        if npm list puppeteer --prefix backend >/dev/null 2>&1; then
            echo "✅ Puppeteer (Backend): Instalado"
        else
            echo "❌ Puppeteer (Backend): Não instalado"
        fi
    fi
    
    # Verificar dependências do frontend
    if [ -d "web" ] && [ -f "web/package.json" ]; then
        if npm list @angular/cli --prefix web >/dev/null 2>&1; then
            echo "✅ Angular CLI (Frontend): Instalado"
        else
            echo "❌ Angular CLI (Frontend): Não instalado"
        fi
    fi
}

# Função principal
main() {
    echo "🚀 Iniciando instalação de dependências..."
    
    # Instalar dependências do sistema
    install_system_dependencies
    
    # Instalar Node.js
    install_nodejs
    
    # Instalar Docker
    install_docker
    
    # Instalar Docker Compose
    install_docker_compose
    
    # Instalar Git
    install_git
    
    # Instalar dependências do backend
    install_backend_dependencies
    
    # Instalar dependências do frontend
    install_frontend_dependencies
    
    # Configurar permissões
    setup_permissions
    
    # Verificar instalação
    verify_installation
    
    echo ""
    echo "🎉 Instalação de dependências concluída!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Faça logout e login novamente (para aplicar permissões do Docker)"
    echo "   2. Execute: ./deploy.sh"
    echo "   3. Acesse: http://$DETECTED_IP:8080"
    echo ""
    echo "🔐 Credenciais:"
    echo "   Usuário: admin"
    echo "   Senha: 123@mudar"
    echo ""
    echo "📝 Comandos úteis:"
    echo "   Deploy: ./deploy.sh"
    echo "   Deploy limpo: ./clean-deploy.sh"
    echo "   Testar PDF: ./test-pdf-export.sh"
    echo "   Ver status: docker-compose ps"
}

# Executar função principal
main
