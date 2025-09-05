# 🚀 Guia de Escolha de Deploy - LeadPro

## 📋 **Dois Métodos Disponíveis**

### **Método 1: Sistema Tradicional** ⚡ (Recomendado para desenvolvimento)
- Usa Node.js diretamente na VM
- Mais rápido para desenvolvimento
- Fácil de debugar
- **Comando**: `./start-system.sh`

### **Método 2: Docker** 🐳 (Recomendado para produção)
- Sistema isolado em containers
- Mais profissional e portável
- Melhor para produção
- **Comando**: `./deploy.sh`

---

## ⚠️ **IMPORTANTE: Não Misture os Métodos!**

### **❌ ERRADO:**
```bash
./deploy.sh          # Inicia Docker
./start-system.sh    # Tenta iniciar sistema tradicional
```

### **✅ CORRETO:**
```bash
# Escolha UM método:

# Opção 1: Sistema Tradicional
./start-system.sh

# OU

# Opção 2: Docker
./deploy.sh
```

---

## 🎯 **Qual Método Usar?**

### **Use Sistema Tradicional quando:**
- ✅ Desenvolvendo/ testando
- ✅ Quer debug fácil
- ✅ Quer velocidade
- ✅ Não tem Docker instalado

### **Use Docker quando:**
- ✅ Deploy em produção
- ✅ Quer isolamento
- ✅ Quer portabilidade
- ✅ Quer profissionalismo

---

## 🚀 **Instruções por Método**

### **Método 1: Sistema Tradicional**

```bash
# 1. Atualizar código
git pull origin main

# 2. Parar sistema atual (se rodando)
./stop-system.sh

# 3. Iniciar sistema tradicional
./start-system.sh

# 4. Testar
./test-cors-fix.sh
```

**URLs de acesso:**
- Frontend: `http://[IP_DA_VM]:8080`
- Backend: `http://[IP_DA_VM]:5000/api`

### **Método 2: Docker**

```bash
# 1. Atualizar código
git pull origin main

# 2. Parar sistema atual (se rodando)
./stop-system.sh
docker-compose down

# 3. Deploy Docker
./deploy.sh

# 4. Testar
./test-docker.sh
```

**URLs de acesso:**
- Frontend: `http://[IP_DA_VM]:8080`
- Backend: `http://[IP_DA_VM]:5000/api`

---

## 🔧 **Solução para Seu Problema Atual**

Você está misturando os métodos. Vamos corrigir:

### **Opção A: Continuar com Sistema Tradicional**
```bash
# Parar tudo
./stop-system.sh
docker-compose down

# Iniciar sistema tradicional
./start-system.sh

# Testar
./test-cors-fix.sh
```

### **Opção B: Usar Docker (após correção)**
```bash
# Parar tudo
./stop-system.sh
docker-compose down

# Deploy Docker (agora com Node.js 20)
./deploy.sh

# Testar
./test-docker.sh
```

---

## 📊 **Comparação dos Métodos**

| Aspecto | Sistema Tradicional | Docker |
|---------|-------------------|--------|
| **Velocidade** | ⚡ Muito rápido | 🐌 Mais lento |
| **Debug** | 🔍 Fácil | 🔍 Mais difícil |
| **Isolamento** | ❌ Não | ✅ Sim |
| **Portabilidade** | ❌ Limitada | ✅ Total |
| **Profissional** | ⚠️ Básico | ✅ Profissional |
| **Recursos** | 💚 Menos | 💛 Mais |

---

## 🎯 **Recomendação**

### **Para sua situação atual:**
1. **Use Sistema Tradicional** - mais simples e rápido
2. **Depois migre para Docker** quando estiver tudo funcionando

### **Comandos recomendados:**
```bash
# Limpar tudo
./stop-system.sh
docker-compose down

# Usar sistema tradicional
./start-system.sh

# Testar
./test-cors-fix.sh
```

---

## 🆘 **Se Algo Der Errado**

### **Limpar tudo e começar do zero:**
```bash
# Parar todos os processos
./stop-system.sh
docker-compose down

# Limpar containers Docker
docker system prune -f

# Reiniciar com sistema tradicional
./start-system.sh
```

### **Verificar o que está rodando:**
```bash
# Ver processos nas portas
lsof -i:8080
lsof -i:5000

# Ver containers Docker
docker ps -a
```

---

**Escolha UM método e mantenha consistência!** 🎯
