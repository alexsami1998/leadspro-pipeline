# Configuração de Ambiente - LeadPro

## Visão Geral

O sistema LeadPro foi configurado para funcionar em diferentes ambientes de deploy através do arquivo `config.js` na raiz do projeto.

## Arquivo de Configuração

### Estrutura do config.js

```javascript
const config = {
  // Configuração para ambiente de deploy (Jenkins, Docker, etc.)
  deploy: {
    frontend: { port: 8080, host: '0.0.0.0' },
    backend: { port: 5000, host: '0.0.0.0' }
  },
  
  // Configuração para execução manual em VM
  manual: {
    enabled: false,        // Alterar para true quando executar manualmente
    vmIp: '192.168.1.100', // IP da VM local
    frontend: { port: 8080, host: '0.0.0.0' },
    backend: { port: 5000, host: '0.0.0.0' }
  },
  
  // Configuração do banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'leadpro',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  }
};
```

## Modos de Execução

### 1. Modo Deploy (Padrão)

Para ambientes de deploy automatizado (Jenkins, Docker, CI/CD):

```bash
# Manter configuração padrão
manual.enabled = false

# O sistema usará as portas:
# Frontend: 8080
# Backend: 5000
```

### 2. Modo Manual

Para execução direta em VM ou ambiente local:

```bash
# Alterar para modo manual
manual.enabled = true

# Configurar IP da VM
vmIp = '192.168.1.100'  # Substituir pelo IP real

# O sistema usará as mesmas portas mas com configurações específicas
```

## Portas Utilizadas

- **Frontend**: 8080 (diferente de 4200)
- **Backend**: 5000 (diferente de 3000)

## Variáveis de Ambiente

O sistema suporta as seguintes variáveis de ambiente:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=leadpro
export DB_USER=postgres
export DB_PASSWORD=sua_senha
```

## Scripts de Automação

### Inicialização
- `./start-system.sh` - Modo desenvolvimento
- `./start-production.sh` - Modo produção
- `./start-pm2.sh` - Com PM2

### Parada
- `./stop-system.sh` - Para todos os serviços

### Configuração
- `./setup-firewall.sh` - Configura firewall
- `./setup-nginx.sh` - Configura Nginx

## Troubleshooting

### Porta já em uso
```bash
# Verificar portas em uso
lsof -i :8080
lsof -i :5000

# Parar processos
kill -9 <PID>
```

### Configuração incorreta
1. Verificar arquivo `config.js`
2. Verificar variáveis de ambiente
3. Reiniciar serviços após alterações

## Segurança

- As portas padrão foram alteradas por segurança
- Firewall configurado para as novas portas
- CORS configurado dinamicamente
- Rate limiting ativo no backend

## Notas Importantes

- **NÃO** alterar as portas no arquivo `config.js` sem atualizar scripts
- Sempre reiniciar serviços após alterações de configuração
- Verificar firewall para novas portas
- Testar conectividade após mudanças
