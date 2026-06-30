# 🚀 SISTEMA DE FROTA - GUIA DE INÍCIO RÁPIDO

## 📦 O que você recebeu

Um ZIP com **TUDO** pronto para usar:

```
SISTEMA_FROTA_COMPLETO.zip
├── sistema-frota-completo/     (Frontend Vite + React)
│   ├── client/                 (Código React)
│   ├── package.json
│   ├── COMECE_AQUI.md
│   ├── INTEGRACAO_COMPLETA.md
│   └── ... (tudo mais)
│
└── Backend-Frota-completo/     (Backend FastAPI)
    ├── main.py
    ├── models.py
    ├── schemas.py
    ├── requirements.txt
    ├── COMECE_AQUI.md
    └── ... (tudo mais)
```

---

## ⚡ 5 PASSOS PARA COMEÇAR

### PASSO 1: Descompactar

```bash
unzip SISTEMA_FROTA_COMPLETO.zip
cd sistema-frota-completo
```

### PASSO 2: Instalar Frontend

```bash
npm install
# ou
pnpm install
```

### PASSO 3: Iniciar Frontend

```bash
npm run dev
# ou
pnpm dev
```

**Abra:** http://192.168.1.178:3001

### PASSO 4: Em outro terminal, instalar Backend

```bash
cd ../Backend-Frota-completo
pip install -r requirements.txt
```

5. **Crie o arquivo de variáveis de ambiente:**

   ```bash
   cat << 'EOF' > .env
   GENERAL_API_KEY= < COLOQUE A CHAVE DA API AQUI >
   DB_ERP_URL = < URL DO BANCO ERP >
   CANHOTOS_UPLOAD_DIR =  /var/www/uploads/canhotos
   ORS_API_KEY = < COLOQUE A CHAVE DA API AQUI >
   MOBIL_TRACKER_API_KEY = < COLOQUE A CHAVE DA API AQUI >
   EOF
   ```

### PASSO 5: Iniciar Backend

```bash
python main.py
```

**Backend em:** http://192.168.1.178:8000

---

## ✅ TESTE RÁPIDO

1. Abra http://192.168.1.178:3001
2. Clique em **"Motoristas"**
3. Clique em **"Novo Motorista"**
4. Preencha:
   - Nome: João Silva
   - CPF: 12345678901
   - CNH: 12345678901234
   - Telefone: 11999999999
5. Clique em **"Cadastrar"**
6. ✅ Deve aparecer na lista!

---

## 📚 DOCUMENTAÇÃO

### Frontend

```
sistema-frota-completo/
├── COMECE_AQUI.md              ← Leia primeiro
├── INTEGRACAO_COMPLETA.md      ← Guia técnico
└── CORRECOES_FRONTEND.md       ← Detalhes das correções
```

### Backend

```
Backend-Frota-completo/
├── README.md      ← Guia de instalação
└── requirements.txt            ← Dependências
```

---

## 🔗 LINKS IMPORTANTES

| Serviço     | URL                            |
| ----------- | ------------------------------ |
| Frontend    | http://192.168.1.178:3001      |
| Backend     | http://192.168.1.178:8000      |
| Swagger API | http://192.168.1.178:8000/docs |

---

## 📋 FUNCIONALIDADES

✅ Cadastro de Motorista  
✅ Listagem de Motoristas  
✅ Edição de Motorista  
✅ Deleção de Motorista  
✅ Cadastro de Veículo  
✅ Listagem de Veículos  
✅ Edição de Veículo  
✅ Deleção de Veículo  
✅ Tratamento de Erros  
✅ Transformação de Dados
✅ Buscar rotas geradas para visualização em mapa

---

## 🐛 TROUBLESHOOTING

### "Port 3001 already in use"

```bash
npm run dev -- --port 3006
```

### "Port 8000 already in use"

```bash
python main.py --port 8001
```

### "ModuleNotFoundError"

```bash
pip install -r requirements.txt
```

### "npm: command not found"

Instale Node.js em https://nodejs.org/

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Testar cadastro de motorista
2. ✅ Testar cadastro de veículo
3. ✅ Explorar a interface
4. 📖 Ler documentação completa
5. 🚀 Deploy em produção

---

## 💡 DICAS

- **Swagger API:** Acesse http://192.168.1.178:8000/docs para testar endpoints
- **DevTools:** Pressione F12 no navegador para ver console
- **Logs:** Verifique terminal para mensagens de erro

---

## ✨ PRONTO!

Tudo está pronto para usar. Comece agora! 🎉

**Dúvidas?** Consulte os arquivos .md inclusos.

---

**Versão:** 1.0  
**Data:** 2026-06-22  
**Status:** Pronto para Produção
