# 🗄️ COMANDOS SQL PARA TESTES

Use estes comandos para testar o banco de dados do seu servidor Debian.

---

## 🔗 Conectar ao Banco Logística

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica
```

Ou com arquivo de senha:

```bash
echo "192.168.1.172:5432:logistica:postgres:postgres" > ~/.pgpass
chmod 600 ~/.pgpass
psql -h 192.168.1.172 -U postgres -d logistica
```

---

## 📋 Listar Tabelas

```sql
\dt
```

**Esperado:** Deve listar: drivers, vehicles, routes, deliveries, etc.

---

## 👤 Verificar Motoristas

### Contar motoristas

```sql
SELECT COUNT(*) FROM drivers;
```

### Listar todos os motoristas

```sql
SELECT * FROM drivers;
```

### Listar últimos 5 motoristas

```sql
SELECT id, nome, cpf, cnh, telefone, ativo, "createdAt" FROM drivers ORDER BY id DESC LIMIT 5;
```

### Buscar motorista por CPF

```sql
SELECT * FROM drivers WHERE cpf = '12345678901';
```

### Buscar motorista por nome

```sql
SELECT * FROM drivers WHERE nome LIKE '%João%';
```

---

## 🚗 Verificar Veículos

### Contar veículos

```sql
SELECT COUNT(*) FROM vehicles;
```

### Listar todos os veículos

```sql
SELECT * FROM vehicles;
```

### Listar veículos ativos

```sql
SELECT id, placa, modelo, tipo_veiculo, ativo FROM vehicles WHERE ativo = true;
```

---

## 🛣️ Verificar Rotas

### Contar rotas

```sql
SELECT COUNT(*) FROM routes;
```

### Listar rotas

```sql
SELECT r.id, r."dataRota", d.nome as motorista, v.placa as veiculo, r.status 
FROM routes r 
LEFT JOIN drivers d ON r.motorista_id = d.id 
LEFT JOIN vehicles v ON r.veiculo_id = v.id;
```

---

## 📦 Verificar Entregas

### Contar entregas

```sql
SELECT COUNT(*) FROM deliveries;
```

### Listar entregas

```sql
SELECT id, numero_pedido, cliente, status, "createdAt" FROM deliveries;
```

### Listar entregas por status

```sql
SELECT status, COUNT(*) FROM deliveries GROUP BY status;
```

---

## 🧪 Inserir Dados de Teste

### Inserir motorista

```sql
INSERT INTO drivers (nome, cpf, cnh, telefone, email, ativo)
VALUES ('João Silva', '12345678901', '12345678901234', '11999999999', 'joao@example.com', true);
```

### Inserir veículo

```sql
INSERT INTO vehicles (placa, modelo, tipo_veiculo, "capacidadeKg", "capacidadeM3", ativo)
VALUES ('ABC1234', 'Hyundai HR', 'VUC', 1000.00, 5.50, true);
```

### Inserir rota

```sql
INSERT INTO routes ("dataRota", motorista_id, veiculo_id, status)
VALUES (NOW(), 1, 1, 'planejada');
```

### Inserir entrega

```sql
INSERT INTO deliveries (rota_id, numero_pedido, cliente, endereco, status)
VALUES (1, 'PED001', 'Cliente Teste', 'Rua Teste, 123', 'pendente');
```

---

## 🗑️ Limpar Dados (CUIDADO!)

### Deletar todos os motoristas

```sql
DELETE FROM drivers;
```

### Deletar todos os veículos

```sql
DELETE FROM vehicles;
```

### Deletar todas as rotas

```sql
DELETE FROM routes;
```

### Deletar todas as entregas

```sql
DELETE FROM deliveries;
```

### Resetar sequências (IDs)

```sql
ALTER SEQUENCE drivers_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE routes_id_seq RESTART WITH 1;
ALTER SEQUENCE deliveries_id_seq RESTART WITH 1;
```

---

## 📊 Verificar Estrutura

### Estrutura da tabela drivers

```sql
\d drivers
```

### Estrutura da tabela vehicles

```sql
\d vehicles
```

### Estrutura da tabela routes

```sql
\d routes
```

### Estrutura da tabela deliveries

```sql
\d deliveries
```

---

## 🔍 Verificar Índices

### Listar índices

```sql
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

---

## 📈 Estatísticas

### Tamanho das tabelas

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Contar registros em todas as tabelas

```sql
SELECT 
  tablename,
  (SELECT count(*) FROM (SELECT 1 FROM public.drivers LIMIT 1) AS t) as drivers,
  (SELECT count(*) FROM (SELECT 1 FROM public.vehicles LIMIT 1) AS t) as vehicles,
  (SELECT count(*) FROM (SELECT 1 FROM public.routes LIMIT 1) AS t) as routes,
  (SELECT count(*) FROM (SELECT 1 FROM public.deliveries LIMIT 1) AS t) as deliveries
FROM pg_tables
WHERE schemaname = 'public'
LIMIT 1;
```

---

## 🔗 Conectar ao Banco ERP (Somente Leitura)

```bash
PGPASSWORD=postgres psql -h 192.168.1.17 -U postgres -d salutem
```

### Listar tabelas ERP

```sql
\dt
```

### Buscar pedidos

```sql
SELECT * FROM pedido LIMIT 10;
```

### Buscar clientes

```sql
SELECT * FROM clientes LIMIT 10;
```

### Buscar notas fiscais

```sql
SELECT * FROM nfenotas LIMIT 10;
```

---

## 🚀 Comandos Rápidos via Bash

### Testar conexão Logística

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT 1;"
```

### Contar motoristas

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -t -c "SELECT COUNT(*) FROM drivers;"
```

### Listar motoristas

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, nome, cpf, telefone FROM drivers;"
```

### Executar script SQL

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -f scripts/setup-logistica-correct.sql
```

---

## 📝 Exemplo Completo de Teste

```bash
#!/bin/bash

echo "1. Conectando ao banco..."
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT 1;" || exit 1

echo "2. Contando motoristas..."
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -t -c "SELECT COUNT(*) FROM drivers;"

echo "3. Listando motoristas..."
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, nome, cpf FROM drivers LIMIT 5;"

echo "4. Contando veículos..."
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -t -c "SELECT COUNT(*) FROM vehicles;"

echo "5. Contando rotas..."
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -t -c "SELECT COUNT(*) FROM routes;"

echo "✅ Teste concluído!"
```

---

**Versão:** 1.0
**Data:** 2026-05-19
