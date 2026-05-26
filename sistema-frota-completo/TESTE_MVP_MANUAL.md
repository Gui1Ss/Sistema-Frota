# Guia de Testes Manual do MVP - Logística

Este guia descreve como testar o MVP completo do sistema de logística com os bancos PostgreSQL reais.

## Pré-requisitos

1. **Bancos PostgreSQL rodando:**
   - Banco Logística: `192.168.1.172:5432/logistica`
   - Banco ERP: `192.168.1.17:5432/salutem`

2. **Credenciais:**
   - User: `postgres`
   - Password: `postgres`

3. **Variáveis de ambiente configuradas:**
   ```bash
   export DATABASE_URL_LOGISTICA="postgresql://postgres:postgres@192.168.1.172:5432/logistica"
   export DATABASE_URL_ERP="postgresql://postgres:postgres@192.168.1.17:5432/salutem"
   ```

## Teste 1: Verificar Conexão com Bancos

### No Terminal (Logística):
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT 1"
```

**Resultado esperado:** `1` (conexão bem-sucedida)

### No Terminal (ERP):
```bash
psql -h 192.168.1.17 -U postgres -d salutem -c "SELECT 1"
```

**Resultado esperado:** `1` (conexão bem-sucedida)

---

## Teste 2: Verificar Migrations e Tabelas

### Verificar tabelas no banco Logística:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "\dt"
```

**Tabelas esperadas:**
- `drivers` - Motoristas
- `vehicles` - Veículos
- `routes` - Rotas
- `deliveries` - Entregas
- `operation_logs` - Logs do sistema

### Verificar estrutura da tabela drivers:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "\d drivers"
```

**Colunas esperadas:**
- `id` (serial primary key)
- `nome` (text)
- `cpf` (text unique)
- `cnh` (text)
- `telefone` (text)
- `email` (text)
- `status` (enum: ativo, inativo, suspenso)
- `ativo` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## Teste 3: Testar CRUD de Motoristas via API

### 3.1 - Cadastrar Motorista (POST)

**URL:** `http://localhost:3000/api/trpc/drivers.create`

**Método:** POST

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "cnh": "9876543210",
  "cnhValidade": "2026-12-31",
  "telefone": "11999999999",
  "email": "joao@example.com",
  "endereco": "Rua A, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Motorista criado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    ...
  }
}
```

### 3.2 - Listar Motoristas (GET)

**URL:** `http://localhost:3000/api/trpc/drivers.list`

**Método:** GET

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Motoristas listados com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      ...
    }
  ]
}
```

### 3.3 - Editar Motorista (PUT)

**URL:** `http://localhost:3000/api/trpc/drivers.update`

**Método:** PUT

**Body (JSON):**
```json
{
  "id": 1,
  "telefone": "11987654321",
  "email": "joao.novo@example.com"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Motorista atualizado com sucesso",
  "data": { ... }
}
```

### 3.4 - Inativar Motorista (PATCH)

**URL:** `http://localhost:3000/api/trpc/drivers.deactivate`

**Método:** PATCH

**Body (JSON):**
```json
{
  "id": 1
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Motorista inativado com sucesso",
  "data": { ... }
}
```

### 3.5 - Testar Validação (Enviar sem Nome)

**URL:** `http://localhost:3000/api/trpc/drivers.create`

**Método:** POST

**Body (JSON):**
```json
{
  "nome": "",
  "cpf": "12345678902",
  "cnh": "9876543211",
  "cnhValidade": "2026-12-31",
  "telefone": "11999999998",
  "email": "test@example.com",
  "endereco": "Rua B, 456",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100"
}
```

**Resposta esperada (erro amigável):**
```json
{
  "success": false,
  "message": "Validação falhou",
  "errors": {
    "nome": "Nome deve ter pelo menos 3 caracteres"
  }
}
```

---

## Teste 4: Testar CRUD de Veículos

### 4.1 - Cadastrar Veículo

**URL:** `http://localhost:3000/api/trpc/vehicles.create`

**Método:** POST

**Body (JSON):**
```json
{
  "placa": "ABC1234",
  "modelo": "Hyundai HR",
  "tipo": "VUC",
  "capacidadeKg": 1500,
  "capacidadeM3": 8.5,
  "anoFabricacao": 2024,
  "finalPlaca": 4
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Veículo criado com sucesso",
  "data": {
    "id": 1,
    "placa": "ABC1234",
    ...
  }
}
```

### 4.2 - Listar Veículos

