# Configuração de Ambiente (.env)

Copie este arquivo para `.env` e preencha com seus valores:

```bash
cp ENV_EXAMPLE.md .env
```

## Banco de Dados - LOGÍSTICA (Banco próprio do sistema)

```
DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.171:5432/logistica
```

## Banco de Dados - ERP (Somente leitura)

```
DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
```

## Ambiente

```
NODE_ENV=development
PORT=3000
```

## Autenticação OAuth (Manus)

```
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
JWT_SECRET=your-secret-key-here
```

## Owner Info

```
OWNER_NAME=Sistema de Logística
OWNER_OPEN_ID=
```

## Google Maps

```
GOOGLE_MAPS_API_KEY=
```

## WhatsApp

```
WHATSAPP_API_KEY=
WHATSAPP_API_URL=
```

## Configurações do Sistema

```
GPS_TRACKING_INTERVAL_SECONDS=60
ROUTE_DEVIATION_TOLERANCE_METERS=100
```

## Manus APIs

```
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=
```

## Analytics

```
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

## App Info

```
VITE_APP_TITLE=Sistema de Logística
VITE_APP_LOGO=
VITE_APP_ID=
```

## ERP Database Password

```
ERP_DB_PASSWORD=postgres
```

---

**Arquivo de exemplo completo para copiar:**

```bash
DATABASE_URL_LOGISTICA=postgresql://postgres:postgres@192.168.1.171:5432/logistica
DATABASE_URL_ERP=postgresql://postgres:postgres@192.168.1.17:5432/salutem
NODE_ENV=development
PORT=3000
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
JWT_SECRET=your-secret-key-here
OWNER_NAME=Sistema de Logística
OWNER_OPEN_ID=
GOOGLE_MAPS_API_KEY=
WHATSAPP_API_KEY=
WHATSAPP_API_URL=
GPS_TRACKING_INTERVAL_SECONDS=60
ROUTE_DEVIATION_TOLERANCE_METERS=100
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
VITE_APP_TITLE=Sistema de Logística
VITE_APP_LOGO=
VITE_APP_ID=
ERP_DB_PASSWORD=postgres
```
