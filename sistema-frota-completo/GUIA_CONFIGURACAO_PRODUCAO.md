# Guia de Configuração - Sistema de Frota com PostgreSQL Real

**Data:** 19 de Maio de 2026  
**Status:** ✅ Pronto para Produção

---

## 📋 Pré-requisitos

Você precisa ter:
- 2 bancos PostgreSQL configurados e acessíveis
- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)

---

## 🗄️ Estrutura de Bancos de Dados

O projeto usa **2 bancos PostgreSQL**:

### 1. Banco de Logística (Banco Principal)
- **Propósito:** Armazenar dados do sistema (motoristas, veículos, rotas, entregas)
- **Tabelas:** `users`, `drivers`, `vehicles`, `routes`, `deliveries`, `proof_photos`, `gps_tracking`, `delivery_status_history`, `whatsapp_notifications`, `system_config`, `operation_logs`
- **Acesso:** Leitura e Escrita

### 2. Banco ERP (Banco de Leitura)
- **Propósito:** Integração com sistema ERP existente (somente leitura)
- **Tabelas Esperadas:** `pedido`, `nfenotas`, `clientes`, `enderecos`
- **Acesso:** Somente Leitura

---

## 🔧 Configuração do Arquivo `.env`

### Passo 1: Copiar o arquivo de exemplo
```bash
cd /path/to/Sistema-Frota
cp ENV_EXAMPLE.md .env
```

### Passo 2: Configurar as variáveis de ambiente

Edite o arquivo `.env` com suas credenciais reais:

```bash
# ============================================
# BANCO DE DADOS - LOGÍSTICA (Banco Principal)
# ============================================
DATABASE_URL_LOGISTICA=postgresql://usuario:senha@host:5432/nome_banco

# Exemplo:
# DATABASE_URL_LOGISTICA=postgresql://postgres:senha123@192.168.1.178:5432/logistica

# ============================================
# BANCO DE DADOS - ERP (Somente Leitura)
# ============================================
DATABASE_URL_ERP=postgresql://usuario:senha@host:5432/nome_banco

# Exemplo:
# DATABASE_URL_ERP=postgresql://postgres:senha123@192.168.1.17:5432/salutem

# ============================================
# AMBIENTE
# ============================================
NODE_ENV=development  # ou production
PORT=3000

# ============================================
# AUTENTICAÇÃO (MVP: Desativado)
# ============================================
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
JWT_SECRET=sua-chave-secreta-aqui

# ============================================
# INFORMAÇÕES DO PROPRIETÁRIO
# ============================================
OWNER_NAME=Sistema de Logística
OWNER_OPEN_ID=

# ============================================
# INTEGRAÇÕES (Opcional)
# ============================================
GOOGLE_MAPS_API_KEY=
WHATSAPP_API_KEY=
WHATSAPP_API_URL=

# ============================================
# CONFIGURAÇÕES DO SISTEMA
# ============================================
GPS_TRACKING_INTERVAL_SECONDS=60
ROUTE_DEVIATION_TOLERANCE_METERS=100
```

---

## 🚀 Iniciando o Projeto

### Passo 1: Instalar dependências
```bash
cd /path/to/Sistema-Frota
pnpm install
```

### Passo 2: Executar migrations (primeira vez)
```bash
pnpm db:push
```

Este comando:
- Gera os arquivos de migração do Drizzle
- Cria todas as tabelas no banco de Logística
- Configura enums, índices e constraints

### Passo 3: Iniciar o servidor de desenvolvimento
```bash
pnpm dev
```

O servidor estará disponível em: `http://localhost:3000`

---

## ✅ Verificar Conexão

### Via Browser
1. Abra `http://localhost:3000` no navegador
2. Clique em "Entrar no Sistema"
3. Você deve ver o Dashboard com estatísticas

### Via API (curl)

**Listar motoristas:**
```bash
curl http://localhost:3000/api/trpc/drivers.list
```

**Listar veículos:**
```bash
curl http://localhost:3000/api/trpc/vehicles.list
```

**Verificar saúde do sistema:**
```bash
curl http://localhost:3000/api/trpc/health.getStatus
```

---

## 📊 Estrutura de Tabelas

### Tabela: `drivers` (Motoristas)
```sql
id              INTEGER PRIMARY KEY
nome            VARCHAR(100) NOT NULL
cpf             VARCHAR(11) NOT NULL UNIQUE
cnh             VARCHAR(20) NOT NULL UNIQUE
cnhValidade     TIMESTAMP
telefone        VARCHAR(20) NOT NULL
email           VARCHAR(320)
endereco        VARCHAR(255)
cidade          VARCHAR(100)
estado          VARCHAR(2)
cep             VARCHAR(9)
ativo           BOOLEAN DEFAULT true
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

### Tabela: `vehicles` (Veículos)
```sql
id              INTEGER PRIMARY KEY
placa           VARCHAR(8) NOT NULL UNIQUE
modelo          ENUM('Hyundai HR', 'Iveco Daily', 'Fiat Ducato', 'Mercedes Sprinter', 'Renault Master', 'Kia Bongo')
tipo            ENUM('VUC', 'VAN', 'CAMINHAO') DEFAULT 'VUC'
capacidadeKg    NUMERIC(10,2) NOT NULL
capacidadeM3    NUMERIC(10,2) NOT NULL
altura          NUMERIC(5,2)
largura         NUMERIC(5,2)
comprimento     NUMERIC(5,2)
peso            NUMERIC(10,2)
ativo           BOOLEAN DEFAULT true
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

