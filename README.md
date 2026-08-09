# 🛡 Kontrol.uz — Headless E-Commerce & Security API

Production Headless REST API backend for **"Kontrol.uz"** powered by **Strapi v4**, **TypeScript**, and **PostgreSQL**.

---

## 🚀 Production Deployment (Contabo VPS)

### 1. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Ensure strong, unique secrets are generated for `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, and `JWT_SECRET`.

### 2. Start PostgreSQL Database
```bash
docker compose up -d
```

### 3. Install Dependencies & Build
```bash
npm install --production=false
npm run build
```

### 4. Run Server with PM2
```bash
npm install -g pm2
pm2 start npm --name "kontrol-backend" -- run start
pm2 save
pm2 startup
```

---

## 🔌 API Endpoints

* **Categories:** `GET /api/categories?populate=*`
* **Products:** `GET /api/products?populate=*`
* **Cart Checkout:** `POST /api/orders`
* **B2B Estimation:** `POST /api/leads`
* **Health Check:** `GET /_health`

---

## 🔒 Security
* Strictly typed TypeScript architecture
* Public permissions restricted to necessary GET and Lead/Order POST endpoints
* Media uploads stored locally or in object storage
* Rate limiting and CORS configured for authorized frontend origins
