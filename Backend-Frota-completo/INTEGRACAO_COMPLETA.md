# 🔧 GUIA COMPLETO DE INTEGRAÇÃO - FRONTEND + BACKEND

## 📋 RESUMO DOS PROBLEMAS E SOLUÇÕES

### ❌ PROBLEMAS ENCONTRADOS

1. **Mismatch de Nomes de Campos**
   - Frontend envia: `nome`, `cpf`, `cnh`, `telefone`
   - Backend espera: `name`, `phone`, `licenseNumber`

2. **Falta de Import useState**
   - `MotoristaPage.tsx` linha 16 usa `useState` sem importar

3. **Inconsistência em Estrutura de Dados**
   - Frontend usa português, Backend usa inglês
   - Sem camada de transformação

4. **Falta de Tratamento de Erros**
   - Erros da API não são exibidos corretamente

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. Criar Camada de Transformação de Dados

**Arquivo:** `client/src/lib/apiTransform.ts`

```typescript
// Mapeia dados do frontend para o formato esperado pelo backend
export const transformDriverToApi = (formData: DriverFormData): DriverApiPayload => {
  return {
    name: formData.nome,
    phone: formData.telefone,
    cpf: formData.cpf,
    licenseNumber: formData.cnh,
    licenseExpiry: formData.cnhValidade || undefined,
    licenseCategory: formData.categoria || "D",
    status: "active"
  };
};
```

### 2. Corrigir MotoristaPage.tsx

**Mudanças:**
- ✅ Adicionar `import { useState } from "react"`
- ✅ Usar `transformDriverToApi()` ao enviar dados
- ✅ Transformar dados recebidos da API
- ✅ Adicionar tratamento de erros
- ✅ Adicionar campos faltantes (cnhValidade, categoria)

### 3. Corrigir VeiculoPage.tsx

**Mudanças:**
- ✅ Adicionar `import { useState } from "react"`
- ✅ Usar `transformVehicleToApi()` ao enviar dados
- ✅ Transformar dados recebidos da API
- ✅ Adicionar tratamento de erros
- ✅ Mapear `placa` → `plate`, `nome` → `name`, etc

---

## 📦 ARQUIVOS A ATUALIZAR

### FRONTEND - Sistema Frota

#### 1. Criar arquivo de transformação
```
client/src/lib/apiTransform.ts
```
**Copiar conteúdo de:** `/tmp/apiTransform.ts`

#### 2. Atualizar MotoristaPage
```
client/src/pages/MotoristaPage.tsx
```
**Copiar conteúdo de:** `/tmp/MotoristaPage.tsx`

#### 3. Atualizar VeiculoPage
```
client/src/pages/VeiculoPage.tsx
```
**Copiar conteúdo de:** `/tmp/VeiculoPage.tsx`

#### 4. Atualizar RotaPage (se existir)
- Importar `transformRouteToApi`
- Usar transformação ao enviar/receber dados

#### 5. Atualizar EntregaPage (se existir)
- Importar `transformDeliveryToApi`
- Usar transformação ao enviar/receber dados

---

## 🔄 FLUXO DE DADOS CORRIGIDO

### Cadastro de Motorista

```
Frontend Form
    ↓
{nome, cpf, cnh, telefone, email}
    ↓
transformDriverToApi()
    ↓
{name, phone, cpf, licenseNumber, licenseExpiry, licenseCategory, status}
    ↓
FastAPI Backend
    ↓
Salva no PostgreSQL
    ↓
Retorna {id, name, phone, cpf, ...}
    ↓
Frontend recebe e transforma
    ↓
Exibe na tabela
```

---

## 🚀 PASSOS PARA IMPLEMENTAR

### 1. No Frontend (sistema-frota)

```bash
# 1. Clonar repositório
cd /tmp
git clone https://github.com/MdevSs/sistema-frota.git
cd sistema-frota

# 2. Criar arquivo de transformação
cp /tmp/apiTransform.ts client/src/lib/

# 3. Atualizar páginas
cp /tmp/MotoristaPage.tsx client/src/pages/
cp /tmp/VeiculoPage.tsx client/src/pages/

# 4. Instalar dependências
npm install

# 5. Iniciar frontend
npm run dev
# Deve abrir em http://localhost:3005
```

