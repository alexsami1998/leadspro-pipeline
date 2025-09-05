# 🚀 LeadPro Pipeline - Sistema de Gestão de Leads

Sistema completo de gestão de leads com backend Node.js, frontend Angular e banco PostgreSQL.

## 📋 **Pré-requisitos**

- Docker
- Docker Compose
- Git

## 🚀 **Instalação e Deploy**

### **1. Clonar o Repositório**
```bash
git clone https://github.com/alexsami1998/leadspro-pipeline.git
cd leadspro-pipeline
```

### **2. Deploy Automático**
```bash
chmod +x *.sh
./deploy-clean.sh
```

### **3. Acessar o Sistema**
- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

## 🔧 **Comandos de Gerenciamento**

| Ação | Comando |
|------|---------|
| **Deploy completo** | `./deploy-clean.sh` |
| **Ver status** | `docker-compose ps` |
| **Ver logs** | `docker-compose logs -f` |
| **Parar sistema** | `docker-compose down` |
| **Iniciar sistema** | `docker-compose up -d` |
| **Reiniciar** | `docker-compose restart` |

## 🔄 **Atualizações**

### **Atualizar Sistema**
```bash
# 1. Atualizar código
git pull origin main

# 2. Deploy com correções
./deploy-clean.sh
```

## 🏗️ **Arquitetura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Angular)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 8080    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Estrutura do Projeto**

```
leadspro-pipeline/
├── backend/                 # Backend Node.js
│   ├── server.js           # Servidor principal
│   ├── services/           # Serviços (Redis, etc.)
│   └── Dockerfile          # Container do backend
├── web/                    # Frontend Angular
│   ├── src/                # Código fonte Angular
│   ├── Dockerfile          # Container do frontend
│   └── nginx.conf          # Configuração Nginx
├── docker-compose.yml      # Orquestração dos containers
├── deploy-clean.sh         # Script de deploy
└── README.md              # Este arquivo
```

## 🛠️ **Tecnologias**

- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Frontend**: Angular, TypeScript, SCSS
- **Containerização**: Docker, Docker Compose
- **Web Server**: Nginx

## 🔐 **Configuração do Banco**

O sistema está configurado para usar um banco PostgreSQL externo:
- **Host**: 72.60.144.80
- **Port**: 5432
- **Database**: pipeline
- **User**: postgres

## 🆘 **Solução de Problemas**

### **Problema: Frontend mostra página padrão do Nginx**
```bash
# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### **Problema: Erro CORS**
```bash
# Reconstruir backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### **Problema: Containers não param**
```bash
# Forçar parada
docker-compose down --remove-orphans
docker container prune -f
```

## 📞 **Suporte**

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs -f`
2. Execute o deploy limpo: `./deploy-clean.sh`
3. Verifique o status: `docker-compose ps`

---

**Sistema LeadPro - Gestão de Leads Profissional** 🚀