### Tabela: `routes` (Rotas)
```sql
id              INTEGER PRIMARY KEY
dataRota        TIMESTAMP NOT NULL
motorista_id    INTEGER REFERENCES drivers(id)
veiculo_id      INTEGER REFERENCES vehicles(id)
status          ENUM('planejada', 'em_rota', 'concluida', 'cancelada') DEFAULT 'planejada'
kmInicial       NUMERIC(10,2)
kmFinal         NUMERIC(10,2)
ativo           BOOLEAN DEFAULT true
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

### Tabela: `deliveries` (Entregas)
```sql
id              INTEGER PRIMARY KEY
rota_id         INTEGER REFERENCES routes(id)
numero_pedido   VARCHAR(50) NOT NULL
cliente         VARCHAR(255)
telefone        VARCHAR(20)
endereco        VARCHAR(255)
numero          VARCHAR(10)
complemento     VARCHAR(255)
bairro          VARCHAR(100)
cidade          VARCHAR(100)
estado          VARCHAR(2)
cep             VARCHAR(9)
status          ENUM('pendente', 'em_rota', 'entregue', 'nao_entregue', 'devolvido') DEFAULT 'pendente'
chaveAcesso     VARCHAR(50)
tentativas      INTEGER DEFAULT 0
observacoes     TEXT
dataEntrega     TIMESTAMP
ativo           BOOLEAN DEFAULT true
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

---

## 🧪 Testando Funcionalidades

### 1. Cadastrar Motorista
```bash
curl -X POST http://localhost:3000/api/trpc/drivers.create \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "cnh": "98765432100",
    "cnhValidade": "2026-12-31T00:00:00Z",
    "telefone": "11999999999",
    "email": "joao@example.com",
    "endereco": "Rua A, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310100"
  }'
```

### 2. Listar Motoristas
```bash
curl http://localhost:3000/api/trpc/drivers.list
```

### 3. Cadastrar Veículo
```bash
curl -X POST http://localhost:3000/api/trpc/vehicles.create \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC1234",
    "modelo": "Hyundai HR",
    "tipo": "VUC",
    "capacidadeKg": 1500,
    "capacidadeM3": 8.5
  }'
```

### 4. Criar Rota com Entregas
```bash
curl -X POST http://localhost:3000/api/trpc/routes.create \
  -H "Content-Type: application/json" \
  -d '{
    "motoristaId": 1,
    "veiculoId": 1,
    "dataRota": "2026-05-19T08:00:00Z",
    "pedidos": [
      {
        "numeroPedido": "PED001",
        "nomeCliente": "Cliente A",
        "telefone": "11987654321",
        "rua": "Rua B",
        "numero": "456",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01310200"
      }
    ]
  }'
```

---

## 🔍 Troubleshooting

### Problema: "Banco de dados não disponível"
**Solução:**
1. Verifique se as variáveis `DATABASE_URL_LOGISTICA` e `DATABASE_URL_ERP` estão corretas
2. Teste a conexão com psql:
   ```bash
   psql postgresql://usuario:senha@host:5432/nome_banco -c "SELECT 1"
   ```
3. Verifique se o firewall permite conexão na porta 5432
4. Verifique os logs: `tail -f .manus-logs/devserver.log`

### Problema: "Erro ao criar motorista"
**Solução:**
1. Verifique se o banco de dados foi criado com as migrations
2. Verifique se as tabelas existem:
   ```bash
   psql postgresql://usuario:senha@host:5432/nome_banco -c "\dt"
   ```
3. Verifique se há CPF/CNH duplicados

### Problema: "Timeout na requisição"
**Solução:**
1. Verifique a latência de rede para o banco
2. Aumente o timeout em `server/_core/index.ts` se necessário
3. Reinicie o servidor: `pnpm dev`

---

## 📝 Próximos Passos

1. **Conectar seus bancos PostgreSQL reais**
   - Configure as variáveis `DATABASE_URL_LOGISTICA` e `DATABASE_URL_ERP`
   - Execute `pnpm db:push` para criar as tabelas

2. **Testar todas as funcionalidades**
   - Cadastre motoristas, veículos e rotas
   - Verifique se os dados aparecem no Dashboard

3. **Integração com ERP**
   - Configure as tabelas esperadas no banco ERP
   - Teste a busca de pedidos ao criar rotas

4. **Reativar OAuth em Produção** (Opcional)
   - Se desejar usar autenticação real, siga o guia em `MVP_SEM_OAUTH.md`

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `tail -f .manus-logs/devserver.log`
2. Verifique a saúde do sistema: `curl http://localhost:3000/api/trpc/health.getStatus`
3. Consulte o arquivo `DIAGNOSTICO_E_CORRECOES.md` para problemas conhecidos

---

**Versão:** 1.0.0  
**Data:** 2026-05-19  
**Testado em:** PostgreSQL 14+
