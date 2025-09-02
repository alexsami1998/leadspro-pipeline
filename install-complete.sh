#!/bin/bash

echo "🚀 Instalação Completa do Sistema LeadPro"
echo "=========================================="
echo "🌐 Configurando para acesso externo via IP: 191.96.251.155"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_error "Não execute este script como root!"
    exit 1
fi

# Atualizar sistema
print_status "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
print_status "Instalando dependências básicas..."
sudo apt install -y curl wget git build-essential

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_status "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_success "Node.js já está instalado: $(node --version)"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não está disponível!"
    exit 1
else
    print_success "npm já está instalado: $(npm --version)"
fi

# Instalar Angular CLI
if ! command -v ng &> /dev/null; then
    print_status "Instalando Angular CLI..."
    sudo npm install -g @angular/cli
else
    print_success "Angular CLI já está instalado: $(ng version | head -n 1)"
fi

# Instalar PM2
if ! command -v pm2 &> /dev/null; then
    print_status "Instalando PM2..."
    sudo npm install -g pm2
else
    print_success "PM2 já está instalado: $(pm2 --version)"
fi

# Instalar dependências do projeto
print_status "Instalando dependências do projeto..."
npm install

# Configurar firewall
print_status "Configurando firewall..."
./setup-firewall.sh

# Perguntar se quer configurar nginx
echo ""
read -p "Deseja configurar o Nginx como proxy reverso? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Configurando Nginx..."
    ./setup-nginx.sh
fi

# Configurar PM2 para iniciar automaticamente
print_status "Configurando PM2 para iniciar automaticamente..."
pm2 startup

echo ""
print_success "🎉 Instalação completa finalizada!"
echo ""
echo "📋 Próximos passos:"
echo "1. Iniciar o sistema: ./start-pm2.sh"
echo "2. Ou usar modo tradicional: ./start-system.sh"
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://191.96.251.155:4200"
echo "   Backend API: http://191.96.251.155:3000/api"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Com Nginx: http://191.96.251.155"
fi
echo ""
echo "🔐 Credenciais: admin / 123@mudar"
echo ""
echo "📚 Documentação: CONFIGURACAO_EXTERNA.md"
