# Logistics Management Frontend

Esta é uma aplicação React+Vite desenvolvida para gerenciamento logístico, integrada com um banco de dados PostgreSQL.

## Instruções de Instalação - Debian 13 (Sem Interface)

1. **Instale as dependências:**

   ```bash
   $ Sistema_Frota/sistema-frota-completo> pnpm i
   ```

2. **Clone ou mova os arquivos para uma pasta e acesse-a:**

   ```bash
   $ Sistema_Frota/sistema-frota-completo> pnpm i
   ```

3. **Crie e ative um ambiente virtual (recomendado):**

   ```bash
   $ Sistema_Frota/sistema-frota-completo> pnpm i
   ```

---

## Instruções de Instalação - Windows

1. **Instale o Python:**
   Baixe e instale a versão mais recente do Python em [python.org](https://www.python.org/). Certifique-se de marcar a opção **"Add Python to PATH"**.

2. **Abra o Terminal (PowerShell ou CMD) na pasta do projeto.**

3. **Crie e ative um ambiente virtual:**

   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

4. **Instale as dependências:**

   ```powershell
   pip install -r requirements-windows.txt
   ```

5. **Executar a aplicação:**
   ```powershell
   uvicorn main:app --reload
   ```

---

## Documentação da API

Após iniciar o servidor, você pode acessar a documentação interativa (Swagger UI) em:

- **URL:** `http://localhost:8000/docs` (ou o IP do seu servidor Debian)

## Banco de Dados

A aplicação está configurada para conectar ao PostgreSQL no IP `192.168.1.171`. Caso precise alterar, edite o arquivo `database.py`.
Para criar as tabelas manualmente, utilize o arquivo `init_db.sql`.
