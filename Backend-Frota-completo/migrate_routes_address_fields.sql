-- Migração: adicionar campos de endereço e coordenadas de entrega na tabela routes
-- Execute este script no banco PostgreSQL usado pelo FastAPI.

ALTER TABLE routes
    ADD COLUMN IF NOT EXISTS deliveryAddress VARCHAR(255),
    ADD COLUMN IF NOT EXISTS deliveryNumber VARCHAR(50),
    ADD COLUMN IF NOT EXISTS deliveryDistrict VARCHAR(120),
    ADD COLUMN IF NOT EXISTS deliveryCity VARCHAR(120),
    ADD COLUMN IF NOT EXISTS deliveryState VARCHAR(50),
    ADD COLUMN IF NOT EXISTS deliveryZipCode VARCHAR(20),
    ADD COLUMN IF NOT EXISTS deliveryLatitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS deliveryLongitude DOUBLE PRECISION;

COMMENT ON COLUMN routes.deliveryAddress IS 'Endereço de destino da entrega associado à rota.';
COMMENT ON COLUMN routes.deliveryNumber IS 'Número do endereço de destino da entrega.';
COMMENT ON COLUMN routes.deliveryDistrict IS 'Bairro do destino da entrega.';
COMMENT ON COLUMN routes.deliveryCity IS 'Cidade do destino da entrega.';
COMMENT ON COLUMN routes.deliveryState IS 'Estado/UF do destino da entrega.';
COMMENT ON COLUMN routes.deliveryZipCode IS 'CEP do destino da entrega.';
COMMENT ON COLUMN routes.deliveryLatitude IS 'Latitude geocodificada do destino da entrega, quando disponível.';
COMMENT ON COLUMN routes.deliveryLongitude IS 'Longitude geocodificada do destino da entrega, quando disponível.';
