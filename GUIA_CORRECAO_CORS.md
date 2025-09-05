# 🔧 Correção CORS - Header x-user-id

## 📋 **Problema Identificado**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://191.96.251.155:5000/api/leads. (Reason: header 'x-user-id' is not allowed according to header 'Access-Control-Allow-Headers' from CORS preflight response).
```

## 🔧 **Solução Rápida**

### **1️⃣ Executar Script de Correção**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
./fix-cors-headers.sh
```

### **2️⃣ Se o Script Não Resolver, Execute Manualmente:**

```bash
# Parar containers
docker-compose down

# Reconstruir backend
docker-compose build --no-cache backend

# Iniciar containers
docker-compose up -d

# Aguardar
sleep 15

# Testar
curl -H "x-user-id: 1" -H "Origin: http://[IP_DA_VM]:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-user-id" \
     -X OPTIONS http://localhost:5000/api/leads
```

---

## 🔍 **O que foi Corrigido**

### **Antes:**
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
```

### **Depois:**
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-user-id']
```

---

## 🧪 **Verificação de Sucesso**

### **Teste 1: Verificar Headers CORS**
```bash
curl -H "x-user-id: 1" -H "Origin: http://[IP_DA_VM]:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-user-id" \
     -X OPTIONS http://localhost:5000/api/leads
```

**Resultado esperado:** Deve retornar headers CORS incluindo `Access-Control-Allow-Headers: x-user-id`

### **Teste 2: Verificar no Navegador**
1. Abrir `http://[IP_DA_VM]:8080`
2. Fazer login com `admin` / `123@mudar`
3. Verificar se os dados carregam sem erros CORS no console

---

## 🆘 **Solução Alternativa (Se Persistir)**

### **Opção 1: Verificar Logs do Backend**
```bash
docker-compose logs backend
```

### **Opção 2: Testar Endpoint Diretamente**
```bash
# Testar se o backend está respondendo
curl http://localhost:5000/api/health

# Testar com header x-user-id
curl -H "x-user-id: 1" http://localhost:5000/api/leads
```

### **Opção 3: Verificar Configuração CORS**
```bash
# Verificar se a correção foi aplicada
docker exec leadpro-backend grep -A 5 "allowedHeaders" /app/server.js
```

---

## 📊 **Status Esperado**

### **Checklist:**
- [ ] `docker-compose ps` mostra containers "Up"
- [ ] Teste CORS retorna `Access-Control-Allow-Headers: x-user-id`
- [ ] Frontend carrega dados sem erros CORS
- [ ] Login funciona normalmente
- [ ] Todas as páginas carregam dados

---

## 🔄 **Comandos de Gerenciamento**

| Ação | Comando |
|------|---------|
| **Ver status** | `docker-compose ps` |
| **Ver logs** | `docker-compose logs backend` |
| **Parar** | `docker-compose down` |
| **Iniciar** | `docker-compose up -d` |
| **Reconstruir** | `docker-compose build --no-cache backend` |

---

## 🎯 **URLs de Acesso**

- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

---

## ⚠️ **Importante**

- **SEMPRE** reconstrua o backend após mudanças no código
- **AGUARDE** o build completo antes de testar
- **VERIFIQUE** os logs se algo não funcionar
- **TESTE** no navegador após a correção

---

**Execute `./fix-cors-headers.sh` para correção automática!** 🚀
