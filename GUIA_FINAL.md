# 🚀 LeadPro - Guia Final de Deploy

## 📋 **Sistema Reorganizado e Limpo**

O repositório foi completamente reorganizado para resolver todos os problemas de forma estruturada.

## 🔧 **Problemas Resolvidos**

✅ **CORS**: Headers `x-user-id` e `X-User-Id` adicionados  
✅ **Docker**: Dockerfile corrigido para copiar arquivos Angular corretamente  
✅ **Nginx**: Arquivos padrão removidos antes de copiar Angular  
✅ **Repositório**: Scripts de teste desnecessários removidos  
✅ **Deploy**: Script único e limpo criado  

## 🚀 **Deploy na VM**

### **Opção 1: Deploy Normal**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
chmod +x *.sh
./deploy.sh
```

### **Opção 2: Deploy Limpo (Recomendado)**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
chmod +x *.sh
./clean-deploy.sh
```

## 🔄 **Atualizações**

### **Atualizar Sistema**
```bash
# 1. Atualizar código
git pull origin main

# 2. Deploy limpo
./clean-deploy.sh
```

## 🧪 **Verificação de Sucesso**

### **Checklist:**
- [ ] `docker-compose ps` mostra containers "Up"
- [ ] Frontend mostra sistema Angular (não página padrão do Nginx)
- [ ] Backend responde em `/api/health`
- [ ] Login funciona com `admin` / `123@mudar`
- [ ] Todas as páginas carregam dados sem erros CORS

### **Teste Rápido:**
```bash
# Verificar se frontend está servindo Angular
curl http://localhost:8080 | grep -q "app-root" && echo "✅ Angular" || echo "❌ Nginx padrão"

# Verificar se backend está funcionando
curl http://localhost:5000/api/health && echo "✅ Backend" || echo "❌ Backend"
```

## 🆘 **Solução de Problemas**

### **Problema: Frontend mostra página padrão do Nginx**
```bash
./clean-deploy.sh
```

### **Problema: Erro CORS**
```bash
./clean-deploy.sh
```

### **Problema: Containers não param**
```bash
docker stop $(docker ps -aq)
docker rm -f $(docker ps -aq)
./clean-deploy.sh
```

## 📊 **Comandos de Gerenciamento**

| Ação | Comando |
|------|---------|
| **Deploy limpo** | `./clean-deploy.sh` |
| **Deploy normal** | `./deploy.sh` |
| **Ver status** | `docker-compose ps` |
| **Ver logs** | `docker-compose logs -f` |
| **Parar** | `docker-compose down` |
| **Iniciar** | `docker-compose up -d` |

## 🎯 **URLs de Acesso**

- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

## 📁 **Estrutura Limpa**

```
leadspro-pipeline/
├── backend/                 # Backend Node.js
├── web/                    # Frontend Angular
├── docker-compose.yml      # Orquestração
├── deploy.sh              # Deploy normal
├── clean-deploy.sh        # Deploy limpo
├── README.md              # Documentação principal
└── GUIA_FINAL.md          # Este guia
```

## ⚠️ **Importante**

- **SEMPRE** use `./clean-deploy.sh` para resolver problemas
- **NÃO** use `./start-system.sh` quando estiver usando Docker
- **AGUARDE** o build completo antes de testar
- **VERIFIQUE** os logs se algo não funcionar

---

**Sistema LeadPro - Totalmente Funcional** 🚀
