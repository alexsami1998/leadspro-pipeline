-- =====================================================
-- LeadPro - Sistema de Gestão de Leads
-- Script de Criação do Banco de Dados PostgreSQL
-- =====================================================

-- Conectar ao banco de dados
\c n8n;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USUARIO',
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
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

-- =====================================================
-- TABELA DE INTERAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_criacao VARCHAR(255) NOT NULL
);

-- =====================================================
-- TABELA DE WEBHOOKS
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    eventos JSON NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_fonte ON leads(fonte);
CREATE INDEX IF NOT EXISTS idx_leads_data_criacao ON leads(data_criacao);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_nome ON leads(nome);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_data_criacao ON interactions(data_criacao);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_webhooks_ativo ON webhooks(ativo);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO users (nome, email, senha, role, ativo) 
VALUES (
    'Administrador', 
    'admin@leadpro.com', 
    '$2b$10$rQZ8K9mN2pL1vX3yW4uJ5e', -- senha: 123@mudar (hash bcrypt)
    'ADMIN', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Inserir alguns leads de exemplo
INSERT INTO leads (nome, email, telefone, empresa, cargo, fonte, status, valor_contrato, observacoes, usuario_criacao) VALUES
('João Silva', 'joao.silva@empresa.com', '(11) 99999-9999', 'Empresa ABC', 'Diretor', 'INDICACAO', 'NOVO_LEAD', 5000.00, 'Lead interessado em automação', 'Sistema'),
('Maria Santos', 'maria.santos@tech.com', '(11) 88888-8888', 'Tech Solutions', 'CEO', 'EVENTO', 'LEAD_QUALIFICADO', 8000.00, 'Participou do evento de tecnologia', 'Sistema'),
('Pedro Costa', 'pedro.costa@startup.com', '(11) 77777-7777', 'StartupXYZ', 'Fundador', 'REDES_SOCIAIS', 'INTERESSE', 3000.00, 'Contato via LinkedIn', 'Sistema'),
('Ana Oliveira', 'ana.oliveira@consultoria.com', '(11) 66666-6666', 'Consultoria Pro', 'Sócia', 'EX_CLIENTE', 'PROPOSTA_ACEITA', 12000.00, 'Cliente retorno - muito satisfeita', 'Sistema'),
('Carlos Ferreira', 'carlos.ferreira@industria.com', '(11) 55555-5555', 'Indústria XYZ', 'Gerente', 'PARCEIRO', 'IMPLANTADO', 15000.00, 'Implementação em andamento', 'Sistema')
ON CONFLICT DO NOTHING;

-- Inserir algumas interações de exemplo
INSERT INTO interactions (lead_id, tipo, conteudo, usuario_criacao) VALUES
(1, 'CONTATO_INICIAL', 'Primeiro contato realizado via telefone. Cliente demonstrou interesse em automação de processos.', 'Sistema'),
(1, 'QUALIFICACAO', 'Lead qualificado após análise de perfil e necessidades da empresa.', 'Sistema'),
(2, 'APRESENTACAO', 'Apresentação realizada via videoconferência. Cliente gostou da solução proposta.', 'Sistema'),
(3, 'PROPOSTA', 'Proposta enviada por email com valor de R$ 3.000,00 para implementação básica.', 'Sistema'),
(4, 'IMPLEMENTACAO', 'Início da implementação. Cliente enviou dados necessários para configuração.', 'Sistema')
ON CONFLICT DO NOTHING;

-- Inserir webhook de exemplo
INSERT INTO webhooks (nome, url, ativo, eventos) VALUES
('n8n LeadPro Integration', 'https://n8n.yourdomain.com/webhook/leadpro', true, '["LEAD_CRIADO", "LEAD_ATUALIZADO", "INTERACAO_CRIADA"]')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar data_atualizacao
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================
COMMENT ON TABLE users IS 'Tabela de usuários do sistema LeadPro';
COMMENT ON TABLE leads IS 'Tabela de leads com status baseados no fluxograma de negócio';
COMMENT ON TABLE interactions IS 'Tabela de interações/histórico de contatos com leads';
COMMENT ON TABLE webhooks IS 'Tabela de configuração de webhooks para integrações';

-- =====================================================
-- PERMISSÕES
-- =====================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'NOVO_LEAD' THEN 1 END) as leads_novos,
    COUNT(CASE WHEN status = 'LEAD_QUALIFICADO' THEN 1 END) as leads_qualificados,
    COUNT(CASE WHEN status = 'INTERESSE' THEN 1 END) as leads_interessados,
    COUNT(CASE WHEN status = 'IMPLANTADO' THEN 1 END) as leads_implantados,
    COUNT(CASE WHEN status = 'FATURADO' THEN 1 END) as leads_faturados,
    COUNT(CASE WHEN status = 'ARMAZENADO_FUTURO' THEN 1 END) as leads_armazenados,
    COALESCE(ROUND(
        (COUNT(CASE WHEN status = 'FATURADO' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(*), 0) * 100), 2
    ), 0) as conversao_rate
FROM leads;

-- View para leads com última interação
CREATE OR REPLACE VIEW leads_with_last_interaction AS
SELECT 
    l.*,
    i.tipo as ultima_interacao_tipo,
    i.conteudo as ultima_interacao_conteudo,
    i.data_criacao as ultima_interacao_data
FROM leads l
LEFT JOIN LATERAL (
    SELECT tipo, conteudo, data_criacao
    FROM interactions 
    WHERE lead_id = l.id 
    ORDER BY data_criacao DESC 
    LIMIT 1
) i ON true;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
