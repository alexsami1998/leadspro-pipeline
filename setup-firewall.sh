#!/bin/bash

echo "🛡️  Configurando firewall para o LeadPro..."

# Verificar se o usuário tem permissões de sudo
if ! sudo -n true 2>/dev/null; then
    echo "❌ Este script precisa ser executado com sudo ou com permissões de administrador"
    echo "   Execute: sudo ./setup-firewall.sh"
    exit 1
fi

# Verificar se UFW está disponível
if command -v ufw >/dev/null 2>&1; then
    echo "🔧 Configurando UFW..."
    
    # Habilitar UFW se não estiver ativo
    if ! ufw status | grep -q "Status: active"; then
        echo "   Habilitando UFW..."
        ufw --force enable
    fi
    
    # Permitir portas do LeadPro
    echo "   Permitindo porta 5000 (Backend)..."
    ufw allow 5000/tcp
    
    echo "   Permitindo porta 8080 (Frontend)..."
    ufw allow 8080/tcp
    
    # Permitir SSH (importante para não perder acesso)
    echo "   Permitindo SSH..."
    ufw allow ssh
    
    echo "   Recarregando regras..."
    ufw reload
    
    echo "✅ UFW configurado com sucesso!"
    
elif command -v iptables >/dev/null 2>&1; then
    echo "🔧 Configurando iptables..."
    
    # Permitir portas do LeadPro
    echo "   Permitindo porta 5000 (Backend)..."
    iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
    
    echo "   Permitindo porta 8080 (Frontend)..."
    iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
    
    echo "✅ iptables configurado!"
    echo "⚠️  Lembre-se de salvar as regras do iptables para persistir após reinicialização"
    
else
    echo "⚠️  Nenhum firewall detectado (UFW ou iptables)"
    echo "   As portas podem já estar abertas por padrão"
fi

echo ""
echo "🌐 URLs de acesso após configuração:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):8080"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):5000/api"
echo ""
echo "✅ Configuração de firewall concluída!"