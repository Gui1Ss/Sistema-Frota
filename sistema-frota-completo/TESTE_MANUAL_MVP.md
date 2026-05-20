# Guia de Teste Manual do MVP

**Objetivo:** Validar o MVP completo com bancos PostgreSQL reais

---

## Pré-requisitos

1. **Bancos PostgreSQL configurados:**
   ```bash
   export DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.171:5432/logistica
   export DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
   ```

2. **Migrations aplicadas no banco LOGÍSTICA:**
   ```bash
   psql -h 192.168.1.171 -U postgres -d logistica -f drizzle/migrations/0002_create_logistica_tables.sql
   ```

3. **Servidor rodando:**
   ```bash
   cd /home/ubuntu/logistica_app
   pnpm dev
   ```

4. **Abrir no navegador:**
   ```
   http://localhost:3000
   ```

---

## TESTE 1: Cadastro de Motorista

### Passo 1: Abrir tela de Motoristas
1. Clique em "Motoristas" na sidebar esquerda
2. Verifique se a tela carrega sem erro

### Passo 2: Cadastrar novo motorista
1. Clique no botão "Novo Motorista"
2. Preencha o formulário com dados válidos:
   - **Nome:** João Silva
   - **CPF:** 12345678901
   - **CNH:** 9876543210
   - **Validade CNH:** 2026-12-31
   - **Telefone:** 11999999999
   - **Email:** joao@example.com
   - **Endereço:** Rua A, 123
   - **Cidade:** São Paulo
   - **Estado:** SP
   - **CEP:** 01310100

3. Clique em "Salvar"
4. **Resultado esperado:** Mensagem de sucesso "Motorista cadastrado com sucesso"

### Passo 3: Validar no banco
```sql
SELECT id, nome, cpf, telefone, ativo FROM drivers WHERE cpf = '12345678901';
```

**Resultado esperado:** Uma linha com os dados cadastrados e `ativo = true`

---

## TESTE 2: Listagem de Motoristas

### Passo 1: Listar motoristas
1. Na tela de Motoristas, verifique se o motorista cadastrado aparece na lista
2. Procure por "João Silva" na tabela

**Resultado esperado:** Motorista aparece com status "Ativo"

---

## TESTE 3: Edição de Motorista

### Passo 1: Editar motorista
1. Clique no botão "Editar" do motorista "João Silva"
2. Altere o telefone para: 11988888888
3. Clique em "Salvar"

**Resultado esperado:** Mensagem de sucesso e tabela atualizada

### Passo 2: Validar no banco
```sql
SELECT telefone FROM drivers WHERE cpf = '12345678901';
```

**Resultado esperado:** Telefone = 11988888888

---

## TESTE 4: Inativação de Motorista

### Passo 1: Inativar motorista
1. Clique no botão "Inativar" do motorista "João Silva"
2. Confirme a ação

**Resultado esperado:** Motorista desaparece da lista ou muda de status

### Passo 2: Validar no banco
```sql
SELECT ativo FROM drivers WHERE cpf = '12345678901';
```

**Resultado esperado:** ativo = false

---

## TESTE 5: Cadastro de Veículo

### Passo 1: Abrir tela de Veículos
1. Clique em "Veículos" na sidebar
2. Verifique se a tela carrega sem erro

### Passo 2: Cadastrar novo veículo
1. Clique no botão "Novo Veículo"
2. Preencha o formulário:
   - **Placa:** ABC1234
   - **Modelo:** Hyundai HR
   - **Tipo:** VUC
   - **Capacidade (kg):** 1500
   - **Capacidade (m³):** 8.5
   - **Ano de Fabricação:** 2024
   - **Final da Placa:** 4

3. Clique em "Salvar"

**Resultado esperado:** Mensagem de sucesso

### Passo 3: Validar no banco
```sql
SELECT id, placa, modelo, tipo FROM vehicles WHERE placa = 'ABC1234';
```

**Resultado esperado:** Uma linha com os dados cadastrados

---

## TESTE 6: Listagem de Veículos

### Passo 1: Listar veículos
1. Na tela de Veículos, verifique se o veículo "ABC1234" aparece na lista

**Resultado esperado:** Veículo aparece com status "Ativo"

---

## TESTE 7: Edição de Veículo

### Passo 1: Editar veículo
1. Clique em "Editar" do veículo "ABC1234"
2. Altere o modelo para: "Hyundai HR 2024"
3. Clique em "Salvar"

**Resultado esperado:** Mensagem de sucesso

### Passo 2: Validar no banco
```sql
SELECT modelo FROM vehicles WHERE placa = 'ABC1234';
```

---

## TESTE 8: Busca de Pedido no ERP

### Passo 1: Abrir tela de Rotas
1. Clique em "Rotas" na sidebar
2. Clique em "Nova Rota"

### Passo 2: Buscar pedido no ERP
1. No campo "Número do Pedido", digite um número de pedido real (ex: 1, 2, 3)
2. Clique em "Buscar"

**Resultado esperado:** Dados do pedido aparecem:
- Número do pedido
- Cliente
- Telefone
- Endereço de entrega
- Chave de acesso (se houver NF-e)

