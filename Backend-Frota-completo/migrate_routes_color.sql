-- Script de migração para adicionar a coluna 'color' na tabela 'routes'
ALTER TABLE routes ADD COLUMN color VARCHAR(255);

-- Opcional: Gerar cores aleatórias para as rotas existentes (formato HSL simples para demonstração)
UPDATE routes SET color = 'hsl(' || floor(random() * 360)::text || ', 70%, 50%)' WHERE color IS NULL;
