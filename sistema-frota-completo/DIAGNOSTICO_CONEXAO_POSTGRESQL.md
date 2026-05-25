# Diagnóstico de Conexão com PostgreSQL

## Problema Relatado
Ao cadastrar motorista, aparece erro: "Banco de dados não disponível. Verifique a conexão com o servidor."

## Causa Provável
Uma ou mais das seguintes situações:
1. Variável de ambiente `DATABASE_URL_LOGISTICA` não configurada ou incorreta
2. Banco PostgreSQL não está acessível na rede (firewall, porta bloqueada)
3. Banco `logistica` não existe em 192.168.1.178
4. Usuário `postgres` não tem permissão no banco
5. Migrations não foram executadas
6. Tabela `motoristas` não existe

## Testes e Correções

### Passo 1: Verificar Variáveis de Ambiente

**No seu servidor (onde o Node.js está rodando):**

```bash
# Verificar se DATABASE_URL_LOGISTICA está configurado
echo $DATABASE_URL_LOGISTICA

# Resultado esperado:
# postgresql://postgres:postgres@192.168.1.178:5432/logistica
```

Se não aparecer nada, configure:
```bash
export DATABASE_URL_LOGISTICA="postgresql://postgres:postgres@192.168.1.178:5432/logistica"
export DATABASE_URL_ERP="postgresql://postgres:postgres@192.168.1.17:5432/salutem"
```

### Passo 2: Testar Conexão com PostgreSQL (VM 192.168.1.178)

**Na VM com PostgreSQL (192.168.1.178):**

```bash
# Testar se PostgreSQL está rodando
sudo systemctl status postgresql

# Resultado esperado:
# ● postgresql.service - PostgreSQL Database Server
#    Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)
#    Active: active (running) since ...
```

Se não estiver rodando:
```bash
sudo systemctl start postgresql
```

### Passo 3: Conectar ao PostgreSQL Localmente

**Na VM 192.168.1.178:**

```bash
# Conectar como usuário postgres
sudo -u postgres psql

# Dentro do psql, listar bancos
\l

# Resultado esperado: deve aparecer "logistica" na lista
# Se não aparecer, criar o banco:
CREATE DATABASE logistica;

# Sair do psql
\q
```

### Passo 4: Verificar Permissões do Usuário Postgres

**Na VM 192.168.1.178:**

```bash
# Conectar como postgres
sudo -u postgres psql -d logistica

# Dentro do psql, verificar se o usuário postgres tem acesso
# (Você já está conectado como postgres, então tem acesso)

# Listar tabelas
\dt

# Resultado esperado: deve aparecer "motoristas" e outras tabelas
# Se não aparecer, as migrations não foram executadas

# Sair
\q
```

### Passo 5: Executar Migrations

**Na VM 192.168.1.178, no diretório do projeto:**

```bash
# Navegar para o diretório do projeto
cd /caminho/para/logistica_app

# Executar migration SQL
psql -U postgres -d logistica -h 127.0.0.1 -f drizzle/migrations/0002_create_logistica_tables.sql

# Resultado esperado: sem erros, tabelas criadas

# Verificar se as tabelas foram criadas
psql -U postgres -d logistica -h 127.0.0.1 -c "\dt"

# Resultado esperado: deve listar todas as tabelas (motoristas, veiculos, rotas, etc.)
```

### Passo 6: Testar Conexão de Fora (Da Máquina com Node.js)

**Do servidor onde Node.js está rodando:**

```bash
# Instalar cliente psql se não tiver
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Testar conexão
psql -U postgres -d logistica -h 192.168.1.178 -p 5432 -c "SELECT 1"

# Resultado esperado:
#  ?column?
# ----------
#        1
# (1 row)

# Se falhar, verificar:
# - Firewall bloqueando porta 5432
# - PostgreSQL não aceitando conexões remotas
# - Senha incorreta
```

### Passo 7: Verificar Configuração do PostgreSQL para Aceitar Conexões Remotas

**Na VM 192.168.1.178:**

```bash
# Editar arquivo de configuração
sudo nano /etc/postgresql/*/main/postgresql.conf

# Procurar por "listen_addresses" e garantir que está assim:
# listen_addresses = '*'

# Se estava diferente, salvar e reiniciar PostgreSQL:
sudo systemctl restart postgresql

# Também verificar pg_hba.conf para permitir conexões de rede:
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Adicionar linha (se não existir):
# host    all             all             0.0.0.0/0               md5

# Salvar e reiniciar:
sudo systemctl restart postgresql
```

### Passo 8: Testar Health Check do Backend

**Do seu navegador ou curl:**

```bash
# Acessar o health check
curl http://localhost:3000/api/trpc/system.health

# Resultado esperado (JSON):
{
  "status": "healthy",
  "timestamp": "2026-05-19T...",
  "backend": {
    "status": "ok",
    "message": "Backend rodando"
  },
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

# Se aparecer erro, verificar a mensagem de erro específica
```

### Passo 9: Testar Cadastro de Motorista

**Após confirmar que o health check mostra "connected":**

1. Abrir o frontend: http://localhost:3000
2. Clicar em "Motoristas"
3. Clicar em "Novo Motorista"
4. Preencher:
   - Nome: "João Silva"
   - CPF: "12345678901"
   - CNH: "12345678901234"
   - Telefone: "11999999999"
5. Clicar em "Cadastrar"

**Resultado esperado:**
- Mensagem de sucesso: "Motorista cadastrado com sucesso"
- Motorista aparece na lista

### Passo 10: Verificar Dados no PostgreSQL

**Na VM 192.168.1.178:**

```bash
# Conectar ao banco
psql -U postgres -d logistica -h 127.0.0.1

# Dentro do psql, consultar motoristas
SELECT id, nome, cpf, cnh, telefone FROM motoristas;

# Resultado esperado: deve aparecer o motorista cadastrado
# id | nome | cpf | cnh | telefone
# 1 | João Silva | 12345678901 | 12345678901234 | 11999999999
```

## Erros Comuns e Soluções

### ECONNREFUSED
**Causa:** PostgreSQL não está rodando ou porta 5432 está bloqueada
**Solução:** 
```bash
sudo systemctl start postgresql
sudo ufw allow 5432/tcp  # Se usar firewall
```

### password authentication failed
**Causa:** Senha incorreta ou usuário não existe
**Solução:** Verificar credenciais em DATABASE_URL_LOGISTICA

### database does not exist
**Causa:** Banco `logistica` não foi criado
**Solução:** 
```bash
sudo -u postgres psql -c "CREATE DATABASE logistica;"
```

### relation "motoristas" does not exist
**Causa:** Migrations não foram executadas
**Solução:** Executar migrations (Passo 5)

### timeout
**Causa:** Firewall bloqueando, máquina offline ou DNS não resolvendo
**Solução:** Verificar conectividade com `ping 192.168.1.178`

## Checklist Final

- [ ] DATABASE_URL_LOGISTICA configurado corretamente
- [ ] PostgreSQL rodando em 192.168.1.178
- [ ] Banco `logistica` existe
- [ ] Migrations foram executadas
- [ ] Tabela `motoristas` existe
- [ ] Health check mostra "connected" para Logística
- [ ] Cadastro de motorista funciona
- [ ] Dados aparecem no PostgreSQL

## Próximos Passos

Após confirmar que tudo está funcionando:
1. Testar CRUD completo de motoristas (editar, inativar)
2. Testar CRUD de veículos
3. Testar busca de pedidos no ERP
4. Testar criação de rotas
