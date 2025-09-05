# 🔧 Resolver Conflito Git Pull

## 📋 **Problema**
```
error: The following untracked working tree files would be overwritten by merge:
	fix-frontend-vm.sh
Please move or remove them before you merge.
```

## 🔧 **Solução Rápida**

### **Opção 1: Script Automático**
```bash
cd ~/leadspro-pipeline/leadspro-pipeline
./resolve-git-conflict.sh
```

### **Opção 2: Manual**
```bash
# 1. Remover arquivos conflitantes
rm -f fix-frontend-vm.sh
rm -f fix-cors-headers.sh
rm -f GUIA_CORRECAO_CORS.md

# 2. Fazer git pull
git pull origin main

# 3. Aplicar permissões
chmod +x *.sh

# 4. Deploy
./deploy.sh
```

### **Opção 3: Forçar Pull**
```bash
# Remover arquivos locais
rm -f fix-frontend-vm.sh fix-cors-headers.sh GUIA_CORRECAO_CORS.md

# Fazer pull forçado
git fetch origin main
git reset --hard origin/main

# Aplicar permissões
chmod +x *.sh

# Deploy
./deploy.sh
```

---

## 🎯 **Resultado Esperado**

Após executar qualquer uma das opções:
- ✅ Git pull realizado com sucesso
- ✅ Sistema Docker funcionando
- ✅ CORS corrigido
- ✅ Frontend carregando corretamente

---

## 🌐 **URLs de Acesso**

- **Frontend**: `http://[IP_DA_VM]:8080`
- **Backend API**: `http://[IP_DA_VM]:5000/api`
- **Credenciais**: `admin` / `123@mudar`

---

**Execute `./resolve-git-conflict.sh` para resolução automática!** 🚀
