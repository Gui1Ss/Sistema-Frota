# Deploy do Sistema de Logística no Debian

## Visão Geral

Este guia mostra como fazer deploy do projeto em um servidor Debian e testar com os bancos PostgreSQL reais (192.168.1.178 e 192.168.1.17).

## Pré-requisitos

- Servidor Debian 11 ou 12
- Node.js 20+ instalado
- PostgreSQL 14+ (opcional, se quiser rodar localmente)
- Git instalado
- Acesso SSH ao servidor

## Passo 1: Preparar o Servidor Debian

### 1.1 Atualizar o sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Instalar Node.js (versão 20+)

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar versão
node --version  # Deve ser v20.x.x ou superior
npm --version
```

### 1.3 Instalar pnpm (gerenciador de pacotes)

```bash
sudo npm install -g pnpm

# Verificar versão
pnpm --version
```

### 1.4 Instalar Git

```bash
sudo apt install -y git
```

### 1.5 Instalar cliente PostgreSQL (opcional, para testar conexão)

```bash
sudo apt install -y postgresql-client
```

## Passo 2: Clonar o Projeto

```bash
# Navegar para diretório de projetos
cd /home/seu_usuario

# Clonar o repositório (ou copiar os arquivos)
# Opção A: Se estiver em um repositório Git
git clone https://seu-repositorio/logistica_app.git

# Opção B: Se estiver copiando via SCP
# Do seu computador local:
scp -r /caminho/local/logistica_app seu_usuario@seu_servidor:/home/seu_usuario/

# Entrar no diretório
cd logistica_app
```

## Passo 3: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.local
cat > .env.local << 'EOF'
# Banco de Dados
DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.178:5432/logistica
DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem

# Node
NODE_ENV=production
PORT=3000

# OAuth (deixar em branco para MVP sem autenticação)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Owner
OWNER_OPEN_ID=
OWNER_NAME=

# APIs Manus (deixar em branco para MVP)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# Aplicação
VITE_APP_TITLE="Sistema de Logística"
VITE_APP_ID=logistica-mvp
EOF

# Verificar se o arquivo foi criado
cat .env.local
```

## Passo 4: Instalar Dependências

```bash
# Instalar dependências do projeto
pnpm install

# Resultado esperado: sem erros, todas as dependências instaladas
```

## Passo 5: Testar Conexão com PostgreSQL

### 5.1 Testar conexão com Banco Logística

```bash
# Testar conexão
psql -U postgres -d logistica -h 192.168.1.178 -p 5432 -c "SELECT 1"

# Resultado esperado:
#  ?column?
# ----------
#        1
# (1 row)

# Se falhar, verificar:
# - IP correto (192.168.1.178)
# - Porta 5432 aberta
# - Usuário/senha corretos
# - Banco "logistica" existe
```

### 5.2 Testar conexão com Banco ERP

```bash
# Testar conexão
psql -U postgres -d salutem -h 192.168.1.17 -p 5432 -c "SELECT 1"

# Resultado esperado: mesmo que acima
```

### 5.3 Executar script de teste Node.js

```bash
# Executar script de teste
node scripts/test-postgres-connection.mjs

# Resultado esperado:
# ✅ Conectado com sucesso
# ✅ Tabelas encontradas: 7
```

## Passo 6: Executar Migrations (Setup do Banco)

```bash
# Conectar ao banco Logística e executar setup
psql -U postgres -d logistica -h 192.168.1.178 -f scripts/setup-postgres.sql

# Resultado esperado: sem erros, tabelas criadas

# Verificar se as tabelas foram criadas
psql -U postgres -d logistica -h 192.168.1.178 -c "\dt"

# Resultado esperado: deve listar motoristas, veiculos, rotas, entregas, etc.
```

## Passo 7: Build do Projeto

```bash
# Fazer build do projeto
pnpm build

# Resultado esperado: sem erros, arquivos compilados em `dist/`
```

## Passo 8: Iniciar o Servidor

### Opção A: Desenvolvimento (com hot reload)

```bash
# Iniciar em modo desenvolvimento
pnpm dev

# Resultado esperado:
# Server running on http://localhost:3000/
# Vite dev server listening on http://localhost:5173/
```

### Opção B: Produção (com PM2)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar com PM2
pm2 start "pnpm start" --name "logistica"

# Verificar status
pm2 status

# Ver logs
pm2 logs logistica

# Parar
pm2 stop logistica

# Reiniciar
pm2 restart logistica
```

## Passo 9: Acessar o Sistema

```bash
# No navegador, acessar:
http://seu_servidor:3000

# Resultado esperado:
# - Dashboard carrega
# - Sidebar com opções: Motoristas, Veículos, Rotas, Entregas
# - Sem erro OAuth (MVP sem autenticação)
```

## Passo 10: Testar Cadastro de Motorista

1. Abrir http://seu_servidor:3000
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

## Passo 11: Verificar Dados no PostgreSQL

```bash
# Conectar ao banco Logística
psql -U postgres -d logistica -h 192.168.1.178

# Dentro do psql, consultar motoristas
SELECT id, nome, cpf, telefone FROM motoristas;

# Resultado esperado:
#  id |    nome    |     cpf      |   telefone
# ----+------------+--------------+-------------
#   1 | João Silva | 12345678901  | 11999999999
```

## Troubleshooting

### Erro: ECONNREFUSED

**Causa:** PostgreSQL não está acessível
**Solução:**
```bash
# Verificar se consegue fazer ping
ping 192.168.1.178

# Verificar se porta 5432 está aberta
nc -zv 192.168.1.178 5432

# Se não conseguir, verificar firewall na VM PostgreSQL
sudo ufw allow 5432/tcp
```

### Erro: password authentication failed

**Causa:** Senha incorreta
**Solução:**
```bash
# Verificar credenciais em .env.local
# Formato correto:
# postgresql://usuario:senha@host:porta/banco
```

### Erro: database does not exist

**Causa:** Banco não foi criado
**Solução:**
```bash
# Criar banco manualmente
psql -U postgres -h 192.168.1.178 -c "CREATE DATABASE logistica;"
```

### Erro: relation "motoristas" does not exist

**Causa:** Migrations não foram executadas
**Solução:**
```bash
# Executar setup
psql -U postgres -d logistica -h 192.168.1.178 -f scripts/setup-postgres.sql
```

### Erro: timeout

**Causa:** Rede lenta ou máquina offline
**Solução:**
```bash
# Aumentar timeout na conexão
# Editar .env.local e adicionar:
# DATABASE_CONNECT_TIMEOUT=30
```

## Checklist Final

- [ ] Node.js 20+ instalado
- [ ] pnpm instalado
- [ ] Projeto clonado/copiado
- [ ] .env.local configurado
- [ ] Dependências instaladas
- [ ] Conexão com Banco Logística funciona
- [ ] Conexão com Banco ERP funciona
- [ ] Migrations executadas
- [ ] Servidor iniciado
- [ ] Frontend abre sem erro
- [ ] Cadastro de motorista funciona
- [ ] Dados aparecem no PostgreSQL

## Próximos Passos

Após confirmar que tudo está funcionando:
1. Testar CRUD completo de motoristas
2. Testar CRUD de veículos
3. Testar busca de pedidos no ERP
4. Testar criação de rotas
5. Implementar upload de foto de canhoto
6. Implementar mapa com rastreamento
