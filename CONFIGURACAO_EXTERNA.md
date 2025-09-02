# 🌐 Configuração para Acesso Externo - LeadPro

Este documento descreve como configurar o sistema LeadPro para ser acessível externamente através do IP da VM: **191.96.251.155**

## 📋 Pré-requisitos

- VM com IP público: 191.96.251.155
- Node.js instalado
- Angular CLI instalado
- PostgreSQL configurado e rodando

## 🚀 Passos para Configuração

### 1. Configurar Firewall da VM

Execute o script de configuração do firewall:

```bash
./setup-firewall.sh
```

Este script irá:
- Instalar e configurar o UFW (Uncomplicated Firewall)
- Abrir as portas necessárias (3000 e 4200)
- Configurar regras de segurança

### 2. Iniciar o Sistema

#### Opção A: Modo de Desenvolvimento
```bash
./start-system.sh
```

#### Opção B: Modo de Produção (Recomendado para acesso externo)
```bash
./start-production.sh
```

## 🌐 URLs de Acesso

### URLs Locais (dentro da VM)
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api

### URLs Externas (acessíveis de qualquer dispositivo)
- **Frontend**: http://191.96.251.155:4200
- **Backend API**: http://191.96.251.155:3000/api

## 🔐 Credenciais de Acesso

- **Usuário**: admin
- **Senha**: 123@mudar

## 📊 Verificação de Funcionamento

### 1. Verificar se as portas estão abertas
```bash
sudo ufw status
```

### 2. Testar conectividade das portas
```bash
telnet 191.96.251.155 3000
telnet 191.96.251.155 4200
```

### 3. Verificar logs
```bash
# Logs do backend
tail -f logs/backend.log

# Logs do frontend
tail -f logs/frontend.log
```

## 🔧 Configurações Técnicas

### Backend (Node.js)
- **Porta**: 3000
- **Host**: 0.0.0.0 (aceita conexões de qualquer IP)
- **CORS**: Configurado para aceitar conexões do frontend

### Frontend (Angular)
- **Porta**: 4200
- **Host**: 0.0.0.0 (aceita conexões de qualquer IP)
- **API URL**: Configurada para apontar para 191.96.251.155:3000

## 🛡️ Segurança

- O firewall está configurado para permitir apenas as portas necessárias
- CORS está configurado para aceitar apenas origens específicas
- As credenciais padrão devem ser alteradas em produção

## 🚨 Solução de Problemas

### Problema: Não consigo acessar externamente
**Solução**: Verificar se o firewall está configurado corretamente
```bash
sudo ufw status
```

### Problema: Frontend não carrega
**Solução**: Verificar se o Angular está rodando com host 0.0.0.0
```bash
ps aux | grep ng
```

### Problema: API não responde
**Solução**: Verificar se o backend está rodando e aceitando conexões externas
```bash
netstat -tlnp | grep :3000
```

## 📞 Suporte

Para problemas técnicos, verifique:
1. Logs do sistema em `logs/`
2. Status do firewall: `sudo ufw status`
3. Status dos serviços: `ps aux | grep -E "(node|ng)"`

---

**⚠️ IMPORTANTE**: Sempre use HTTPS em produção para transmissão segura de dados!
