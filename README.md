# LeadPro - Sistema de Gestão de Leads

Sistema completo de gestão de leads desenvolvido em Angular com backend Node.js e banco PostgreSQL.

**Propriedade exclusiva de MW Soluções**

## Visão Geral

O LeadPro é uma solução robusta para gestão de leads e oportunidades de negócio, oferecendo funcionalidades completas de CRM com interface moderna e responsiva.

## Arquitetura

- **Frontend**: Angular 17+ com TypeScript
- **Backend**: Node.js com Express
- **Banco**: PostgreSQL
- **Portas**: Frontend (8080), Backend (5000)

## Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## Configuração

### 1. Instalação de Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd web
npm install
```

### 2. Configuração do Banco

Execute o script de inicialização:
```bash
psql -h localhost -U postgres -d leadpro -f web/leadpro_database.sql
```

### 3. Configuração de Ambiente

Edite o arquivo `config.js` na raiz do projeto:
- Para deploy automatizado: mantenha `manual.enabled = false`
- Para execução manual: altere `manual.enabled = true` e configure `vmIp`

## Execução

### Modo Deploy (Jenkins, Docker, etc.)
```bash
./start-system.sh
```

### Modo Manual
```bash
# Backend
cd backend
node server.js

# Frontend
cd web
ng serve --port 8080
```

## Funcionalidades

### Gestão de Leads
- Criação e edição de leads
- Controle de status e pipeline
- Histórico de interações
- Integração WhatsApp
- Filtros e busca avançada

### Dashboard
- Métricas de performance
- Gráficos de conversão
- Leads por status
- Estatísticas por fonte

### Sistema de Usuários
- Controle de acesso
- Perfis de permissão
- Auditoria de ações

### Webhooks
- Integração com sistemas externos
- Configuração de eventos
- Filtros de dados

## Estrutura do Projeto

```
leadpro/
├── backend/           # Servidor Node.js
├── web/              # Frontend Angular
├── config.js         # Configurações do sistema
├── prisma/           # Schema do banco
└── scripts/          # Scripts de automação
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Leads
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead
- `PUT /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Excluir lead

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas

## Configurações de Segurança

- Autenticação via banco
- Rate limiting
- CORS configurado
- Headers de segurança
- Validação de entrada

## Monitoramento

- Logs estruturados
- Health checks
- Métricas de performance
- Tratamento de erros

## Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da MW Soluções.
Este é um produto MW Soluções.

Desenvolvido por Equipe EasyBI.
---

**LeadPro** - Transformando leads em resultados
