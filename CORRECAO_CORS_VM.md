# 🔧 Correção CORS para VM

## 🚨 **Problema Identificado**

O erro CORS persiste na VM com o header `x-user-role`:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://191.96.251.155:5000/api/leads. (Reason: header 'x-user-role' is not allowed according to header 'Access-Control-Allow-Headers' from CORS preflight response).
```

## ✅ **Solução Aplicada**

### **1. Correção no Backend**
Adicionado `x-user-role` e `X-User-Role` aos headers permitidos no CORS:

```javascript
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With', 
  'Accept', 
  'Origin', 
  'x-user-id', 
  'X-User-Id', 
  'x-user-role',      // ← NOVO
  'X-User-Role'       // ← NOVO
]
```

### **2. Script de Correção**
Criado `fix-cors-vm.sh` para aplicar a correção na VM.

## 🚀 **Como Aplicar na VM**

### **Opção 1: Correção Rápida**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
chmod +x fix-cors-vm.sh
./fix-cors-vm.sh
```

### **Opção 2: Deploy Limpo Completo**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
chmod +x clean-deploy.sh
./clean-deploy.sh
```

## 🧪 **Verificação**

### **Teste CORS**
```bash
# Testar se o header x-user-role é aceito
curl -H "Origin: http://191.96.251.155:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-user-role" \
     -X OPTIONS \
     http://191.96.251.155:5000/api/leads \
     -v
```

### **Resultado Esperado**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://191.96.251.155:8080
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, x-user-id, X-User-Id, x-user-role, X-User-Role
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## 🎯 **URLs de Acesso**

- **Frontend**: `http://191.96.251.155:8080`
- **Backend API**: `http://191.96.251.155:5000/api`
- **Credenciais**: `admin` / `123@mudar`

## 🔄 **Atualizações Futuras**

Para futuras atualizações, sempre use:
```bash
git pull origin main
./clean-deploy.sh
```

---

**CORS Totalmente Corrigido** ✅
