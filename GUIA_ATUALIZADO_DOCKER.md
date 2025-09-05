# 🐳 Guia Atualizado - Docker após Git Pull

## 📋 **Ordem Correta de Comandos após Git Pull**

### **1️⃣ Atualizar Código**
```bash
# Navegar para o diretório do projeto
cd ~/leadspro-pipeline/leadspro-pipeline

# Atualizar código do GitHub
git pull origin main
```

### **2️⃣ Parar Sistema Atual (se rodando)**
```bash
# Parar sistema tradicional (se estiver rodando)
./stop-system.sh

# Parar containers Docker (se estiverem rodando)
docker-compose down
```

### **3️⃣ Limpar Sistema Anterior**
```bash
# Limpar containers e imagens antigas
docker system prune -f

# Verificar se não há processos nas portas
sudo lsof -i:8080
sudo lsof -i:5000

# Se houver processos, matar:
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9
```

### **4️⃣ Deploy Docker**
```bash
# Executar deploy automático
./deploy.sh

# Durante o deploy, quando perguntado:
# "Remover imagens antigas? (y/N):" → Digite: y
```

### **5️⃣ Aguardar Build Completo**
```bash
# O processo pode demorar 2-5 minutos
# Aguarde até ver:
# ✅ Deploy concluído!
```

### **6️⃣ Verificar Status**
```bash
# Verificar containers
docker-compose ps

# Deve mostrar:
# leadpro-backend    Up
# leadpro-frontend   Up
```

### **7️⃣ Testar Sistema**
```bash
# Testar conectividade
./test-docker.sh

# Deve mostrar:
# ✅ Backend funcionando
# ✅ Frontend funcionando
```

### **8️⃣ Acessar Sistema**
```bash
# Abrir no navegador:
# http://[IP_DA_VM]:8080

# Credenciais:
# Usuário: admin
# Senha: 123@mudar
```

---

## 🔧 **Comandos de Gerenciamento Docker**

### **Ver Status:**
```bash
docker-compose ps
```

### **Ver Logs:**
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### **Reiniciar:**
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar apenas backend
docker-compose restart backend

# Reiniciar apenas frontend
docker-compose restart frontend
```

### **Parar Sistema:**
```bash
docker-compose down
```

### **Iniciar Sistema:**
```bash
docker-compose up -d
```

---

## 🆘 **Solução de Problemas**

### **Problema 1: Build Falha**
```bash
# Limpar tudo e tentar novamente
docker-compose down
docker system prune -a -f
./deploy.sh
```

### **Problema 2: Porta em Uso**
```bash
# Verificar processos
sudo lsof -i:8080
sudo lsof -i:5000

# Matar processos
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9

# Tentar novamente
./deploy.sh
```

### **Problema 3: Container não Inicia**
```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend

# Reconstruir sem cache
docker-compose build --no-cache
docker-compose up -d
```

### **Problema 4: Erro de Permissão**
```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod +x *.sh

# Tentar novamente
./deploy.sh
```

### **Problema 5: Docker Compose com Erro**
```bash
# Reiniciar Docker
sudo systemctl restart docker

# Tentar novamente
docker-compose up -d
```

---

## 📊 **Verificação de Sucesso**

### **Checklist:**
- [ ] `git pull origin main` executado
- [ ] Sistema anterior parado
- [ ] `./deploy.sh` executado com sucesso
- [ ] `docker-compose ps` mostra containers "Up"
- [ ] `./test-docker.sh` passa em todos os testes
- [ ] Acesso via `http://[IP_DA_VM]:8080` funciona
- [ ] Login com admin/123@mudar funciona
- [ ] Upload de mídia funciona
- [ ] Criação de interações funciona

---

## 🔄 **Atualizações Futuras**

### **Quando fizer novas features:**
```bash
# 1. Atualizar código
git pull origin main

# 2. Atualizar containers
./update.sh

# 3. Testar
./test-docker.sh
```

---

## 📝 **Comandos Resumidos**

| Ação | Comando |
|------|---------|
| **Deploy inicial** | `./deploy.sh` |
| **Atualizar** | `./update.sh` |
| **Ver status** | `docker-compose ps` |
| **Ver logs** | `docker-compose logs -f` |
| **Parar** | `docker-compose down` |
| **Iniciar** | `docker-compose up -d` |
| **Testar** | `./test-docker.sh` |

---

## 🎯 **URLs de Acesso**

- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

---

## ⚠️ **Importante**

- **NÃO** use `./start-system.sh` quando estiver usando Docker
- **SEMPRE** use `docker-compose` para gerenciar containers
- **MANTENHA** consistência - escolha Docker OU sistema tradicional
- **AGUARDE** o build completo antes de testar

---

**Sistema Docker pronto para uso!** 🚀
