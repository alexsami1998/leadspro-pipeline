-- Adicionar campos de mídia na tabela interactions
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS media_id VARCHAR(255);
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS media_type VARCHAR(100);
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS media_filename VARCHAR(255);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_interactions_media_id ON interactions(media_id);
