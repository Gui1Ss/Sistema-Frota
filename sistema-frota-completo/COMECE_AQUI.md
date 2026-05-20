# 🚀 COMECE AQUI - SISTEMA DE FROTA

## ⚡ Início Rápido (5 minutos)

### 1. Instalar Dependências

```bash
npm install
# ou
pnpm install
```

### 2. Iniciar Frontend

```bash
npm run dev
# ou
pnpm dev
```

**Frontend estará em:** `http://localhost:3005`

### 3. Em outro terminal, iniciar Backend

```bash
cd ../Backend-Frota-completo
pip install -r requirements.txt
python main.py
```

**Backend estará em:** `http://localhost:8000`

### 4. Testar

1. Abra http://localhost:3005
2. Clique em "Motoristas"
3. Clique em "Novo Motorista"
4. Preencha:
   - Nome: João Silva
   - CPF: 12345678901
   - CNH: 12345678901234
   - Telefone: 11999999999
5. Clique em "Cadastrar"
6. ✅ Deve aparecer na lista!

---

## 📚 Documentação

- **INTEGRACAO_COMPLETA.md** - Guia técnico completo
- **CORRECOES_FRONTEND.md** - Detalhes das correções

---

## ✨ O que foi corrigido

✅ Mapeamento de dados (nome → name, cpf → cpf, cnh → licenseNumber)  
✅ Import useState adicionado  
✅ Transformação de dados automática  
✅ Tratamento de erros  
✅ Campos adicionais (cnhValidade, categoria)  

---

## 🔗 Links Úteis

- Frontend: http://localhost:3005
- Backend: http://localhost:8000
- Swagger API: http://localhost:8000/docs
- ReDoc API: http://localhost:8000/redoc

---

**Pronto para começar!** 🎉
