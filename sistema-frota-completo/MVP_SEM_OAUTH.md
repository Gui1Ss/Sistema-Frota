# MVP sem OAuth - Guia de Testes

**Status:** ✅ OAuth Removido - Sistema Pronto para Testes

---

## O que foi corrigido

### Problema Original
```
Error: OAuth callback failed
```

O sistema estava tentando fazer autenticação OAuth obrigatória, bloqueando o acesso ao MVP.

### Solução Implementada

1. **Desativado proteção de autenticação** (`server/_core/trpc.ts`)
   - `protectedProcedure` agora cria usuário MVP automático
   - `adminProcedure` permite acesso sem verificação
   - Comentários indicam como reativar em produção

2. **Removido redirecionamento OAuth** (`client/src/main.tsx`)
   - Erros de autenticação não redirecionam mais para login
   - Sistema continua funcionando mesmo sem OAuth

3. **Atualizado hook de autenticação** (`client/src/_core/hooks/useAuth.ts`)
   - Sempre retorna `isAuthenticated: true`
   - Fornece usuário MVP padrão
   - Permite acesso direto ao dashboard

4. **Simplificado Home.tsx** (`client/src/pages/Home.tsx`)
   - Botão "Entrar no Sistema" leva direto ao Dashboard
   - Sem redirecionamento para OAuth

---

## Como Acessar o Sistema

### 1. Iniciar o servidor
```bash
cd /home/ubuntu/logistica_app
pnpm dev
```

### 2. Abrir no navegador
```
http://localhost:3000
```

### 3. Clicar em "Entrar no Sistema"
- Vai direto para o Dashboard
- Sem tela de login
- Sem autenticação OAuth

---

## Usuário MVP Padrão

```
ID: mvp-user
Nome: MVP User
Email: mvp@test.local
Role: user
```

Aparece no rodapé da sidebar.

---

## Telas Disponíveis

### Dashboard
- Clique em "Dashboard" na sidebar
- Mostra estatísticas do sistema
- Motoristas, Veículos, Rotas, Entregas, Pendentes, Concluídas

### Motoristas
- Clique em "Motoristas" na sidebar
- Listar motoristas (vazio se banco não está conectado)
- Botão "Novo Motorista" para cadastrar
- Formulário com validação

### Veículos
- Clique em "Veículos" na sidebar
- Listar veículos
- Botão "Novo Veículo" para cadastrar

### Rotas
- Clique em "Rotas" na sidebar
- Criar nova rota
- Buscar pedidos no ERP
- Selecionar motorista e veículo

### Entregas
- Clique em "Entregas" na sidebar
- Listar entregas
- Status de cada entrega

---

## Testar com Banco PostgreSQL

Quando os bancos PostgreSQL estiverem disponíveis:

### 1. Configurar variáveis de ambiente
```bash
export DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.172:5432/logistica
export DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
```

### 2. Executar migrations
```bash
psql -h 192.168.1.172 -U postgres -d logistica -f drizzle/migrations/0002_create_logistica_tables.sql
```

### 3. Testar endpoints

**Cadastrar motorista:**
```bash
curl -X POST http://localhost:3000/api/trpc/drivers.create \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Listar motoristas:**
```bash
curl http://localhost:3000/api/trpc/drivers.list
```

**Cadastrar veículo:**
```bash
curl -X POST http://localhost:3000/api/trpc/vehicles.create \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC1234",
    "modelo": "Hyundai HR",
    "tipo": "VUC",
    "capacidadeKg": 1500,
    "capacidadeM3": 8.5,
    "anoFabricacao": 2024,
    "finalPlaca": 4
  }'
```

---

## Arquivos Alterados

1. **server/_core/trpc.ts**
   - Desativada proteção de autenticação
   - Cria usuário MVP automático

2. **client/src/main.tsx**
   - Removido redirecionamento OAuth
   - Erros não causam logout

3. **client/src/_core/hooks/useAuth.ts**
   - Sempre autenticado
   - Usuário MVP padrão

4. **client/src/pages/Home.tsx**
   - Botão leva ao Dashboard
   - Sem OAuth

---

## Como Reativar OAuth em Produção

Para voltar a usar OAuth:

### 1. Descomente em `server/_core/trpc.ts`
```typescript
if (!ctx.user) {
  throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
}
```

### 2. Descomente em `client/src/main.tsx`
```typescript
window.location.href = getLoginUrl();
```

### 3. Atualize `client/src/_core/hooks/useAuth.ts`
```typescript
isAuthenticated: Boolean(meQuery.data),
```

### 4. Atualize `client/src/pages/Home.tsx`
```typescript
if (!isAuthenticated) {
  return <Home />;
}
```

---

## Troubleshooting

### "Banco de dados não disponível"
- Esperado no sandbox
- Quando bancos PostgreSQL estiverem disponíveis, o sistema funcionará
- Endpoints retornarão erro amigável

### "Tela em branco"
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (F5)
- Verifique os logs: `tail -f .manus-logs/devserver.log`

### "Erro ao cadastrar motorista"
- Verifique se o banco está conectado
- Verifique as credenciais do banco
- Verifique se as migrations foram aplicadas

---

## Próximas Etapas

1. **Testar com bancos reais** - Conectar aos bancos PostgreSQL e validar CRUD
2. **Implementar upload de foto** - Adicionar endpoint para foto de canhoto
3. **Adicionar mapa** - Integrar Google Maps
4. **Reativar OAuth** - Voltar a usar autenticação em produção

---

**Data:** 2026-05-19  
**Status:** ✅ MVP Pronto para Testes  
**Modo:** Sem OAuth
