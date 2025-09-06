# 📋 Manual de Deploy - LeadPro Pipeline

## 🎯 Objetivo
Este manual fornece instruções passo a passo para fazer deploy do sistema LeadPro Pipeline em uma VM após atualizações via `git pull`.

## 📋 Pré-requisitos
- VM com Ubuntu/Debian
- Node.js 18+ instalado
- PostgreSQL instalado e configurado
- Redis instalado e configurado
- Nginx instalado e configurado
- Git configurado

## 🚀 Processo de Deploy

### 1. Conectar na VM
```bash
ssh usuario@ip-da-vm
```

### 2. Navegar para o diretório do projeto
```bash
cd /caminho/para/leadspro-pipeline
```

### 3. Parar o sistema atual
```bash
# Parar todos os processos
./stop-system.sh

# Verificar se não há processos rodando
ps aux | grep -E "(node|npm|ng)" | grep -v grep
```

### 4. Fazer backup do banco de dados (opcional mas recomendado)
```bash
# Backup do PostgreSQL
pg_dump -h localhost -U postgres -d leadpro_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 5. Atualizar o código
```bash
# Fazer pull das atualizações
git pull origin main

# Verificar se há conflitos
git status
```

### 6. Instalar/Atualizar dependências

#### Backend
```bash
cd backend
npm install
cd ..
```

#### Frontend (Angular)
```bash
cd web
npm install
cd ..
```

### 7. Executar migrações do banco (se necessário)
```bash
# Verificar se há novas migrações
ls -la prisma/migrations/

# Executar migrações se houver arquivos novos
# (Normalmente não é necessário para atualizações de código)
```

### 8. Limpar cache e logs antigos
```bash
# Limpar logs antigos
rm -f logs/*.log logs/*.pid
rm -f system-logs.log

# Limpar cache do Angular
cd web
rm -rf .angular/cache
cd ..
```

### 9. Recompilar o frontend
```bash
cd web
npm run build
cd ..
```

### 10. Iniciar o sistema
```bash
# Iniciar todos os serviços
./start-system.sh

# Verificar se está rodando
ps aux | grep -E "(node|npm|ng)" | grep -v grep
```

### 11. Verificar se os serviços estão funcionando
```bash
# Verificar backend (porta 5000)
curl http://localhost:5000/api/health

# Verificar frontend (porta 4200)
curl http://localhost:4200

# Verificar logs
tail -f logs/backend.log
tail -f logs/frontend.log
```

### 12. Testar funcionalidades críticas
```bash
# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","senha":"123@mudar"}'

# Testar exportação PDF
curl -X GET "http://localhost:5000/api/leads/export/pdf?filterType=all" \
  -H "Accept: application/pdf" \
  -o test-export.pdf
```

## 🔧 Comandos de Manutenção

### Verificar status do sistema
```bash
# Ver processos rodando
ps aux | grep -E "(node|npm|ng)" | grep -v grep

# Ver portas em uso
ss -tlnp | grep -E "(3000|4200|5000)"

# Ver logs em tempo real
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Reiniciar serviços específicos
```bash
# Apenas backend
./stop-system.sh
cd backend && npm start &

# Apenas frontend
cd web && npm run build && npm start &
```

### Verificar espaço em disco
```bash
df -h
du -sh /caminho/para/leadspro-pipeline
```

### Limpar logs antigos
```bash
# Limpar logs com mais de 7 dias
find logs/ -name "*.log" -mtime +7 -delete
```

## 🚨 Solução de Problemas

### Erro: "Port already in use"
```bash
# Encontrar processo usando a porta
lsof -i :5000
lsof -i :4200

# Matar processo
kill -9 PID_DO_PROCESSO
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
cd backend && rm -rf node_modules && npm install
cd ../web && rm -rf node_modules && npm install
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Erro: "Redis connection failed"
```bash
# Verificar se Redis está rodando
sudo systemctl status redis

# Reiniciar Redis
sudo systemctl restart redis
```

### Erro na exportação PDF
```bash
# Verificar se Puppeteer está funcionando
cd backend
node -e "const puppeteer = require('puppeteer'); console.log('Puppeteer OK');"

# Verificar logs do backend
tail -f logs/backend.log | grep -i pdf
```

## 📊 Monitoramento

### Verificar uso de recursos
```bash
# CPU e memória
top
htop

# Uso de memória específico
ps aux --sort=-%mem | head -10
```

### Verificar logs de erro
```bash
# Logs do sistema
journalctl -u nginx -f
journalctl -u postgresql -f

# Logs da aplicação
tail -f logs/backend.log | grep -i error
tail -f logs/frontend.log | grep -i error
```

## 🔄 Rollback (se necessário)

### Voltar para versão anterior
```bash
# Ver histórico de commits
git log --oneline -10

# Voltar para commit anterior
git reset --hard HEAD~1

# Ou voltar para commit específico
git reset --hard COMMIT_HASH

# Reinstalar dependências e reiniciar
./stop-system.sh
cd backend && npm install
cd ../web && npm install && npm run build
./start-system.sh
```

## 📝 Checklist de Deploy

- [ ] Sistema parado
- [ ] Backup do banco feito
- [ ] Código atualizado (git pull)
- [ ] Dependências instaladas
- [ ] Frontend recompilado
- [ ] Sistema iniciado
- [ ] Serviços verificados
- [ ] Funcionalidades testadas
- [ ] Logs verificados

## 📞 Suporte

Em caso de problemas:
1. Verificar logs em `logs/`
2. Verificar status dos serviços
3. Consultar este manual
4. Verificar documentação adicional em `GUIA_FINAL.md`

---

**Última atualização:** $(date)
**Versão:** 1.0
