#!/bin/bash

echo "🌐 Configurando Nginx como Proxy Reverso para LeadPro..."
echo "🌐 IP da VM: 191.96.251.155"

# Verificar se o nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Fazer backup da configuração atual
if [ -f /etc/nginx/sites-available/default ]; then
    echo "💾 Fazendo backup da configuração atual..."
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
fi

# Copiar configuração personalizada
echo "⚙️  Aplicando configuração personalizada..."
sudo cp nginx-leadpro.conf /etc/nginx/sites-available/leadpro

# Remover configuração padrão e ativar a nova
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/leadpro /etc/nginx/sites-enabled/

# Testar configuração
echo "🔍 Testando configuração do Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do Nginx está válida!"
    
    # Recarregar nginx
    echo "🔄 Recarregando Nginx..."
    sudo systemctl reload nginx
    
    # Habilitar nginx para iniciar automaticamente
    sudo systemctl enable nginx
    
    echo ""
    echo "🎉 Nginx configurado com sucesso!"
    echo ""
    echo "📊 URLs de acesso:"
    echo "   Frontend: http://191.96.251.155"
    echo "   Backend API: http://191.96.251.155/api"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - O Nginx está servindo na porta 80"
    echo "   - Certifique-se de abrir a porta 80 no firewall"
    echo "   - Execute: sudo ufw allow 80"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   sudo systemctl status nginx    - Status do Nginx"
    echo "   sudo systemctl restart nginx   - Reiniciar Nginx"
    echo "   sudo nginx -t                  - Testar configuração"
    echo "   sudo tail -f /var/log/nginx/access.log  - Ver logs de acesso"
    echo "   sudo tail -f /var/log/nginx/error.log   - Ver logs de erro"
else
    echo "❌ Erro na configuração do Nginx!"
    echo "Verifique o arquivo de configuração e tente novamente."
    exit 1
fi
