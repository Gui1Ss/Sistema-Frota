# Deploy Rápido - Sistema de Logística

## TL;DR (Resumo Executivo)

Se você quer começar **agora mesmo** no seu Debian:

```bash
# 1. Clonar/copiar o projeto
cd /home/seu_usuario
git clone <seu-repo> logistica_app
cd logistica_app

# 2. Executar script de instalação automática
chmod +x scripts/install-debian.sh
./scripts/install-debian.sh

# 3. Iniciar servidor
pnpm dev

# 4. Acessar no navegador
# http://localhost:3000
```

## Pré-requisitos Mínimos

- Debian 11 ou 12
- Acesso SSH ou terminal local
- Conexão com os bancos PostgreSQL:
  - 192.168.1.172:5432 (Banco Logística)
  - 192.168.1.17:5432 (Banco ERP)

## Instalação Passo a Passo

### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
sudo npm install -g pnpm

# Instalar cliente PostgreSQL
sudo apt install -y postgresql-client
```

### 2. Clonar Projeto

```bash
# Via Git (se tiver repositório)
git clone https://seu-repositorio/logistica_app.git
cd logistica_app

# Ou via SCP (copiar arquivos)
# Do seu computador:
scp -r /caminho/local/logistica_app seu_usuario@seu_servidor:/home/seu_usuario/
ssh seu_usuario@seu_servidor
cd logistica_app
```

### 3. Configurar Ambiente

```bash
# Criar arquivo .env.local
cat > .env.local << 'EOF'
DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.172:5432/logistica
DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
NODE_ENV=production
PORT=3000
VITE_APP_TITLE="Sistema de Logística"
VITE_APP_ID=logistica-mvp
EOF
```

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Executar Migrations

```bash
# Criar banco e tabelas
psql -U postgres -d logistica -h 192.168.1.172 -f scripts/setup-postgres.sql

# Verificar se foi criado
psql -U postgres -d logistica -h 192.168.1.172 -c "\dt"
```

### 6. Testar Conexão

```bash
# Testar conexão com os bancos
node scripts/test-postgres-connection.mjs

# Resultado esperado:
# ✅ Conectado com sucesso
# ✅ Tabelas encontradas: 7
```

### 7. Iniciar Servidor

```bash
# Modo desenvolvimento (com hot reload)
pnpm dev

# Resultado esperado:
# Server running on http://localhost:3000/
```

### 8. Acessar Sistema

```
Abrir no navegador:
http://seu_servidor:3000

Ou se for local:
http://localhost:3000
```

## Testar Cadastro de Motorista

1. Clicar em "Motoristas"
2. Clicar em "Novo Motorista"
3. Preencher:
   - Nome: "João Silva"
   - CPF: "12345678901"
   - CNH: "12345678901234"
   - Telefone: "11999999999"
4. Clicar em "Cadastrar"
5. Verificar no PostgreSQL:

```bash
psql -U postgres -d logistica -h 192.168.1.172 -c "SELECT * FROM motoristas;"
```

## Iniciar em Produção (PM2)

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar
pm2 start "pnpm start" --name "logistica"

# Ver status
pm2 status

# Ver logs
pm2 logs logistica

# Parar
pm2 stop logistica

# Reiniciar
pm2 restart logistica
```

## Troubleshooting

### "Banco de dados não disponível"

```bash
# Testar conexão
psql -U postgres -d logistica -h 192.168.1.172 -c "SELECT 1"

# Se falhar, verificar:
ping 192.168.1.172
nc -zv 192.168.1.172 5432

# Se porta está bloqueada, na VM PostgreSQL:
sudo ufw allow 5432/tcp
sudo systemctl restart postgresql
```

### "relation motoristas does not exist"

```bash
# Executar migrations
psql -U postgres -d logistica -h 192.168.1.172 -f scripts/setup-postgres.sql
```

### "password authentication failed"

```bash
# Verificar credenciais em .env.local
# Formato: postgresql://usuario:senha@host:porta/banco
```

## Arquivos Importantes

- `DEPLOY_DEBIAN.md` - Guia completo de deploy
- `DIAGNOSTICO_CONEXAO_POSTGRESQL.md` - Troubleshooting detalhado
- `scripts/install-debian.sh` - Script de instalação automática
- `scripts/test-postgres-connection.mjs` - Teste de conexão
- `scripts/setup-postgres.sql` - Setup do banco

## Próximos Passos

Após confirmar que tudo está funcionando:

1. **Testar CRUD de motoristas** - Editar, inativar, listar
2. **Testar CRUD de veículos** - Cadastrar, editar, inativar
3. **Testar busca de pedidos ERP** - Buscar pedidos reais
4. **Testar criação de rotas** - Criar rota com vários pedidos
5. **Implementar upload de foto** - Foto de canhoto
6. **Implementar mapa** - Rastreamento em tempo real

## Suporte

Para problemas específicos, consulte:
- `DIAGNOSTICO_CONEXAO_POSTGRESQL.md` - Problemas de conexão
- `GUIA_RAPIDO_TESTES.md` - Testes rápidos
- `TESTE_MANUAL_MVP.md` - Testes manuais detalhados