### Passo 3: Validar no banco ERP
```sql
-- No banco salutem (ERP)
SELECT numero, cliente, telefone FROM pedido WHERE numero = '1';
```

**Resultado esperado:** Dados do pedido aparecem (somente leitura)

---

## TESTE 9: Criação de Rota

### Passo 1: Criar rota
1. Na tela de Rotas, clique em "Nova Rota"
2. Preencha:
   - **Data da Rota:** Data de hoje
   - **Motorista:** Selecione um motorista ativo
   - **Veículo:** Selecione um veículo ativo
   - **Pedidos:** Adicione vários pedidos (1, 2, 3)

3. Clique em "Salvar"

**Resultado esperado:** Mensagem de sucesso e rota aparece na lista

### Passo 2: Validar no banco
```sql
SELECT id, motorista_id, veiculo_id, status FROM routes ORDER BY created_at DESC LIMIT 1;
```

**Resultado esperado:** Uma linha com a rota criada

---

## TESTE 10: Dashboard

### Passo 1: Abrir Dashboard
1. Clique em "Dashboard" na sidebar
2. Verifique se as estatísticas aparecem:
   - Total de Motoristas
   - Total de Veículos
   - Total de Rotas
   - Total de Entregas
   - Entregas Pendentes
   - Entregas Concluídas

**Resultado esperado:** Números aparecem corretamente

### Passo 2: Validar atualização
1. Cadastre um novo motorista
2. Volte ao Dashboard
3. Verifique se o total de motoristas aumentou

**Resultado esperado:** Total atualizado corretamente

---

## TESTE 11: Tratamento de Erros

### Passo 1: Testar campo obrigatório vazio
1. Na tela de Motoristas, clique em "Novo Motorista"
2. Deixe o campo "Nome" vazio
3. Clique em "Salvar"

**Resultado esperado:** Mensagem de erro amigável: "Nome é obrigatório"

### Passo 2: Testar CPF inválido
1. Preencha o formulário com CPF inválido: "00000000000"
2. Clique em "Salvar"

**Resultado esperado:** Mensagem de erro: "CPF inválido"

### Passo 3: Testar banco indisponível
1. Desconecte os bancos PostgreSQL
2. Tente cadastrar um motorista
3. Reconecte os bancos

**Resultado esperado:** Mensagem de erro amigável, sistema não cai

---

## Comandos SQL para Validação

### Verificar dados no banco LOGÍSTICA

```sql
-- Conectar ao banco logistica
psql -h 192.168.1.171 -U postgres -d logistica

-- Listar motoristas
SELECT id, nome, cpf, telefone, ativo FROM drivers;

-- Listar veículos
SELECT id, placa, modelo, tipo, ativo FROM vehicles;

-- Listar rotas
SELECT id, motorista_id, veiculo_id, status FROM routes;

-- Listar entregas
SELECT id, rota_id, numero_pedido, status FROM deliveries;

-- Listar logs
SELECT timestamp, endpoint, status, mensagem FROM operation_logs ORDER BY timestamp DESC LIMIT 10;
```

### Verificar dados no banco ERP (somente leitura)

```sql
-- Conectar ao banco salutem (ERP)
psql -h 192.168.1.17 -U postgres -d salutem

-- Listar pedidos
SELECT numero, cliente, telefone FROM pedido LIMIT 10;

-- Listar notas
SELECT numero, chave_acesso FROM nfenotas LIMIT 10;
```

---

## Checklist de Validação

- [ ] Cadastrar motorista com sucesso
- [ ] Listar motorista cadastrado
- [ ] Editar motorista
- [ ] Inativar motorista
- [ ] Cadastrar veículo com sucesso
- [ ] Listar veículo cadastrado
- [ ] Editar veículo
- [ ] Inativar veículo
- [ ] Buscar pedido no ERP
- [ ] Criar rota com pedidos
- [ ] Dashboard mostra totais corretos
- [ ] Dashboard atualiza após novo cadastro
- [ ] Erro ao deixar campo obrigatório vazio
- [ ] Erro ao digitar CPF inválido
- [ ] Sistema não cai com erro de banco
- [ ] Dados salvos no banco LOGÍSTICA
- [ ] ERP usado apenas para leitura

---

## Troubleshooting

### "Banco de dados não disponível"
- Verifique se os bancos PostgreSQL estão rodando
- Verifique as credenciais em `DATABASE_URL_LOGISTICA` e `DATABASE_URL_ERP`
- Verifique se as migrations foram aplicadas

### "Pedido não encontrado"
- Verifique se o número do pedido existe no banco ERP
- Use o comando SQL acima para listar pedidos

### "Erro ao salvar"
- Verifique os logs: `tail -f .manus-logs/devserver.log`
- Verifique se há erros de validação no console do navegador

### "Tela em branco"
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página (F5)
- Verifique se o servidor está rodando

---

**Data:** 2026-05-19  
**Status:** MVP Pronto para Testes  
**Próximo:** Upload de foto, mapa e rastreamento
