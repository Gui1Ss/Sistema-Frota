# 📋 GUIA COMPLETO DE INSTALAÇÃO NO DEBIAN

**Objetivo:** Instalar e configurar o Sistema de Logística no seu servidor Debian local.

---

## 🚀 PASSO 1: Preparar o Servidor

### 1.1 - Atualizar pacotes

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 1.2 - Instalar dependências básicas

```bash
sudo apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  postgresql-client
```

---

## 📦 PASSO 2: Instalar Node.js e pnpm

### 2.1 - Instalar Node.js 20

```bash
# Usando NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 - Verificar instalação

```bash
node --version
npm --version
```

### 2.3 - Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

---

## 📂 PASSO 3: Clonar e Preparar Projeto

### 3.1 - Clonar repositório

```bash
cd /opt
sudo git clone <seu-repositorio> logistica_app
cd logistica_app
```

### 3.2 - Instalar dependências do projeto

```bash
pnpm install
```

---

## 🔧 PASSO 4: Configurar Variáveis de Ambiente

### 4.1 - Criar arquivo .env

```bash
cp ENV_EXAMPLE.md .env
```

### 4.2 - Editar .env com suas credenciais

```bash
nano .env
```

**Valores importantes:**

```
DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.178:5432/logistica
DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
NODE_ENV=development
PORT=3000
```

### 4.3 - Salvar e sair

```
Ctrl+X, Y, Enter
```

---

## 🗄️ PASSO 5: Configurar Banco de Dados

### 5.1 - Testar conexão com banco Logística

```bash
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "SELECT 1;"
```

**Esperado:** Retorna `1`

### 5.2 - Executar setup do banco

```bash
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -f scripts/setup-logistica-correct.sql
```

### 5.3 - Verificar se tabelas foram criadas

```bash
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "\dt"
```

**Esperado:** Deve listar tabelas: drivers, vehicles, routes, deliveries, etc.

### 5.4 - Verificar estrutura da tabela drivers

```bash
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "\d drivers"
```

---

## 🏗️ PASSO 6: Build do Projeto

### 6.1 - Compilar TypeScript

```bash
pnpm check
```

### 6.2 - Build para produção (opcional)

```bash
pnpm build
```

---

## ▶️ PASSO 7: Iniciar o Sistema

### 7.1 - Modo desenvolvimento

```bash
pnpm dev
```

**Esperado:** Deve aparecer:
```
Server running on http://localhost:3000/
```

### 7.2 - Deixar rodando

Deixe este terminal aberto com o servidor rodando.

---

## ✅ PASSO 8: Testar o Sistema

### 8.1 - Em outro terminal, executar diagnóstico

```bash
cd /opt/logistica_app
bash scripts/diagnostico-local.sh
```

### 8.2 - Testar health check

```bash
curl http://localhost:3000/api/health | jq .
```

**Esperado:** JSON com status dos bancos

### 8.3 - Abrir no navegador

```
http://192.168.1.178:3000
```

ou

```
http://localhost:3000
```

---

## 🧪 PASSO 9: Testar Cadastro de Motorista

### 9.1 - Via navegador

1. Abra: `http://192.168.1.178:3000`
2. Clique em "Motoristas"
3. Clique em "Novo Motorista"
4. Preencha:
   - Nome: "João Silva"
   - CPF: "12345678901"
   - CNH: "12345678901234"
   - Telefone: "11999999999"
   - Email: "joao@example.com" (opcional)
5. Clique em "Cadastrar"

### 9.2 - Verificar no banco

```bash
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "SELECT * FROM drivers;"
```

**Esperado:** Deve retornar a linha com João Silva

### 9.3 - Via API (curl)

```bash
curl -X POST http://localhost:3000/api/trpc/drivers.create \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "nome": "Maria Santos",
      "cpf": "98765432100",
      "cnh": "98765432100123",
      "telefone": "11988888888",
      "email": "maria@example.com"
    }
  }'
```

---

## 📊 PASSO 10: Testar Outros Recursos

### 10.1 - Listar motoristas

```bash
curl http://localhost:3000/api/trpc/drivers.list
```

### 10.2 - Listar veículos

```bash
curl http://localhost:3000/api/trpc/vehicles.list
```

### 10.3 - Dashboard

```bash
curl http://localhost:3000/api/trpc/dashboard.getSummary
```

---

## 🔍 PASSO 11: Diagnóstico Completo

Se algo não funcionar, execute:

```bash
bash scripts/diagnostico-local.sh
```

Este script verifica:
- ✅ Node.js instalado
- ✅ pnpm instalado
- ✅ Arquivo .env existe
- ✅ DATABASE_URL_LOGISTICA configurada
- ✅ DATABASE_URL_ERP configurada
- ✅ Conexão com banco Logística
- ✅ Conexão com banco ERP
- ✅ Tabela drivers existe
- ✅ Servidor rodando
- ✅ /api/health OK

---

## 🛑 PASSO 12: Parar o Sistema

```bash
# No terminal onde está rodando pnpm dev:
Ctrl+C
```

---

## 🔄 PASSO 13: Reiniciar o Sistema

```bash
# No diretório do projeto:
pnpm dev
```

---

## 📝 TROUBLESHOOTING

### Problema: "Banco não conectado"

**Solução:**

```bash
# Verificar variáveis de ambiente
cat .env | grep DATABASE_URL

# Testar conexão manualmente
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "SELECT 1;"
```

### Problema: "Tabela drivers não existe"

**Solução:**

```bash
# Executar setup
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -f scripts/setup-logistica-correct.sql

# Verificar
PGPASSWORD=postgres psql -h 192.168.1.178 -U postgres -d logistica -c "\dt"
```

### Problema: "Erro ao cadastrar motorista"

**Solução:**

1. Verificar logs:
   ```bash
   tail -50 .manus-logs/devserver.log
   ```

2. Verificar erro no navegador (F12 -> Console)

3. Testar via curl:
   ```bash
   curl -X POST http://localhost:3000/api/trpc/drivers.create \
     -H "Content-Type: application/json" \
     -d '{"json": {"nome": "Teste", "cpf": "12345678901", "cnh": "12345678901234", "telefone": "11999999999"}}'
   ```

### Problema: "Porta 3000 já está em uso"

**Solução:**

```bash
# Encontrar processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm dev
```

---

## 📋 CHECKLIST FINAL

- [ ] Node.js instalado
- [ ] pnpm instalado
- [ ] Projeto clonado em /opt/logistica_app
- [ ] Dependências instaladas (pnpm install)
- [ ] .env configurado com DATABASE_URL_LOGISTICA e DATABASE_URL_ERP
- [ ] Banco Logística conectado
- [ ] Tabelas criadas (setup-logistica-correct.sql executado)
- [ ] Servidor rodando (pnpm dev)
- [ ] Health check OK (curl http://localhost:3000/api/health)
- [ ] Navegador abre sistema
- [ ] Cadastro de motorista funciona
- [ ] Motorista aparece no banco

---

## 🎯 PRÓXIMOS PASSOS

Depois que o cadastro de motorista funcionar:

1. Testar cadastro de veículo
2. Testar dashboard
3. Testar listagem de pedidos ERP
4. Testar criação de rota
5. Testar entregas

---

**Versão:** 1.0
**Data:** 2026-05-19
**Status:** Pronto para execução
