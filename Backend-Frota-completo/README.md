# Logistics Management API

Esta é uma aplicação FastAPI desenvolvida para gerenciamento logístico, integrada com um banco de dados PostgreSQL.

## Estrutura do Projeto

- `main.py`: Endpoints da API e inicialização.
- `database.py`: Configuração da conexão com o banco de dados.
- `models.py`: Modelos SQLAlchemy (Tabelas do Banco).
- `schemas.py`: Schemas Pydantic para validação de dados.
- `crud.py`: Operações de banco de dados (Create, Read, Update, Delete).
- `init_db.sql`: Script SQL para criação manual das tabelas.
- `requirements.txt`: Dependências do projeto.

---

## Instruções de Instalação - Debian 13 (Sem Interface)

Como o seu sistema não possui interface gráfica, siga estes comandos via terminal SSH:

1. **Atualize o sistema e instale o Python/PIP:**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv -y
   ```

2. **Clone ou mova os arquivos para uma pasta e acesse-a:**
   ```bash
   mkdir logistics-api && cd logistics-api
   ```

3. **Crie e ative um ambiente virtual (recomendado):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Executar a aplicação:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   *A API estará acessível em `http://192.168.1.171:8000`*

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
   pip install -r requirements.txt
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
