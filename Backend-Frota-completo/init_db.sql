-- Tabela de Motoristas
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    licenseNumber VARCHAR(50) UNIQUE,
    licenseCategory VARCHAR(10),
    licenseExpiry TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plate VARCHAR(20) UNIQUE,
    type VARCHAR(50),
    capacity FLOAT,
    status VARCHAR(20) DEFAULT 'available'
);

-- Tabela de Rotas
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    driverId INTEGER REFERENCES drivers(id),
    vehicleId INTEGER REFERENCES vehicles(id),
    status VARCHAR(20) DEFAULT 'pending',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deliveryAddress VARCHAR(255),
    deliveryNumber VARCHAR(50),
    deliveryDistrict VARCHAR(120),
    deliveryCity VARCHAR(120),
    deliveryState VARCHAR(50),
    deliveryZipCode VARCHAR(20),
    deliveryLatitude DOUBLE PRECISION,
    deliveryLongitude DOUBLE PRECISION
);

-- Tabela de Itens da Rota
CREATE TABLE IF NOT EXISTS route_items (
    id SERIAL PRIMARY KEY,
    routeId INTEGER REFERENCES routes(id),
    orderNumber VARCHAR(50),
    sequence INTEGER,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Tabela de Rastreamento GPS
CREATE TABLE IF NOT EXISTS gps_tracking (
    id SERIAL PRIMARY KEY,
    routeId INTEGER REFERENCES routes(id),
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notificações WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
    id SERIAL PRIMARY KEY,
    routeId INTEGER REFERENCES routes(id),
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(20) DEFAULT 'sent'
);

-- Tabela de Entregas
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    routeId INTEGER REFERENCES routes(id),
    orderNumber VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    deliveredAt TIMESTAMP
);
