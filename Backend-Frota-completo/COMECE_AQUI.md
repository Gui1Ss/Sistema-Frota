# 🐍 COMECE AQUI - BACKEND FASTAPI

## ⚡ Início Rápido (2 minutos)

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Iniciar Backend

```bash
python main.py
```

**Backend estará em:** `http://localhost:8000`

### 3. Documentação da API

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧪 Testar Endpoints

### Criar Motorista

```bash
curl -X POST http://localhost:8000/drivers/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "phone": "11999999999",
    "cpf": "12345678901",
    "licenseNumber": "12345678901234",
    "licenseCategory": "D",
    "status": "active"
  }'
```

### Listar Motoristas

```bash
curl http://localhost:8000/drivers/
```

### Criar Veículo

```bash
curl -X POST http://localhost:8000/vehicles/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hyundai HR",
    "plate": "ABC1234",
    "type": "VUC",
    "capacity": 1000,
    "status": "available"
  }'
```

---

## 📚 Documentação

- **INTEGRACAO_COMPLETA.md** - Guia técnico completo

---

## ✅ Verificação

- [ ] Backend inicia sem erros
- [ ] http://localhost:8000/docs abre
- [ ] Endpoints respondem corretamente

---

**Pronto para começar!** 🎉
