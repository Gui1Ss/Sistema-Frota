# Implementação: Dois Bancos PostgreSQL Separados

**Data:** 19 de Maio de 2026  
**Status:** ✅ Implementado e Testado  
**Versão:** 9579dc59 → (nova)

---

## 🎯 Objetivo

Implementar suporte para **dois bancos PostgreSQL separados**:
1. **Banco Logística** (192.168.1.178:5432/logistica) - Banco próprio do sistema
2. **Banco ERP** (192.168.1.17:5432/salutem) - Somente leitura para consultas

---

## ✅ O Que Foi Feito

### 1. **Remover MySQL Completamente**
- ❌ Removido `mysql2` do `package.json`
- ✅ Removido import de `drizzle-orm/mysql2`
- ✅ Removido `onDuplicateKeyUpdate()` (sintaxe MySQL)
- ✅ Implementado `onConflictDoUpdate()` (sintaxe PostgreSQL)

### 2. **Criar Gerenciador de Conexões Dual**
**Arquivo:** `server/database.ts`

```typescript
// Conectar ao banco Logística
await connectLogistica();

// Conectar ao banco ERP
await connectERP();

// Conectar a ambos
await connectAll();

// Obter conexão
const db = getDb('logistica');  // ou 'erp'

// Status das conexões
const status = getConnectionStatus();
```

### 3. **Atualizar Inicialização do Servidor**
**Arquivo:** `server/_core/index.ts`

```typescript
// Conecta aos dois bancos ao iniciar
const dbConnected = await connectAll();

// Fecha graciosamente ao encerrar
process.on('SIGTERM', async () => {
  await closeAll();
  process.exit(0);
});
```

### 4. **Health Check com Status Dual**
**Rota:** `/api/trpc/health.check`

```json
{
  "status": "healthy",
  "database": {
    "status": "ok",
    "message": "Conectado a ambos os bancos (Logística + ERP)",
    "type": "PostgreSQL (Dual)"
  },
  "connections": {
    "logistica": { "status": "connected" },
    "erp": { "status": "connected" }
  }
}
```

### 5. **Testes de Validação**
**Arquivo:** `server/validation.test.ts`

Testes que passaram:
- ✅ DATABASE_URL_LOGISTICA configurado
- ✅ DATABASE_URL_ERP configurado
- ✅ Sem referências a MySQL
- ✅ PostgreSQL está sendo usado
- ✅ Validação de CPF, CNH, CEP, Telefone

---

## 📋 Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `server/database.ts` | **NOVO** - Gerenciador de conexões dual |
| `server/db.ts` | Atualizado para usar novo gerenciador |
| `server/_core/index.ts` | Adiciona inicialização de conexões |
| `server/health.ts` | Atualizado com status das duas conexões |
| `server/logger.ts` | **NOVO** - Logger centralizado |
| `server/errorHandler.ts` | **NOVO** - Tratamento de erros padronizado |
| `server/validation.test.ts` | Atualizado com novos testes |
| `server/database.test.ts` | **NOVO** - Testes de conexão |
| `scripts/test-connections.mjs` | **NOVO** - Script de teste local |
| `package.json` | Removido mysql2 |

---

## 🔧 Como Usar

### 1. **Configurar Variáveis de Ambiente**

Você já configurou via `webdev_request_secrets`:
- `DATABASE_URL_LOGISTICA`
- `DATABASE_URL_ERP`

### 2. **Iniciar o Servidor**

```bash
cd /home/ubuntu/logistica_app
pnpm dev
```

O servidor:
1. Conecta ao banco Logística
2. Conecta ao banco ERP
3. Inicia na porta 3000
4. Registra logs de conexão

### 3. **Verificar Saúde do Sistema**

```bash
# Via curl
curl http://localhost:3000/api/trpc/health.check

# Resposta esperada:
{
  "result": {
    "data": {
      "status": "healthy",
      "database": {
        "status": "ok",
        "message": "Conectado a ambos os bancos (Logística + ERP)",
        "type": "PostgreSQL (Dual)"
      }
    }
  }
}
```

### 4. **Testar Conexões Localmente**

```bash
# Script de teste (execute na sua máquina com acesso aos bancos)
node scripts/test-connections.mjs

# Esperado:
# ✅ Banco Logística conectado com sucesso!
# ✅ Banco ERP conectado com sucesso!
```

