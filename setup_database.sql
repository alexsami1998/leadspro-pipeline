-- Script para criar as tabelas necessárias para o sistema LeadPro
-- Compatível com o backend Node.js

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    empresa VARCHAR(100),
    cargo VARCHAR(50),
    fonte VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'NOVO_LEAD',
    valor_contrato DECIMAL(12,2),
    observacoes TEXT,
    desconto_geral DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(12,2) DEFAULT 0,
    usuario_criacao INTEGER REFERENCES users(id),
    usuario_atualizacao INTEGER REFERENCES users(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de produtos do lead
CREATE TABLE IF NOT EXISTS lead_products (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL DEFAULT 0,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de interações
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
    conteudo TEXT NOT NULL,
    usuario_criacao INTEGER REFERENCES users(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    eventos JSONB,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX IF NOT EXISTS idx_lead_products_lead_id ON lead_products(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_products_updated_at
    BEFORE UPDATE ON lead_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão (senha: 123@mudar)
INSERT INTO users (nome, email, senha, role, ativo) 
VALUES ('Admin', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2O', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns leads de exemplo
INSERT INTO leads (nome, email, telefone, empresa, cargo, fonte, status, valor_contrato, observacoes, usuario_criacao)
VALUES 
    ('João Silva', 'joao@empresa.com', '(11) 99999-9999', 'Empresa ABC', 'Gerente', 'Website', 'NOVO_LEAD', 5000.00, 'Lead interessado em nossos serviços', 1),
    ('Maria Santos', 'maria@empresa.com', '(11) 88888-8888', 'Empresa XYZ', 'Diretora', 'Indicação', 'LEAD_QUALIFICADO', 8000.00, 'Cliente potencial com alto valor', 1),
    ('Pedro Costa', 'pedro@empresa.com', '(11) 77777-7777', 'Empresa 123', 'CEO', 'LinkedIn', 'INTERESSE', 12000.00, 'Demonstrou interesse em reunião', 1)
ON CONFLICT DO NOTHING;

-- Inserir alguns produtos de exemplo para os leads
INSERT INTO lead_products (lead_id, nome, valor, desconto, valor_final)
VALUES 
    (1, 'Sistema CRM', 3000.00, 300.00, 2700.00),
    (1, 'Integração API', 2000.00, 0.00, 2000.00),
    (2, 'Sistema ERP', 5000.00, 500.00, 4500.00),
    (2, 'Consultoria', 3000.00, 0.00, 3000.00),
    (3, 'Sistema Completo', 8000.00, 800.00, 7200.00),
    (3, 'Suporte Premium', 4000.00, 0.00, 4000.00)
ON CONFLICT DO NOTHING;

-- Inserir algumas interações de exemplo
INSERT INTO interactions (lead_id, tipo, conteudo, usuario_criacao)
VALUES 
    (1, 'EMAIL', 'Enviado email de apresentação dos serviços', 1),
    (1, 'TELEFONE', 'Ligação realizada - cliente demonstrou interesse', 1),
    (2, 'REUNIAO', 'Reunião agendada para próxima semana', 1),
    (3, 'PROPOSTA', 'Proposta enviada com valores e prazos', 1)
ON CONFLICT DO NOTHING;

-- Inserir webhook de exemplo
INSERT INTO webhooks (nome, url, ativo, eventos)
VALUES 
    ('Webhook Principal', 'https://webhook.site/12345678', true, '["lead_criado", "lead_atualizado"]')
ON CONFLICT DO NOTHING;
