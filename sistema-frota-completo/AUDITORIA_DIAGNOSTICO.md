# 🔍 AUDITORIA COMPLETA - GUIA DE DIAGNÓSTICO

**Objetivo:** Encontrar e corrigir o problema que impede o cadastro de motorista de funcionar.

---

## 📋 PASSO 1: Executar Script de Auditoria

No seu servidor Debian, execute:

```bash
cd /opt/logistica_app
bash scripts/audit-complete.sh
```

Este script vai:
- ✅ Verificar conexão com banco Logística
- ✅ Verificar conexão com banco ERP
- ✅ Verificar variáveis de ambiente (.env)
- ✅ Verificar migrations
- ✅ Testar servidor rodando
- ✅ Testar cadastro de motorista via API
- ✅ Mostrar dados no banco

---

## 🧪 PASSO 2: Testes Manuais no Banco

Se o script mostrar erro, execute estes comandos:

### 2.1 - Testar conexão com Logística

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT 1;"
```

**Esperado:** `1` (uma linha com 1)

### 2.2 - Listar tabelas

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "\dt"
```

**Esperado:** Deve listar `drivers`, `vehicles`, `routes`, `deliveries`, etc.

### 2.3 - Verificar estrutura da tabela drivers

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "\d drivers"
```

**Esperado:** Deve mostrar colunas: id, nome, cpf, cnh, telefone, email, ativo, createdAt, updatedAt

### 2.4 - Contar motoristas

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT COUNT(*) FROM drivers;"
```

### 2.5 - Listar últimos motoristas

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT id, nome, cpf, telefone, ativo FROM drivers ORDER BY id DESC LIMIT 5;"
```

---

## 🌐 PASSO 3: Testes na API

### 3.1 - Verificar se servidor está rodando

```bash
curl http://localhost:3000
```

**Esperado:** Retorna HTML (página do sistema)

### 3.2 - Testar health check

```bash
curl http://localhost:3000/api/health
```

**Esperado:** JSON mostrando status dos bancos

### 3.3 - Testar listagem de motoristas

```bash
curl http://localhost:3000/api/trpc/drivers.list
```

### 3.4 - Testar criação de motorista (IMPORTANTE!)

```bash
curl -X POST http://localhost:3000/api/trpc/drivers.create \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "nome": "João Silva",
      "cpf": "12345678901",
      "cnh": "12345678901234",
      "telefone": "11999999999",
      "email": "joao@example.com"
    }
  }'
```

**Esperado:** JSON com sucesso e dados do motorista criado

---

## 🖥️ PASSO 4: Testes no Navegador

### 4.1 - Abrir sistema

Abra no navegador: `http://192.168.1.172:3000` (ou IP do seu servidor)

### 4.2 - Ir para Motoristas

Clique em "Motoristas" no menu lateral

### 4.3 - Cadastrar novo motorista

1. Clique em "Novo Motorista"
2. Preencha:
   - Nome: "Maria Santos"
   - CPF: "98765432100"
   - CNH: "98765432100123"
   - Telefone: "11988888888"
   - Email: "maria@example.com" (opcional)
3. Clique em "Cadastrar"

**Esperado:** Mensagem de sucesso e motorista aparece na tabela

### 4.4 - Verificar no banco

Execute no servidor:

```bash
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "SELECT * FROM drivers WHERE nome = 'Maria Santos';"
```

**Esperado:** Deve retornar a linha com os dados de Maria

---

## ⚠️ POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: "Banco não conectado"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**

```bash
# Verificar .env
cat /opt/logistica_app/.env | grep DATABASE_URL

# Deve retornar:
# DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.172:5432/logistica
# DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
```

Se não estiver, adicione ao `.env`:

```bash
echo "DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.172:5432/logistica" >> /opt/logistica_app/.env
echo "DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem" >> /opt/logistica_app/.env
```

Depois reinicie o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Depois:
pnpm dev
```

### Problema 2: "Tabela motoristas não existe"

**Causa:** Migrations não foram executadas

**Solução:**

```bash
# Executar migrations manualmente
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica < scripts/setup-postgres.sql
```

### Problema 3: "Erro ao cadastrar motorista"

**Causa:** Pode ser validação, banco ou API

**Solução:**

1. Verificar logs do servidor:
   ```bash
   tail -50 /opt/logistica_app/.manus-logs/devserver.log
   ```

2. Verificar erro no navegador (F12 -> Console)

3. Testar via curl (Passo 3.4)

### Problema 4: "CPF/CNH duplicado"

**Causa:** Já existe motorista com este CPF/CNH

**Solução:**

Use CPF e CNH diferentes ou limpe os dados:

```bash
# CUIDADO: Isso deleta TODOS os motoristas!
PGPASSWORD=postgres psql -h 192.168.1.172 -U postgres -d logistica -c "DELETE FROM drivers;"
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

- [ ] Banco Logística conectado
- [ ] Banco ERP conectado
- [ ] Tabela drivers existe
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor rodando em http://localhost:3000
- [ ] /api/health retorna status OK
- [ ] Curl POST drivers.create retorna sucesso
- [ ] Motorista aparece no banco
- [ ] Navegador abre sistema
- [ ] Formulário de motorista abre
- [ ] Cadastro de motorista funciona
- [ ] Motorista aparece na tabela
- [ ] Motorista aparece no banco PostgreSQL

---

## 🆘 PRÓXIMOS PASSOS

Se todos os testes passarem:
1. Teste cadastro de veículo
2. Teste dashboard
3. Teste listagem de pedidos ERP
4. Teste criação de rota

Se algum teste falhar:
1. Copie a saída do script
2. Copie os erros do navegador (F12)
3. Copie os logs do servidor
4. Envie para análise

---

**Versão:** 1.0
**Data:** 2026-05-19
**Status:** Pronto para execução
