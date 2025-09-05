# 🐳 Guia Docker - LeadPro

## 📋 Deploy Completo com Docker

### 🎯 **Vantagens da Solução Docker**
- ✅ **Isolamento completo** - Sistema independente
- ✅ **Portabilidade** - Funciona em qualquer VM/servidor
- ✅ **Facilidade de deploy** - Um comando para subir tudo
- ✅ **Atualizações simples** - Script automatizado
- ✅ **Escalabilidade** - Fácil de expandir
- ✅ **Profissional** - Estrutura de produção

---

## 🚀 **Deploy Inicial na VM**

### 1️⃣ **Pré-requisitos**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 2️⃣ **Clonar e Deploy**
```bash
# Clonar repositório
git clone https://github.com/alexsami1998/leadspro-pipeline.git
cd leadspro-pipeline

# Deploy automático
./deploy.sh
```

### 3️⃣ **Acessar Sistema**
- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

---

## 🔄 **Atualizações do Sistema**

### **Atualização Automática**
```bash
# Atualizar código e reiniciar containers
./update.sh
```

### **Atualização Manual**
```bash
# 1. Parar sistema
docker-compose down

# 2. Atualizar código
git pull origin main

# 3. Reconstruir e iniciar
docker-compose up --build -d
```

---

## 🛠️ **Comandos de Gerenciamento**

### **Controle do Sistema**
```bash
# Iniciar sistema
docker-compose up -d

# Parar sistema
docker-compose down

# Reiniciar sistema
docker-compose restart

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Manutenção**
```bash
# Limpar containers parados
docker system prune

# Limpar imagens não utilizadas
docker image prune

# Ver uso de recursos
docker stats

# Backup dos logs
cp -r logs logs_backup_$(date +%Y%m%d_%H%M%S)
```

---

## 📁 **Estrutura Docker**

```
leadspro-pipeline/
├── docker-compose.yml          # Orquestração dos containers
├── deploy.sh                   # Script de deploy
├── update.sh                   # Script de atualização
├── .dockerignore               # Arquivos ignorados no build
├── backend/
│   ├── Dockerfile              # Imagem do backend
│   ├── server.js               # Servidor Node.js
│   └── package.json            # Dependências
├── web/
│   ├── Dockerfile              # Imagem do frontend
│   ├── nginx.conf              # Configuração nginx
│   └── src/                    # Código Angular
└── logs/                       # Logs do sistema
```

---

## 🌐 **Configuração de Rede**

### **Portas Utilizadas**
- **8080** - Frontend (nginx)
- **5000** - Backend (Node.js)

### **Firewall (se necessário)**
```bash
# Abrir portas
sudo ufw allow 8080
sudo ufw allow 5000
sudo ufw reload
```

---

## 🔧 **Configurações Avançadas**

### **Variáveis de Ambiente**
Edite o `docker-compose.yml` para alterar:
```yaml
environment:
  - DB_HOST=seu_host
  - DB_PORT=5432
  - DB_NAME=seu_banco
  - DB_USER=seu_usuario
  - DB_PASSWORD=sua_senha
```

### **Volumes Persistentes**
```yaml
volumes:
  - ./logs:/app/logs          # Logs persistentes
  - ./uploads:/app/uploads    # Uploads persistentes
```

---

## 🚨 **Solução de Problemas**

### **Container não inicia**
```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend

# Verificar status
docker-compose ps

# Reconstruir sem cache
docker-compose build --no-cache
```

### **Problema de permissões**
```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod +x *.sh
```

### **Porta em uso**
```bash
# Verificar processos
sudo lsof -i:8080
sudo lsof -i:5000

# Matar processo
sudo kill -9 [PID]
```

### **Problema de memória**
```bash
# Limpar sistema Docker
docker system prune -a

# Verificar uso
docker stats
```

---

## 📊 **Monitoramento**

### **Health Checks**
```bash
# Verificar saúde dos serviços
curl http://localhost:5000/api/health
curl http://localhost:8080

# Status dos containers
docker-compose ps
```

### **Logs em Tempo Real**
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

---

## 🔐 **Segurança**

### **Configurações de Produção**
1. **Alterar credenciais padrão**
2. **Configurar HTTPS** (nginx + SSL)
3. **Restringir acesso por IP**
4. **Backup regular dos dados**

### **Backup**
```bash
# Backup completo
tar -czf leadpro_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  .
```

---

## 🎯 **Resumo dos Comandos Essenciais**

| Comando | Função |
|---------|--------|
| `./deploy.sh` | Deploy inicial completo |
| `./update.sh` | Atualizar sistema |
| `docker-compose up -d` | Iniciar sistema |
| `docker-compose down` | Parar sistema |
| `docker-compose logs -f` | Ver logs |
| `docker-compose ps` | Ver status |

---

## ✅ **Checklist de Deploy**

- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Repositório clonado
- [ ] `./deploy.sh` executado
- [ ] Sistema acessível via IP:8080
- [ ] Login funcionando
- [ ] Upload de mídia funcionando
- [ ] Todas as funcionalidades testadas

---

**Sistema desenvolvido por MW Soluções** 🚀