### 2. No Backend (Backend-Frota)

```bash
# 1. Clonar repositório
cd /tmp
git clone https://github.com/MdevSs/Backend-Frota.git
cd Backend-Frota

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar banco de dados (se necessário)
# Editar database.py com suas credenciais

# 4. Iniciar backend
python main.py
# Deve rodar em http://localhost:8000
```

---

## ✅ TESTES DE INTEGRAÇÃO

### 1. Testar Cadastro de Motorista

```bash
# Frontend: http://localhost:3005
# 1. Clique em "Motoristas"
# 2. Clique em "Novo Motorista"
# 3. Preencha:
#    - Nome: João Silva
#    - CPF: 12345678901
#    - CNH: 12345678901234
#    - Telefone: 11999999999
#    - Email: joao@example.com
# 4. Clique em "Cadastrar"
# 5. Deve aparecer na lista
```

### 2. Testar via API

```bash
# Criar motorista
curl -X POST http://localhost:8000/drivers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "phone": "11988888888",
    "cpf": "98765432100",
    "licenseNumber": "98765432100123",
    "licenseCategory": "D",
    "status": "active"
  }'

# Listar motoristas
curl http://localhost:8000/drivers/

# Atualizar motorista
curl -X PUT http://localhost:8000/drivers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos Atualizado",
    "phone": "11988888888",
    "cpf": "98765432100",
    "licenseNumber": "98765432100123",
    "licenseCategory": "D",
    "status": "active"
  }'

# Deletar motorista
curl -X DELETE http://localhost:8000/drivers/1
```

### 3. Testar Cadastro de Veículo

```bash
# Frontend: http://localhost:3005
# 1. Clique em "Veículos"
# 2. Clique em "Novo Veículo"
# 3. Preencha:
#    - Placa: ABC1234
#    - Nome: Hyundai HR
#    - Tipo: VUC
#    - Capacidade: 1000
# 4. Clique em "Cadastrar"
# 5. Deve aparecer na lista
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot read property 'useState' of undefined"
**Solução:** Verificar se `import { useState } from "react"` está no topo do arquivo

### Erro: "POST /drivers/ 422 Unprocessable Entity"
**Solução:** Verificar se os nomes dos campos estão corretos:
- Backend espera: `name`, `phone`, `cpf`, `licenseNumber`
- Frontend envia: `nome`, `telefone`, `cpf`, `cnh`
- Use `transformDriverToApi()` para converter

### Erro: "CORS error"
**Solução:** Backend já tem CORS habilitado em `main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erro: "Connection refused"
**Solução:** Verificar se backend está rodando:
```bash
# Backend deve estar em http://localhost:8000
curl http://localhost:8000/docs
```

---

## 📊 ESTRUTURA DE DADOS FINAL

### Driver (Motorista)

**Frontend Form:**
```typescript
{
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email?: string;
  cnhValidade?: string;
  categoria?: string;
}
```

**API Payload:**
```python
{
  name: str;
  phone: str;
  cpf: str;
  licenseNumber: str;
  licenseExpiry?: datetime;
  licenseCategory?: str;
  status?: str = "active";
}
```

### Vehicle (Veículo)

**Frontend Form:**
```typescript
{
  placa: string;
  nome: string;
  tipo: string;
  capacidade: number;
}
```

**API Payload:**
```python
{
  plate: str;
  name: str;
  type: str;
  capacity: float;
  status?: str = "available";
}
```

---

## 📝 CHECKLIST FINAL

- [ ] Arquivo `apiTransform.ts` criado em `client/src/lib/`
- [ ] `MotoristaPage.tsx` atualizado com transformação
- [ ] `VeiculoPage.tsx` atualizado com transformação
- [ ] `useState` importado em ambas as páginas
- [ ] Backend rodando em `http://localhost:8000`
- [ ] Frontend rodando em `http://localhost:3005`
- [ ] Cadastro de motorista funciona
- [ ] Cadastro de veículo funciona
- [ ] Listagem funciona
- [ ] Edição funciona
- [ ] Deleção funciona
- [ ] Erros são exibidos corretamente

---

**Versão:** 1.0
**Data:** 2026-05-19
**Status:** Pronto para implementação
