-- Script de migração para mover campos de endereço da tabela routes para route_items

-- 1. Adicionar colunas na tabela route_items
ALTER TABLE route_items ADD COLUMN address VARCHAR(255);
ALTER TABLE route_items ADD COLUMN neighborhood VARCHAR(100);
ALTER TABLE route_items ADD COLUMN city VARCHAR(100);
ALTER TABLE route_items ADD COLUMN state VARCHAR(50);
ALTER TABLE route_items ADD COLUMN zipcode VARCHAR(20);
ALTER TABLE route_items ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE route_items ADD COLUMN longitude DOUBLE PRECISION;

-- 2. (Opcional) Remover colunas da tabela routes se elas existirem das alterações anteriores
-- ALTER TABLE routes DROP COLUMN address;
-- ALTER TABLE routes DROP COLUMN neighborhood;
-- ALTER TABLE routes DROP COLUMN city;
-- ALTER TABLE routes DROP COLUMN state;
-- ALTER TABLE routes DROP COLUMN zipcode;
-- ALTER TABLE routes DROP COLUMN latitude;
-- ALTER TABLE routes DROP COLUMN longitude;
