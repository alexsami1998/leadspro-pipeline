#!/bin/bash

echo "🔥 Configurando Firewall da VM para acesso externo..."
echo "🌐 IP da VM: localhost"

# Verificar se o UFW está instalado
if ! command -v ufw &> /dev/null; then
    echo "📦 Instalando UFW..."
    sudo apt update
    sudo apt install -y ufw
fi

# Verificar status atual do UFW
echo "📊 Status atual do firewall:"
sudo ufw status

# Configurar regras para permitir acesso externo
echo "🔓 Configurando regras de firewall..."

# Permitir SSH (porta 22)
sudo ufw allow 22/tcp

# Permitir acesso ao backend (porta 5000)
sudo ufw allow 5000/tcp

# Permitir acesso ao frontend (porta 8080)
sudo ufw allow 8080/tcp

# Permitir acesso HTTP (porta 80) se usar nginx
sudo ufw allow 80/tcp

# Permitir acesso ao PostgreSQL se necessário (porta 5432)
# sudo ufw allow 5432/tcp

# Habilitar o firewall
echo "✅ Habilitando firewall..."
sudo ufw --force enable

# Mostrar status final
echo ""
echo "🎉 Firewall configurado com sucesso!"
echo ""
echo "📊 Regras ativas:"
sudo ufw status numbered

echo ""
echo "🌐 URLs de acesso externo:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5000/api"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - As portas 5000 e 8080 estão abertas para acesso externo"
echo "   - O firewall está ativo e protegendo a VM"
echo "   - Apenas as portas necessárias estão abertas"
echo ""
echo "🔧 Para verificar se as portas estão acessíveis:"
echo "   telnet localhost 5000"
echo "   telnet localhost 8080"