**URL:** `http://localhost:3000/api/trpc/vehicles.list`

**Método:** GET

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Veículos listados com sucesso",
  "data": [
    {
      "id": 1,
      "placa": "ABC1234",
      ...
    }
  ]
}
```

---

## Teste 5: Testar Busca de Pedidos no ERP

### 5.1 - Buscar Pedido no ERP

**URL:** `http://localhost:3000/api/trpc/erp.getPedido`

**Método:** POST

**Body (JSON):**
```json
{
  "numeroPedido": 1001
}
```

**Resposta esperada (se pedido existe):**
```json
{
  "success": true,
  "message": "Pedido encontrado",
  "data": {
    "pedido": {
      "numero": 1001,
      "data": "2026-05-19",
      ...
    },
    "cliente": {
      "nome": "Cliente XYZ",
      "telefone": "11999999999",
      ...
    },
    "endereco": {
      "rua": "Rua X",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310100"
    },
    "notas": [
      {
        "numero": "NFe-001",
        "chaveAcesso": "35240519123456789012345678901234567890123456",
        ...
      }
    ]
  }
}
```

**Resposta esperada (se pedido não existe):**
```json
{
  "success": false,
  "message": "Pedido não encontrado",
  "errors": {
    "numeroPedido": "Pedido 9999 não encontrado no ERP"
  }
}
```

---

## Teste 6: Testar Criação de Rotas

### 6.1 - Criar Rota com Múltiplos Pedidos

**URL:** `http://localhost:3000/api/trpc/routes.create`

**Método:** POST

**Body (JSON):**
```json
{
  "driverId": 1,
  "vehicleId": 1,
  "dataRota": "2026-05-20",
  "pedidos": [
    {
      "numeroPedido": 1001,
      "nomeCliente": "Cliente A",
      "telefone": "11999999999",
      "rua": "Rua A",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310100",
      "sequencia": 1
    },
    {
      "numeroPedido": 1002,
      "nomeCliente": "Cliente B",
      "telefone": "11988888888",
      "rua": "Rua B",
      "numero": "456",
      "bairro": "Vila Mariana",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310200",
      "sequencia": 2
    }
  ]
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Rota criada com sucesso",
  "data": {
    "id": 1,
    "driverId": 1,
    "vehicleId": 1,
    "dataRota": "2026-05-20",
    "status": "planejada",
    "deliveries": [
      {
        "id": 1,
        "numeroPedido": 1001,
        "sequencia": 1,
        "status": "pendente"
      },
      {
        "id": 2,
        "numeroPedido": 1002,
        "sequencia": 2,
        "status": "pendente"
      }
    ]
  }
}
```

---

## Teste 7: Testar Dashboard

### 7.1 - Obter Estatísticas do Dashboard

**URL:** `http://localhost:3000/api/trpc/dashboard.stats`

**Método:** GET

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Estatísticas carregadas com sucesso",
  "data": {
    "totalMotoristas": 1,
    "totalVeiculos": 1,
    "totalRotas": 1,
    "totalEntregas": 2,
    "entregasPendentes": 2,
    "entregasConcluidas": 0,
    "taxaOcupacao": 0.5
  }
}
```

---

## Teste 8: Testar Tratamento de Erros

### 8.1 - Banco Indisponível

Se o banco não estiver acessível, a resposta deve ser:
```json
{
  "success": false,
  "message": "Banco de dados não disponível",
  "errors": {
    "database": "Não foi possível conectar ao banco de dados"
  }
}
```

### 8.2 - Pedido Inexistente

**URL:** `http://localhost:3000/api/trpc/erp.getPedido`

**Body:**
```json
{
  "numeroPedido": 99999
}
```

**Resposta esperada:**
```json
{
  "success": false,
  "message": "Pedido não encontrado",
  "errors": {
    "numeroPedido": "Pedido 99999 não encontrado no ERP"
  }
}
```

### 8.3 - Campo Obrigatório Vazio

**URL:** `http://localhost:3000/api/trpc/drivers.create`

**Body (sem CPF):**
```json
{
  "nome": "João Silva",
  "cpf": "",
  "cnh": "9876543210",
  ...
}
```

**Resposta esperada:**
```json
{
  "success": false,
  "message": "Validação falhou",
  "errors": {
    "cpf": "CPF deve ter 11 dígitos"
  }
}
```

---

## Teste 9: Verificar Dados no Banco

### Verificar motoristas cadastrados:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, nome, cpf, telefone, ativo FROM drivers;"
```

### Verificar veículos cadastrados:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, placa, modelo, tipo, ativo FROM vehicles;"
```

