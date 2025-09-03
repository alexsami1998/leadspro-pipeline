# LeadPro - Sistema de Gestão de Leads

Sistema web completo para gestão de leads com design moderno, funcionalidades avançadas e integração com PostgreSQL.

## 🚀 Características

- **Design Moderno**: Interface responsiva com animações suaves
- **Gestão Completa de Leads**: Baseada no fluxograma de negócio fornecido
- **Sistema de Permissões**: Admin e Usuário com diferentes níveis de acesso
- **Timeline de Interações**: Registro completo de contatos com leads
- **Integração WhatsApp**: Envio direto de mensagens formatadas
- **Webhooks**: Compatível com n8n para automações
- **Dashboard Interativo**: Estatísticas e gráficos em tempo real
- **Banco PostgreSQL**: Configuração automática de tabelas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- Angular CLI 18+

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd leadpro/web
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o PostgreSQL

#### Opção A: Usando Docker
```bash
# Criar container PostgreSQL
docker run --name leadpro-postgres \
  -e POSTGRES_DB=leadpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

#### Opção B: Instalação Local
```sql
-- Conecte ao PostgreSQL e execute:
CREATE DATABASE leadpro;
CREATE USER leadpro_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE leadpro TO leadpro_user;
```

### 4. Configure o Backend

O sistema requer um backend para operações de banco de dados. Crie um servidor Node.js/Express ou use o backend existente no projeto.

### 5. Inicie o servidor de desenvolvimento
```bash
ng serve
```

Acesse `http://localhost:8080`

## 🔧 Configuração Inicial

### 1. Primeiro Acesso

Na primeira execução, o sistema irá:
- Redirecionar para a tela de configuração do banco
- Testar a conexão com PostgreSQL
- Criar automaticamente as tabelas necessárias
- Configurar o usuário padrão

### 2. Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `123@mudar`

### 3. Configuração do Banco

O sistema suporta configuração automática com:
- **Host**: localhost
- **Porta**: 5432
- **Banco**: leadpro
- **Usuário**: postgres
- **Senha**: postgres

## 📊 Funcionalidades

### Dashboard
- Estatísticas em tempo real
- Gráficos de leads por status e fonte
- Lista de leads recentes
- Métricas de conversão

### Gestão de Leads
- **Status Baseados no Fluxograma**:
  - Novo Lead → Qualificado → Interessado → Apresentação → Proposta → Implementação → Faturado
  - Estados especiais: Armazenado, Cobrar, Deletado
- **Filtros Avançados**: Por status, fonte, data
- **Busca em Tempo Real**: Nome, email, telefone, empresa

### Timeline de Interações
- Registro de cada contato com o lead
- Tipos de interação: Contato, Qualificação, Apresentação, etc.
- Data e hora automáticas
- Histórico cronológico completo

### WhatsApp Integration
- Botão de envio direto para WhatsApp Web
- Mensagem padrão formatada automaticamente
- Inclui nome e dados do lead

### Sistema de Permissões
- **Admin**: Acesso total (editar, excluir, ver valores)
- **Usuário**: Visualização e operações básicas

### Webhooks
- Compatível com n8n
- Eventos: Lead criado, atualizado, deletado, interação criada
- Configuração de URLs e eventos
- Teste de conectividade

## 🗄️ Estrutura do Banco

### Tabelas Criadas Automaticamente

```sql
-- Usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USUARIO',
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  empresa VARCHAR(255),
  cargo VARCHAR(255),
  fonte VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'NOVO_LEAD',
  valor_contrato DECIMAL(10,2),
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_criacao VARCHAR(255),
  usuario_atualizacao VARCHAR(255)
);

-- Interações
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  conteudo TEXT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_criacao VARCHAR(255) NOT NULL
);

-- Webhooks
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  eventos JSON NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Fluxo de Negócio

O sistema implementa o fluxograma completo:

1. **Novo Lead** → Origem (Indicação, Evento, Redes Sociais, etc.)
2. **Qualificação** → Lead Qualificado ou Não Qualificado
3. **Interesse** → Interessado ou Armazenado para Futuro
4. **Apresentação** → Agendada, Não Necessária ou Não Possível
5. **Proposta** → Enviada, Aceita ou Negada
6. **Grupo** → Criação e entrada do cliente
7. **Implementação** → VMs e ativação de serviços
8. **Faturamento** → Cadastro SGP e faturamento

## 🎨 Design System

- **Cores**: Gradientes modernos (roxo/azul)
- **Tipografia**: Segoe UI
- **Animações**: Transições suaves e hover effects
- **Responsivo**: Mobile-first design
- **Acessibilidade**: ARIA roles e navegação por teclado

## 🚀 Deploy

### Build para Produção
```bash
ng build --configuration production
```

### Variáveis de Ambiente
Crie um arquivo `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://seu-backend.com/api'
};
```

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   ├── pages/              # Páginas principais
│   ├── services/           # Serviços e lógica de negócio
│   ├── models/             # Interfaces e tipos
│   ├── guards/             # Guards de autenticação
│   ├── layout/             # Layout principal
│   └── core/               # Interceptors e configurações
```

### Comandos Úteis
```bash
# Gerar componente
ng generate component components/nome-componente

# Gerar serviço
ng generate service services/nome-servico

# Build e análise
ng build --stats-json
npm run analyze
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Banco**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais na configuração
   - Teste a conexão manualmente

2. **Tabelas Não Criadas**
   - Execute manualmente o SQL de criação
   - Verifique permissões do usuário do banco
   - Limpe o cache local e reconfigure

3. **Erro de CORS**
   - Configure o backend para aceitar requisições do frontend
   - Verifique a URL da API no environment

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação do código
- Verifique os logs do console

---

**LeadPro** - Transformando leads em clientes! 🚀
