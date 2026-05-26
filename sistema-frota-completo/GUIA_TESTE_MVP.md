# Guia de Teste - MVP Logística

## 🚀 Início Rápido

### 1. Aplicar Migrations no Banco Logística

```bash
# Conectar ao PostgreSQL e executar:
psql -h 192.168.1.172 -U postgres -d logistica -f drizzle/migrations/0002_create_logistica_tables.sql
```

### 2. Iniciar o Sistema

```bash
cd /home/ubuntu/logistica_app
pnpm install
pnpm dev
```

Acesse: `http://localhost:3000`

---

## 📋 Testes Obrigatórios

### ✅ Teste 1: Health Check
**Endpoint:** `GET /api/trpc/health.check`

**Esperado:**
```json
{
  "success": true,
  "data": {
    "backend": "online",
    "logisticaDb": "connected",
    "erpDb": "connected"
  }
}
```

---

### ✅ Teste 2: Cadastrar Motorista

**Endpoint:** `POST /api/trpc/drivers.create`

**Payload:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "cnh": "9876543210",
  "telefone": "11999999999",
  "email": "joao@example.com",
  "status": "ativo"
}
```

**Esperado:**
```json
{
  "success": true,
  "message": "Motorista cadastrado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "ativo": true,
    "createdAt": "2026-05-19T11:30:00.000Z"
  }
}
```

**Teste com erro:**
- Enviar sem `nome` → Erro de validação
- Enviar CPF duplicado → Erro "Já existe um motorista com este CPF"
- Enviar dados inválidos → Erro de validação sem derrubar servidor

---

### ✅ Teste 3: Listar Motoristas

**Endpoint:** `GET /api/trpc/drivers.list`

**Esperado:**
```json
{
  "success": true,
  "message": "1 motorista(s) encontrado(s)",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "ativo": true
    }
  ]
}
```

---

### ✅ Teste 4: Cadastrar Veículo

**Endpoint:** `POST /api/trpc/vehicles.create`

**Payload:**
```json
{
  "placa": "ABC1234",
  "modelo": "Hyundai HR",
  "tipo": "VUC",
  "capacidadeKg": 1500,
  "capacidadeM3": 8.5
}
```

**Esperado:**
```json
{
  "success": true,
  "message": "Veículo cadastrado com sucesso",
  "data": {
    "id": 1,
    "placa": "ABC1234",
    "modelo": "Hyundai HR",
    "tipo": "VUC",
    "ativo": true
  }
}
```

---

### ✅ Teste 5: Listar Veículos

**Endpoint:** `GET /api/trpc/vehicles.list`

**Esperado:**
```json
{
  "success": true,
  "message": "1 veículo(s) encontrado(s)",
  "data": [
    {
      "id": 1,
      "placa": "ABC1234",
      "modelo": "Hyundai HR",
      "ativo": true
    }
  ]
}
```

---

### ✅ Teste 6: Buscar Pedido no ERP

**Endpoint:** `GET /api/trpc/erp.getPedido?input={"numeroPedido":123}`

**Esperado (se pedido existe no ERP):**
```json
{
  "success": true,
  "message": "Pedido encontrado",
  "data": {
    "pedido": { /* dados do pedido */ },
    "notas": [ /* notas fiscais */ ],
    "cliente": { /* dados do cliente */ },
    "endereco": { /* endereço de entrega */ }
  }
}
```

**Esperado (se pedido não existe):**
```json
{
  "success": false,
  "message": "Pedido 123 não encontrado no ERP"
}
```

---

### ✅ Teste 7: Criar Rota com Pedidos

**Endpoint:** `POST /api/trpc/routes.create`

**Payload:**
```json
{
  "driverId": 1,
  "vehicleId": 1,
  "dataRota": "2026-05-20T00:00:00.000Z",
  "pedidos": [
    {
      "numeroPedido": 123,
      "nomeCliente": "Cliente A",
      "telefone": "11988888888",
      "rua": "Rua A",
      "numero": "100",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310100",
      "sequencia": 1
    }
  ]
}
```

**Esperado:**
```json
{
  "success": true,
  "message": "Rota criada com 1 entrega(s)",
  "data": {
    "route": { "id": 1, "status": "planejada" },
    "deliveries": [ /* entregas */ ]
  }
}
```

---

### ✅ Teste 8: Dashboard - Resumo Geral

**Endpoint:** `GET /api/trpc/dashboard.getSummary`

**Esperado:**
```json
{
  "success": true,
  "message": "Resumo obtido com sucesso",
  "data": {
    "motoristas": 1,
    "veiculos": 1,
    "rotas": 1,
    "entregas": 1,
    "entregasPendentes": 1,
    "entregasConcluidas": 0
  }
}
```

---

### ✅ Teste 9: Editar Motorista

**Endpoint:** `POST /api/trpc/drivers.update`

**Payload:**
```json
{
  "id": 1,
  "data": {
    "telefone": "11987654321"
  }
}
```

**Esperado:**
```json
{
  "success": true,
  "message": "Motorista atualizado com sucesso",
  "data": {
    "id": 1,
    "telefone": "11987654321"
  }
}
```

---

### ✅ Teste 10: Inativar Motorista

**Endpoint:** `POST /api/trpc/drivers.deactivate`

**Payload:**
```json
{
  "id": 1
}
```

**Esperado:**
```json
{
  "success": true,
  "message": "Motorista inativado com sucesso",
  "data": {
    "id": 1,
    "ativo": false
  }
}
```

---

## 🔍 Verificar Dados no Banco

### Verificar motoristas
```sql
SELECT * FROM drivers;
```

### Verificar veículos
```sql
SELECT * FROM vehicles;
```

### Verificar rotas
```sql
SELECT * FROM routes;
```

### Verificar entregas
```sql
SELECT * FROM deliveries;
```

### Verificar logs
```sql
SELECT * FROM operationLogs ORDER BY createdAt DESC LIMIT 10;
```

---

## 📊 Verificar Conexões

### Testar conexão com banco Logística
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT 1;"
```