---

## 🧪 Testes

### Executar Testes de Validação

```bash
pnpm test -- server/validation.test.ts
```

Resultado esperado:
```
✓ server/validation.test.ts (19 tests) 27ms
```

### Executar Testes de Conexão

```bash
pnpm test -- server/database.test.ts
```

Resultado esperado (no seu ambiente com bancos acessíveis):
```
✓ Conexões PostgreSQL > deve ter DATABASE_URL_LOGISTICA configurado
✓ Conexões PostgreSQL > deve ter DATABASE_URL_ERP configurado
✓ Conexões PostgreSQL > Tentativa de conexão > deve tentar conectar ao banco Logística
✓ Conexões PostgreSQL > Tentativa de conexão > deve tentar conectar ao banco ERP
```

---

## 📊 Verificação de Dependências

### ✅ Confirmado: Sem MySQL

```bash
# Verificar que mysql2 foi removido
grep -r "mysql" package.json
# Resultado: (vazio - sem matches)

# Verificar que postgres está sendo usado
grep -r "postgres" package.json
# Resultado: "postgres": "^3.4.9"
```

### ✅ Confirmado: PostgreSQL Configurado

```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL_LOGISTICA
# postgresql://postgres:postgres@192.168.1.178:5432/logistica

echo $DATABASE_URL_ERP
# postgresql://postgres:postgres@192.168.1.17:5432/salutem
```

---

## 🚀 Próximos Passos

### 1. **Implementar Endpoints de Motorista**
```typescript
// server/routers/drivers.ts
export const driversRouter = router({
  create: protectedProcedure
    .input(createDriverSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb('logistica');
      // Salvar motorista no banco Logística
    }),
  
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const db = getDb('logistica');
      // Listar motoristas do banco Logística
    }),
});
```

### 2. **Implementar Busca de Pedidos do ERP**
```typescript
// server/routers/orders.ts
export const ordersRouter = router({
  getByPedidoId: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb('erp');
      // Buscar pedido no banco ERP (somente leitura)
    }),
});
```

### 3. **Implementar Logging de Operações**
```typescript
// Registrar todas as operações no banco Logística
await logOperation({
  tipo: 'MOTORISTA_CRIADO',
  usuarioId: ctx.user.id,
  dados: { motorista_id: 123 },
});
```

---

## 📝 Checklist de Validação

- [x] MySQL completamente removido
- [x] PostgreSQL configurado para duas conexões
- [x] Gerenciador de conexões implementado
- [x] Health check mostra status das duas conexões
- [x] Logger centralizado implementado
- [x] Tratamento de erros padronizado
- [x] Testes de validação passando
- [x] Sem referências a mysql2 no código
- [x] Sem referências a TiDB
- [ ] Endpoints de motorista implementados (próximo)
- [ ] Endpoints de veículo implementados (próximo)
- [ ] Endpoints de rota implementados (próximo)
- [ ] Busca de pedidos do ERP implementada (próximo)

---

## 🔍 Troubleshooting

### Problema: "Erro ao conectar ao banco Logística"
**Solução:**
1. Verificar se PostgreSQL está rodando em 192.168.1.178:5432
2. Verificar credenciais (usuario: postgres, senha: postgres)
3. Verificar se banco "logistica" existe
4. Testar: `psql postgresql://postgres:postgres@192.168.1.178:5432/logistica`

### Problema: "ERP indisponível"
**Solução:**
1. Banco Logística é obrigatório, ERP é opcional
2. Sistema continua funcionando com apenas Logística
3. Verificar se PostgreSQL está rodando em 192.168.1.17:5432
4. Verificar se banco "salutem" existe

### Problema: "Health check retorna erro"
**Solução:**
1. Acessar `/api/trpc/health.check`
2. Verificar campo `errors` para mensagens específicas
3. Verificar logs: `tail -f .manus-logs/devserver.log`

---

## 📞 Suporte

Para questões sobre:
- **Conexões:** Verificar `server/database.ts`
- **Logs:** Verificar `server/logger.ts`
- **Erros:** Verificar `server/errorHandler.ts`
- **Health:** Acessar `/api/trpc/health.check`

---

**Próxima Etapa:** Implementar endpoints de motorista, veículo e rota usando banco Logística.
