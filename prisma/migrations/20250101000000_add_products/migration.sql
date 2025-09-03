-- Adicionar colunas de produtos e descontos na tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS desconto_geral DECIMAL(10,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12,2) DEFAULT 0;

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

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_lead_products_lead_id ON lead_products(lead_id);

-- Trigger para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_lead_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_products_updated_at
    BEFORE UPDATE ON lead_products
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_products_updated_at();