### Verificar rotas criadas:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, driver_id, vehicle_id, data_rota, status FROM routes;"
```

### Verificar entregas:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, route_id, numero_pedido, status FROM deliveries;"
```

### Verificar logs do sistema:
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, modulo, acao, timestamp FROM operation_logs ORDER BY timestamp DESC LIMIT 10;"
```

---

## Teste 10: Testar Frontend

### 10.1 - Acessar o Sistema

1. Abra o navegador e acesse: `http://localhost:3000`
2. Clique em "Entrar no Sistema"
3. Faça login com suas credenciais Manus

### 10.2 - Testar Tela de Motoristas

1. No menu lateral, clique em "Motoristas"
2. Clique em "Novo Motorista"
3. Preencha os dados:
   - Nome: João Silva
   - CPF: 12345678901
   - CNH: 9876543210
   - Telefone: 11999999999
   - Email: joao@example.com
   - Endereço: Rua A, 123
   - Cidade: São Paulo
   - Estado: SP
   - CEP: 01310100
4. Clique em "Salvar"
5. Verifique se a mensagem de sucesso aparece
6. Verifique se o motorista aparece na lista

### 10.3 - Testar Tela de Veículos

1. No menu lateral, clique em "Veículos"
2. Clique em "Novo Veículo"
3. Preencha os dados:
   - Placa: ABC1234
   - Modelo: Hyundai HR
   - Tipo: VUC
   - Capacidade (kg): 1500
   - Capacidade (m³): 8.5
4. Clique em "Salvar"
5. Verifique se o veículo aparece na lista

### 10.4 - Testar Tela de Rotas

1. No menu lateral, clique em "Rotas"
2. Clique em "Nova Rota"
3. Selecione um motorista e um veículo
4. Clique em "Buscar Pedido" e digite um número de pedido
5. Verifique se os dados do pedido aparecem (do ERP)
6. Clique em "Adicionar Pedido"
7. Clique em "Criar Rota"
8. Verifique se a rota foi criada com sucesso

### 10.5 - Testar Tela de Dashboard

1. No menu lateral, clique em "Dashboard"
2. Verifique se as estatísticas aparecem:
   - Total de Motoristas
   - Total de Veículos
   - Total de Rotas
   - Total de Entregas
   - Entregas Pendentes
   - Entregas Concluídas

---

## Checklist de Testes

- [ ] Conexão com banco Logística OK
- [ ] Conexão com banco ERP OK
- [ ] Tabelas criadas no banco Logística
- [ ] Cadastrar motorista OK
- [ ] Listar motoristas OK
- [ ] Editar motorista OK
- [ ] Inativar motorista OK
- [ ] Validação de campos obrigatórios OK
- [ ] Cadastrar veículo OK
- [ ] Listar veículos OK
- [ ] Buscar pedido no ERP OK
- [ ] Criar rota com múltiplos pedidos OK
- [ ] Dashboard carrega estatísticas OK
- [ ] Tratamento de erros OK
- [ ] Frontend carrega sem erros OK
- [ ] Tela de motoristas funciona OK
- [ ] Tela de veículos funciona OK
- [ ] Tela de rotas funciona OK
- [ ] Dados salvos corretamente no banco OK

---

## Comandos Úteis

### Executar script de testes automáticos:
```bash
cd /home/ubuntu/logistica_app
node scripts/test-mvp-complete.mjs
```

### Limpar dados de teste (CUIDADO!):
```bash
psql -h 192.168.1.172 -U postgres -d logistica -c "DELETE FROM deliveries; DELETE FROM routes; DELETE FROM drivers; DELETE FROM vehicles;"
```

### Verificar logs do servidor:
```bash
tail -f /home/ubuntu/logistica_app/.manus-logs/devserver.log
```

### Verificar logs de erro:
```bash
tail -f /home/ubuntu/logistica_app/.manus-logs/browserConsole.log
```

---

## Próximos Passos

Após validar todos os testes:

1. **Upload de Foto de Canhoto** - Implementar endpoint para upload de imagem
2. **Mapa Interativo** - Integrar Google Maps para visualizar rotas
3. **Rastreamento em Tempo Real** - Implementar GPS tracking
4. **Notificações WhatsApp** - Integrar API WhatsApp para notificações
5. **Sincronização Offline** - Implementar cache local para modo offline

---

**Data de Criação:** 2026-05-19
**Versão:** 1.0
**Status:** MVP Pronto para Testes
