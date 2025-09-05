# 🐳 Guia Docker para VM - Correção Frontend

## 📋 **Problema Identificado**
O frontend está mostrando a página padrão do Nginx em vez do sistema Angular.

## 🔧 **Solução Rápida**

### **1️⃣ Executar Script de Correção**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
./fix-frontend-vm.sh
```

### **2️⃣ Se o Script Não Resolver, Execute Manualmente:**

```bash
# Parar todos os containers
docker-compose down --remove-orphans

# Remover containers antigos
docker container prune -f

# Remover containers específicos se existirem
docker rm -f leadpro-frontend leadpro-backend

# Reconstruir sem cache
docker-compose build --no-cache

# Iniciar containers
docker-compose up -d

# Aguardar e testar
sleep 10
curl http://localhost:8080
```

### **3️⃣ Verificar se Funcionou**
```bash
# Verificar conteúdo do index.html
docker exec leadpro-frontend head -5 /usr/share/nginx/html/index.html

# Se mostrar "app-root" = ✅ Funcionando
# Se mostrar "Welcome to nginx" = ❌ Ainda com problema
```

---

## 🆘 **Solução Alternativa (Se Persistir)**

### **Opção 1: Usar Porta Diferente**
```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Alterar a linha:
# ports:
#   - "8080:80"
# Para:
# ports:
#   - "8081:80"

# Reconstruir e iniciar
docker-compose up -d --build
```

### **Opção 2: Verificar Dockerfile**
```bash
# Verificar se o Dockerfile está correto
cat web/Dockerfile

# Deve ter a linha:
# COPY --from=build /app/dist/leadpro-web/browser /usr/share/nginx/html
```

### **Opção 3: Build Manual do Angular**
```bash
# Entrar no container de build
docker run -it --rm -v $(pwd)/web:/app -w /app node:20-alpine sh

# Dentro do container:
npm ci
npm run build
ls -la dist/leadpro-web/

# Sair do container
exit
```

---

## 📊 **Verificação de Sucesso**

### **Checklist:**
- [ ] `docker-compose ps` mostra containers "Up"
- [ ] `curl http://localhost:8080` retorna HTML do Angular
- [ ] `docker exec leadpro-frontend head -5 /usr/share/nginx/html/index.html` mostra "app-root"
- [ ] Acesso via `http://[IP_DA_VM]:8080` mostra o sistema LeadPro
- [ ] Login com admin/123@mudar funciona

---

## 🔄 **Comandos de Gerenciamento**

| Ação | Comando |
|------|---------|
| **Ver status** | `docker-compose ps` |
| **Ver logs** | `docker-compose logs -f` |
| **Parar** | `docker-compose down` |
| **Iniciar** | `docker-compose up -d` |
| **Reconstruir** | `docker-compose build --no-cache` |
| **Reiniciar** | `docker-compose restart` |

---

## 🎯 **URLs de Acesso**

- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

---

## ⚠️ **Importante**

- **SEMPRE** use `docker-compose` para gerenciar containers
- **NÃO** use `./start-system.sh` quando estiver usando Docker
- **AGUARDE** o build completo antes de testar
- **VERIFIQUE** os logs se algo não funcionar

---

**Execute `./fix-frontend-vm.sh` para correção automática!** 🚀
