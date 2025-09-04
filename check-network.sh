#!/bin/bash

echo "🔍 Verificando configuração de rede..."

# Função para detectar IP da máquina
detect_ip() {
    # Tentar detectar IP da interface principal
    local ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    
    # Fallback para outros métodos
    if [ -z "$ip" ]; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    if [ -z "$ip" ]; then
        ip=$(ifconfig 2>/dev/null | grep -oP 'inet \K[0-9.]+' | grep -v '127.0.0.1' | head -1)
    fi
    
    # Se ainda não encontrou, usar localhost
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    
    echo "$ip"
}

# Detectar IP
DETECTED_IP=$(detect_ip)

echo "🌐 IP detectado: $DETECTED_IP"
echo ""

# Verificar interfaces de rede
echo "📡 Interfaces de rede disponíveis:"
ip addr show | grep -E "inet [0-9]" | grep -v "127.0.0.1" | while read line; do
    echo "   $line"
done
echo ""

# Verificar se as portas estão abertas
echo "🔌 Verificando portas do sistema:"
echo "   Porta 5000 (Backend): $(lsof -i:5000 2>/dev/null | wc -l) processos"
echo "   Porta 8080 (Frontend): $(lsof -i:8080 2>/dev/null | wc -l) processos"
echo ""

# Verificar firewall (se disponível)
if command -v ufw >/dev/null 2>&1; then
    echo "🛡️  Status do UFW:"
    ufw status | head -5
    echo ""
fi

if command -v iptables >/dev/null 2>&1; then
    echo "🛡️  Regras do iptables (portas 5000 e 8080):"
    iptables -L | grep -E "(5000|8080)" || echo "   Nenhuma regra específica encontrada"
    echo ""
fi

# URLs de acesso
echo "🌐 URLs de acesso:"
echo "   Local:"
echo "     Frontend: http://localhost:8080"
echo "     Backend:  http://localhost:5000/api"
echo ""
echo "   Rede:"
echo "     Frontend: http://$DETECTED_IP:8080"
echo "     Backend:  http://$DETECTED_IP:5000/api"
echo ""

# Instruções para abrir portas no firewall
echo "🔧 Para permitir acesso externo, execute:"
echo "   sudo ufw allow 5000"
echo "   sudo ufw allow 8080"
echo "   sudo ufw reload"
echo ""

echo "✅ Verificação concluída!"