### Testar conexão com banco ERP
```bash
psql -h 192.168.1.17 -U postgres -d salutem -c "SELECT 1;"
```

---

## ✅ Checklist de Validação

- [ ] Backend sobe sem erros
- [ ] Health check retorna status das duas conexões
- [ ] Cadastrar motorista com sucesso
- [ ] Listar motoristas
- [ ] Cadastrar veículo com sucesso
- [ ] Listar veículos
- [ ] Buscar pedido no ERP
- [ ] Criar rota com pedidos
- [ ] Dashboard mostra estatísticas
- [ ] Editar motorista
- [ ] Inativar motorista
- [ ] Dados aparecem no banco Logística
- [ ] Nenhum erro derruba o servidor
- [ ] Erros retornam mensagem amigável

---

## 🐛 Troubleshooting

### Erro: "Banco de dados não disponível"
- Verificar se as variáveis de ambiente estão corretas
- Testar conexão com `psql`

### Erro: "Tabelas não existem"
- Executar migration: `psql -h 192.168.1.172 -U postgres -d logistica -f drizzle/migrations/0002_create_logistica_tables.sql`

### Erro: "Pedido não encontrado no ERP"
- Verificar se o número do pedido existe no banco ERP
- Verificar nomes das tabelas no ERP

### Servidor cai ao cadastrar motorista
- Verificar logs: `tail -f .manus-logs/devserver.log`
- Verificar validação de entrada
- Verificar se banco está acessível

---

## 📝 Notas

- Todos os endpoints retornam JSON padronizado
- Erros nunca derrubam o servidor
- Logs são registrados em `operationLogs`
- Banco ERP é somente leitura
- Banco Logística armazena dados do sistema
