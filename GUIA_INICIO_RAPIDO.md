# 🚀 Guia de Início Rápido - LeadPro

## 📋 Procedimento Completo após Clonar o Repositório

### 1️⃣ **Instalar Dependências**

```bash
# Backend
cd backend
npm install

# Frontend (Angular)
cd ../web
npm install

# Voltar para a raiz
cd ..
```

### 2️⃣ **Configurar Banco de Dados (se necessário)**

Se for a primeira execução, execute o script de inicialização do banco:

```bash
# Conectar ao PostgreSQL e executar o script
psql -h 72.60.144.80 -U postgres -d pipeline -f web/leadpro_database.sql
```

### 3️⃣ **Iniciar o Sistema**

```bash
# Iniciar ambos os serviços (Backend + Frontend)
./start-system.sh
```

### 4️⃣ **Testar Acesso Externo**

```bash
# Testar se o acesso externo está funcionando
./test-external-access.sh
```

### 5️⃣ **Configurar Acesso Externo (Opcional)**

Para permitir acesso de outros dispositivos na rede:

```bash
# Verificar configuração de rede
./check-network.sh

# Configurar firewall (requer sudo)
sudo ./setup-firewall.sh
```

### 6️⃣ **Acessar o Sistema**

Após iniciar, você verá as URLs de acesso:

- **Local**: `http://localhost:8080`
- **Rede**: `http://[IP_DA_VM]:8080`

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `123@mudar`

---

## 🔧 Comandos Úteis

### Iniciar Sistema
```bash
./start-system.sh
```

### Parar Sistema
```bash
./stop-system.sh
```

### Verificar Conectividade
```bash
./test-connectivity.sh
```

### Verificar Rede
```bash
./check-network.sh
```

### Configurar Firewall
```bash
sudo ./setup-firewall.sh
```

---

## 📁 Estrutura do Projeto

```
leadspro-pipeline/
├── backend/              # Servidor Node.js
│   ├── server.js         # Servidor principal
│   ├── package.json      # Dependências do backend
│   └── services/         # Serviços (Redis, etc.)
├── web/                  # Frontend Angular
│   ├── src/              # Código fonte Angular
│   ├── package.json      # Dependências do frontend
│   └── leadpro_database.sql # Script do banco
├── logs/                 # Logs do sistema
├── config.js             # Configurações
├── start-system.sh       # Script de início
├── stop-system.sh        # Script de parada
└── README.md             # Documentação
```

---

## ⚠️ Solução de Problemas

### Erro de CORS (Cross-Origin Request Blocked)
**Problema**: Frontend não carrega dados quando acessado externamente
**Solução**: ✅ **RESOLVIDO** - O sistema agora detecta automaticamente o IP correto

```bash
# Verificar se está funcionando
./test-external-access.sh
```

### Erro de Porta em Uso
```bash
# Parar sistema
./stop-system.sh

# Verificar processos
lsof -i:5000  # Backend
lsof -i:8080  # Frontend

# Matar processos se necessário
sudo kill -9 [PID]
```

### Erro de Dependências
```bash
# Limpar cache e reinstalar
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../web && rm -rf node_modules package-lock.json && npm install
```

### Erro de Banco de Dados
```bash
# Verificar conexão
./test-connectivity.sh

# Verificar logs
tail -f logs/backend.log
```

### Erro de CORS
```bash
# Verificar configuração
./test-connectivity.sh

# Reiniciar sistema
./stop-system.sh && ./start-system.sh
```

---

## 🌐 URLs de Acesso

### Desenvolvimento
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`

### Produção/Rede
- Frontend: `http://[IP_DA_VM]:8080`
- Backend API: `http://[IP_DA_VM]:5000/api`

---

## 📝 Logs

- **Backend**: `logs/backend.log`
- **Frontend**: `logs/frontend.log`

Para acompanhar logs em tempo real:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 🔐 Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `123@mudar`

**⚠️ IMPORTANTE**: Altere essas credenciais em produção!

---

## 📞 Suporte

Para problemas técnicos, verifique:
1. Logs do sistema
2. Conectividade de rede
3. Status dos serviços
4. Configuração do firewall

**Sistema desenvolvido por MW Soluções**
