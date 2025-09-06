# 🚀 Instalação Rápida - LeadPro Pipeline

## ⚡ Instalação em 2 Passos

### 1️⃣ Instalação Completa (Primeira vez)
```bash
# Clonar o repositório
git clone https://github.com/alexsami1998/leadspro-pipeline.git
cd leadspro-pipeline

# Instalar tudo automaticamente
./install-complete.sh
```

### 2️⃣ Iniciar o Sistema
```bash
# Iniciar sistema (instala dependências se necessário)
./start-system.sh
```

## 🎯 Acesso ao Sistema

- **URL:** http://localhost:4200
- **Login:** admin
- **Senha:** 123@mudar

## 📋 O que o Script Faz Automaticamente

### `install-complete.sh` (Executar apenas uma vez)
- ✅ Instala Node.js 18+
- ✅ Instala PostgreSQL
- ✅ Instala Redis
- ✅ Instala Nginx
- ✅ Instala Angular CLI
- ✅ Instala PM2
- ✅ Configura banco de dados
- ✅ Instala dependências do projeto
- ✅ Configura firewall
- ✅ Cria scripts do sistema

### `start-system.sh` (Executar sempre que quiser iniciar)
- ✅ Verifica se dependências estão instaladas
- ✅ Instala dependências se necessário
- ✅ Configura banco se necessário
- ✅ Inicia backend (porta 5000)
- ✅ Inicia frontend (porta 4200)
- ✅ Testa funcionalidades
- ✅ Mostra URLs de acesso

## 🛠️ Scripts Disponíveis

```bash
# Instalação completa (primeira vez)
./install-complete.sh

# Iniciar sistema
./start-system.sh

# Parar sistema
./stop-system.sh

# Atualizar sistema (após git pull)
./deploy-update.sh
```

## 🔧 Configuração Manual (Se Necessário)

### Banco de Dados
```bash
# Criar banco manualmente
sudo -u postgres psql
CREATE DATABASE leadpro_database;
CREATE USER leadpro_user WITH PASSWORD 'leadpro123';
GRANT ALL PRIVILEGES ON DATABASE leadpro_database TO leadpro_user;
\q
```

### Dependências do Projeto
```bash
# Backend
cd backend && npm install

# Frontend
cd web && npm install && npm run build
```

## 🚨 Solução de Problemas

### Erro: "Permission denied"
```bash
chmod +x *.sh
```

### Erro: "Command not found"
```bash
# Reinstalar dependências
./install-complete.sh
```

### Erro: "Port already in use"
```bash
# Parar sistema
./stop-system.sh

# Verificar processos
ps aux | grep -E "(node|ng)" | grep -v grep

# Matar processos se necessário
pkill -f "node.*server.js"
pkill -f "ng.*serve"
```

### Erro: "Database connection failed"
```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar status
sudo systemctl status postgresql
```

## 📊 Verificar se Está Funcionando

```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:4200

# Exportação PDF
curl -X GET "http://localhost:5000/api/leads/export/pdf?filterType=all" -o test.pdf
```

## 🌐 Acesso Externo

Para acessar de outros dispositivos na rede:
- **Frontend:** http://SEU_IP:4200
- **Backend:** http://SEU_IP:5000/api

## 📝 Logs

```bash
# Ver logs em tempo real
tail -f logs/backend.log
tail -f logs/frontend.log

# Ver logs do sistema
journalctl -u postgresql -f
journalctl -u redis -f
```

## 🔄 Atualizações Futuras

```bash
# Fazer pull das atualizações
git pull origin main

# Deploy automático
./deploy-update.sh
```

---

**🎉 Pronto! O sistema está configurado e funcionando!**

Para mais detalhes, consulte:
- `MANUAL_DEPLOY_VM.md` - Manual completo
- `CORRECOES_PDF_EXPORT.md` - Correções realizadas
