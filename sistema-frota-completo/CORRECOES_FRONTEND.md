# 🔧 CORREÇÕES NECESSÁRIAS NO FRONTEND

## PROBLEMA 1: Mismatch de Nomes de Campos

### Frontend (MotoristaPage.tsx) envia:
```js
{
  nome: "João",
  cpf: "123.456.789-00",
  cnh: "1234567890",
  telefone: "11 99999999",
  email: "joao@example.com"
}
```

### Backend (schemas.py) espera:
```python
{
  name: "João",
  phone: "11 99999999",
  cpf: "123.456.789-00",
  licenseNumber: "1234567890",
  licenseCategory: "D",  # FALTA NO FRONTEND
  licenseExpiry: "2026-05-19",  # FALTA NO FRONTEND
  status: "active"
}
```

---

## PROBLEMA 2: Falta de Import useState

**Arquivo:** `client/src/pages/MotoristaPage.tsx`
**Linha:** 16
**Erro:** `useState` não está importado

```tsx
// ANTES
import MainLayout from "@/components/MainLayout";

// DEPOIS
import { useState } from "react";
import MainLayout from "@/components/MainLayout";
```

---

## PROBLEMA 3: VeiculoPage - Mismatch de Campos

### Frontend envia:
```js
{
  placa: "ABC1234",
  modelo: "Hyundai HR",
  tipo: "VUC",
  capacidadeKg: 1000,
  capacidadeM3: 5.5
}
```

### Backend espera:
```python
{
  name: "Hyundai HR",  # FALTA NO FRONTEND
  plate: "ABC1234",
  type: "VUC",
  capacity: 1000,  # DEVERIA SER UM ÚNICO CAMPO
  status: "available"
}
```

---

## SOLUÇÃO: Criar Camada de Transformação

Criar arquivo `client/src/lib/apiTransform.ts` que mapeia os dados corretamente.

---

## ARQUIVOS A CORRIGIR

1. ✅ `client/src/pages/MotoristaPage.tsx` - Adicionar import useState
2. ✅ `client/src/pages/MotoristaPage.tsx` - Mapear campos corretamente
3. ✅ `client/src/pages/VeiculoPage.tsx` - Mapear campos corretamente
4. ✅ `client/src/pages/RotaPage.tsx` - Mapear campos corretamente
5. ✅ `client/src/pages/EntregaPage.tsx` - Mapear campos corretamente
6. ✅ `client/src/lib/api.ts` - Adicionar interceptadores
7. ✅ Criar `client/src/lib/apiTransform.ts` - Transformação de dados
