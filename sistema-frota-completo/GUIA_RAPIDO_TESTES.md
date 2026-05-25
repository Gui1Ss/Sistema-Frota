# Guia Rápido de Testes - Sistema de Logística

## 1. Verificar Variáveis de Ambiente

```bash
# No servidor onde Node.js está rodando
echo "DATABASE_URL_LOGISTICA: $DATABASE_URL_LOGISTICA"
echo "DATABASE_URL_ERP: $DATABASE_URL_ERP"

# Resultado esperado:
# DATABASE_URL_LOGISTICA: postgresql://postgres:postgres@192.168.1.178:5432/logistica
# DATABASE_URL_ERP: postgresql://postgres:postgres@192.168.1.17:5432/salutem
```

## 2. Testar Conexão com Script Node.js

```bash
# No diretório do projeto
cd /home/ubuntu/logistica_app

# Executar script de teste
node scripts/test-postgres-connection.mjs

# Resultado esperado:
# ✅ Conectado com sucesso
# ✅ Tabelas encontradas: 7
#    - motoristas
#    - veiculos
#    - rotas
#    - entregas
#    - ...
```

## 3. Testar Health Check do Backend

```bash
# Acessar pelo navegador ou curl
curl http://localhost:3000/api/trpc/system.health

# Ou no navegador:
# http://localhost:3000/api/trpc/system.health

# Resultado esperado (JSON):
{
  "status": "healthy",
  "database": {
    "status": "ok",
    "message": "Conectado a ambos os bancos (Logística + ERP)"
  },
  "connections": {
    "logistica": {
      "status": "connected",
      "error": null
    },
    "erp": {
      "status": "connected",
      "error": null
    }
  }
}
```

## 4. Executar Setup do PostgreSQL (Na VM 192.168.1.178)

```bash
# SSH para a VM
ssh usuario@192.168.1.178

# Executar script SQL
sudo -u postgres psql -f /caminho/para/logistica_app/scripts/setup-postgres.sql

# Resultado esperado: sem erros, tabelas criadas
```

## 5. Testar Cadastro de Motorista (Frontend)

1. Abrir: http://localhost:3000
2. Clicar em "Motoristas"
3. Clicar em "Novo Motorista"
4. Preencher:
   - Nome: "João Silva"
   - CPF: "12345678901"
   - CNH: "12345678901234"
   - Telefone: "11999999999"
5. Clicar em "Cadastrar"

**Resultado esperado:**
- Mensagem: "Motorista cadastrado com sucesso"
- Motorista aparece na lista

## 6. Verificar Dados no PostgreSQL (Na VM 192.168.1.178)

```bash
# Conectar ao banco
psql -U postgres -d logistica -h 127.0.0.1

# Dentro do psql, consultar motoristas
SELECT id, nome, cpf, telefone FROM motoristas;

# Resultado esperado:
#  id |    nome    |     cpf      |   telefone
# ----+------------+--------------+-------------
#   1 | João Silva | 12345678901  | 11999999999
```

## 7. Testar Listagem de Motoristas (Frontend)

1. Abrir: http://localhost:3000
2. Clicar em "Motoristas"

**Resultado esperado:**
- Lista mostra "João Silva" com CPF e telefone

## 8. Testar Edição de Motorista

1. Na tela de Motoristas, clicar no ícone de editar
2. Alterar telefone para "11988888888"
3. Clicar em "Salvar"

**Resultado esperado:**
- Mensagem: "Motorista atualizado com sucesso"
- Telefone atualizado na lista

## 9. Testar Inativação de Motorista

1. Na tela de Motoristas, clicar no ícone de inativar
2. Confirmar

**Resultado esperado:**
- Motorista desaparece da lista (apenas ativos são mostrados)

## 10. Verificar Dados no PostgreSQL Após Edição

```bash
# Conectar ao banco
psql -U postgres -d logistica -h 127.0.0.1

# Ver motorista inativado
SELECT id, nome, ativo FROM motoristas;

# Resultado esperado:
#  id |    nome    | ativo
# ----+------------+-------
#   1 | João Silva | f
```

## Checklist Final

- [ ] DATABASE_URL_LOGISTICA configurado
- [ ] DATABASE_URL_ERP configurado
- [ ] Script test-postgres-connection.mjs passa
- [ ] Health check mostra "connected"
- [ ] Setup PostgreSQL executado
- [ ] Cadastro de motorista funciona
- [ ] Motorista aparece no PostgreSQL
- [ ] Edição de motorista funciona
- [ ] Inativação de motorista funciona

## Próximos Passos

Após passar em todos os testes:
1. Testar CRUD de veículos
2. Testar busca de pedidos no ERP
3. Testar criação de rotas
4. Testar dashboard com dados reais
