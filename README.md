<<<<<<< HEAD
# leadpro
=======
# 🚀 LeadPro - Sistema de Gestão de Leads

Sistema completo de gestão de leads desenvolvido em Angular com backend Node.js e banco PostgreSQL.

## 📋 Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Angular CLI** (`npm install -g @angular/cli`)
- **PostgreSQL** (versão 12 ou superior)
- **Acesso ao banco de dados** (credenciais configuradas)

## 🗄️ Configuração do Banco de Dados

### 1. Executar o Script SQL

Execute o arquivo `web/leadpro_database.sql` no seu banco PostgreSQL:

```bash
psql -h 191.96.251.155 -U postgres -d n8n -f web/leadpro_database.sql
```

**Credenciais do banco:**
- **Host**: 191.96.251.155
- **Database**: n8n
- **User**: postgres
- **Password**: MICROazu9107@#

### 2. Verificar Tabelas Criadas

O script criará as seguintes tabelas:
- `users` - Usuários do sistema
- `leads` - Leads e oportunidades
- `interactions` - Histórico de interações
- `webhooks` - Configurações de webhooks

## 🚀 Inicialização Rápida

### Opção 1: Script Automático (Recomendado)

```bash
# Iniciar todo o sistema
./start-system.sh

# Parar o sistema
./stop-system.sh
```

### Opção 2: Inicialização Manual

#### 1. Iniciar Backend
```bash
cd backend
npm install
node server.js
```

#### 2. Iniciar Frontend
```bash
cd web
npm install
ng serve --host 0.0.0.0 --port 4200
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## 🔐 Credenciais de Acesso

- **Usuário**: `admin`
- **Senha**: `123@mudar`

## 📊 Funcionalidades

### Dashboard
- Estatísticas de leads por status
- Gráficos de conversão
- Leads recentes
- Métricas de performance

### Gestão de Leads
- ✅ **Criar** novos leads
- ✅ **Listar** todos os leads com filtros
- ✅ **Editar** informações dos leads
- ✅ **Excluir** leads
- ✅ **Atualizar status** dos leads
- ✅ **Registrar interações** com leads
- ✅ **Integração WhatsApp** direta
- ✅ **Busca e filtros** avançados

### Sistema de Status
- **NOVO_LEAD** → **LEAD_QUALIFICADO** → **INTERESSE** → **PROPOSTA_ACEITA** → **IMPLANTADO** → **FATURADO**

### Permissões
- **Admin**: Acesso total (criar, editar, excluir, ver valores)
- **Usuário**: Acesso limitado (visualizar, algumas edições)

## 🛠️ Estrutura do Projeto

```
leadpro/
├── backend/                 # Servidor Node.js
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependências do backend
│   └── start-backend.sh    # Script de inicialização
├── web/                    # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Componentes reutilizáveis
│   │   │   ├── pages/      # Páginas do sistema
│   │   │   ├── services/   # Serviços de API
│   │   │   └── models/     # Modelos de dados
│   │   └── ...
│   ├── package.json        # Dependências do frontend
│   └── leadpro_database.sql # Script de criação do banco
├── logs/                   # Logs do sistema
├── start-system.sh         # Script de inicialização completa
├── stop-system.sh          # Script de parada
└── README.md              # Este arquivo
```

## 🔧 Configurações

### Variáveis de Ambiente

O backend usa as seguintes configurações (hardcoded para simplicidade):
- **DB_HOST**: 191.96.251.155
- **DB_PORT**: 5432
- **DB_NAME**: n8n
- **DB_USER**: postgres
- **DB_PASS**: MICROazu9107@#

### API Endpoints

#### Autenticação
- `POST /api/auth/login` - Login de usuário

#### Leads
- `GET /api/leads` - Listar todos os leads
- `GET /api/leads/:id` - Buscar lead específico
- `POST /api/leads` - Criar novo lead
- `PUT /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Excluir lead

#### Interações
- `GET /api/leads/:id/interactions` - Listar interações de um lead
- `POST /api/interactions` - Criar nova interação

#### Dashboard
- `GET /api/dashboard/stats` - Estatísticas do dashboard

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Backend não inicia
```bash
# Verificar se a porta 3000 está livre
lsof -i :3000

# Verificar logs
tail -f logs/backend.log
```

#### 2. Frontend não inicia
```bash
# Verificar se a porta 4200 está livre
lsof -i :4200

# Verificar logs
tail -f logs/frontend.log
```

#### 3. Erro de conexão com banco
```bash
# Testar conexão
psql -h 191.96.251.155 -U postgres -d n8n -c "SELECT 1;"
```

#### 4. Dados não aparecem
- Verificar se o banco foi inicializado corretamente
- Verificar se as tabelas existem
- Verificar logs do backend para erros de SQL

### Logs

Os logs estão disponíveis em:
- **Backend**: `logs/backend.log`
- **Frontend**: `logs/frontend.log`

## 📝 Desenvolvimento

### Adicionar Novas Funcionalidades

1. **Backend**: Adicionar rotas em `backend/server.js`
2. **Frontend**: Criar componentes em `web/src/app/`
3. **Modelos**: Atualizar interfaces em `web/src/app/models/`

### Estrutura de Dados

#### Lead
```typescript
interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  fonte: string;
  status: string;
  valorContrato?: number;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
}
```

## 🔒 Segurança

- Autenticação via banco de dados
- Rate limiting na API
- CORS configurado
- Headers de segurança com Helmet
- Validação de entrada

## 📈 Performance

- Índices otimizados no banco
- Lazy loading de componentes
- Compressão de resposta
- Cache de consultas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato através dos canais oficiais do projeto.

---

**LeadPro** - Transformando leads em clientes! 🎯
>>>>>>> b08f650 (updt: geral commits)
