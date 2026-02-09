# Ski Shop — E-commerce

A full-stack e-commerce web application for winter sports equipment (skis, boots, helmets, etc.). Built with React and Node.js, with two modes: **Customer** (browse, cart, orders) and **Admin** (categories, products, customers, statistics). Includes optional AI-powered cart recommendations.

---

## Tech Stack

### Frontend
- **React 19** + **Vite 7**
- **Redux Toolkit** — auth and cart state
- **React Router DOM 7** — routing
- **Axios** — HTTP client with auth interceptor
- **Recharts** — statistics charts (admin)
- **@react-oauth/google** — Google Sign-In (optional)
- Plain **CSS** (no UI framework)

### Backend
- **Node.js** + **Express 4**
- **MongoDB** + **Mongoose 8**
- **JWT** (jsonwebtoken) — authentication
- **bcryptjs** — password hashing
- **google-auth-library** — Google ID token verification
- **OpenAI** (optional) — cart recommendations

---

## Project Structure

```
e-commerce/
├── client/                 # React frontend
│   ├── public/
│   │   └── img/            # Static images
│   ├── src/
│   │   ├── components/    # Cart, Navigation, AuthInitializer, filters
│   │   ├── pages/         # Home, Catalog, Login, Register, Orders, Account, CartPage
│   │   ├── pages/admin/   # AdminCategories, AdminProducts, AdminCustomers, AdminStatistics
│   │   ├── services/     # API calls (auth, categories, products, orders, recommendations)
│   │   ├── store/        # Redux store, authSlice, cartSlice
│   │   └── css/           # Styles
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── config/            # DB connection
│   ├── controllers/
│   ├── middleware/       # auth, isAdmin
│   ├── models/            # User, Category, Product, Order
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
├── ai/                     # Project docs (context, architecture, progress)
└── README.md
```

---

## Features

### Customer
- **Auth:** Login, Register, Google Sign-In (optional), logout
- **Home:** Hero, About, Why Choose Us (feature cards, animated skiers)
- **Catalog:** Product grid, filters (category, gender, price, length/size for skis/boots/helmets), search, sort
- **Cart:** Slide-out panel + full **Cart page** (`/cart`) with item list, totals, Place order; **AI recommendations** (Recommended for you) when OpenAI key is set
- **Orders:** My Orders list (date, total, items)
- **Account:** View and edit profile (firstName, lastName)

### Admin
- **Categories:** CRUD
- **Products:** CRUD (title, price, category, image, stock, gender, length/size, brand, color)
- **Customers:** List customers, click row to see their orders
- **Statistics:** Pie chart (sales by product, all) and Bar chart (sales by product per customer), customer dropdown

### Behaviour
- Cart is per user (stored in `localStorage` under `cart_${userId}`); restored on login; cleared on logout.
- After placing an order, user is logged out (per spec).
- Cart UI is hidden for admin; admin has My Account in nav.

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (local or Atlas)
- **npm** (or yarn/pnpm)

---

## How to Run

### Установка на свой компьютер (ноутбук)

1. **Установи Node.js 18+** и **MongoDB** (локально или используй [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) бесплатно).

2. **Клонируй репозиторий и зайди в папку:**
   ```bash
   git clone https://github.com/antonbroker/e-commerce-ski.git
   cd e-commerce-ski
   ```

3. **Бэкенд:** в папке `server` установи зависимости и создай `.env`:
   ```bash
   cd server
   npm install
   ```
   Создай файл **`server/.env`** с содержимым (подставь свои значения):
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=любая_длинная_секретная_строка
   PORT=3000
   ```
   Если используешь Atlas — вставь свою строку подключения в `MONGODB_URI`.  
   Запуск сервера:
   ```bash
   npm run dev
   ```
   Сервер: **http://localhost:3000**. Проверка: http://localhost:3000/api/health

4. **Фронтенд:** открой **второй терминал** в корне проекта:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Клиент: **http://localhost:5173**.  
   Для локальной разработки `client/.env` не обязателен (API по умолчанию `http://localhost:3000/api`). Если нужен Google Sign-In — создай `client/.env` с `VITE_GOOGLE_CLIENT_ID=...`.

5. **Открой в браузере** http://localhost:5173 → зарегистрируйся или войди.  
   Чтобы сделать первого пользователя админом: в MongoDB (Compass или Atlas UI) в коллекции `users` найди пользователя и поставь в поле `role` значение `admin`.

6. Если база пустая — зайди под админом и создай категории и товары в разделах **Categories** и **Products**.

---

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd e-commerce
```

### 2. Backend

```bash
cd server
npm install
```

Create a **`.env`** file in `server/` (see [Environment variables](#environment-variables) below), then:

```bash
npm run dev
```

Server runs at **http://localhost:3000** (or `PORT` from `.env`).  
Health check: **http://localhost:3000/api/health**

### 3. Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create a **`.env`** file in `client/` if you use Google Sign-In (see [Environment variables](#environment-variables)), then:

```bash
npm run dev
```

Client runs at **http://localhost:5173** (Vite default).

### 4. Use the app

- Open **http://localhost:5173**
- Register or log in (or use Google if configured).
- **Customer:** browse Catalog, add to cart, open Cart (button or nav link), place order, view Orders and Account.
- **Admin:** use nav to access Categories, Products, Customers, Statistics (first user can be made admin in DB if needed).

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string (e.g. `mongodb://localhost:27017/ecommerce`) |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `PORT` | No | Server port (default `3000`) |
| `GOOGLE_CLIENT_ID` | For Google login | Same as frontend; used to verify Google ID token |
| `OPENAI_API_KEY` | For recommendations | OpenAI API key; if missing, cart recommendations are empty |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | For production | API base URL (e.g. `https://your-backend.onrender.com/api`). If not set, defaults to `http://localhost:3000/api` for local dev. |
| `VITE_GOOGLE_CLIENT_ID` | For Google login | OAuth 2.0 Web application Client ID from Google Cloud Console |

**Google Sign-In (local):** In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials, create an OAuth 2.0 Client ID (Web application) and add `http://localhost:5173` to **Authorized JavaScript origins**. For production, add your Vercel URL (see [Deployment](#deployment)).

---

## API Overview

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `GET /api/auth/me`, `PATCH /api/auth/me`
- **Categories:** `GET /api/categories`, `GET /api/categories/:id`, `POST/PUT/DELETE` (admin)
- **Products:** `GET /api/products` (query: category, gender, minPrice, maxPrice, search, minLength, maxLength, size, brand, color, sort), `GET /api/products/filters/options`, `GET /api/products/:id`, `POST/PUT/DELETE` (admin)
- **Orders:** `POST /api/orders`, `GET /api/orders` (auth)
- **Recommendations:** `POST /api/recommendations` (body: `{ productIds }`, auth) — returns suggested products for cart
- **Admin:** `GET /api/admin/customers`, `GET /api/admin/customers/:id/orders`, `GET /api/admin/statistics/sales-by-product?userId=...`

---

## Build for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
```
Output in `client/dist/`. Serve with any static host; set `VITE_API_URL` so the client calls your production API.

---

## Deployment

Deploy **backend on Render** and **client on Vercel**. Use **MongoDB Atlas** for the database so all users see the same data.

### 1. MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), sign in or register.
2. Create a **free cluster** (e.g. M0).
3. **Database Access** → Add New Database User (username + password; remember them).
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
5. **Database** → Connect → **Drivers** → copy the connection string (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`). Replace `<password>` with your DB user password. Optionally add a database name before `?`: `...mongodb.net/ecommerce?retryWrites=...`.

You will use this string as `MONGODB_URI` on Render.

### 2. Backend on Render

1. Go to [Render](https://render.com), sign in, connect your **GitHub** account if needed.
2. **Dashboard** → **New** → **Web Service**.
3. Connect the repository that contains this project (e.g. `your-username/e-commerce-ski`). Branch: `main` (or your default).
4. **Settings:**
   - **Name:** e.g. `ski-shop-api`
   - **Region:** choose closest to your users
   - **Root Directory:** `server` (important — so Render runs from the `server` folder)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment:** Add variables (same as in `server/.env`):

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Your Atlas connection string from step 1 |
   | `JWT_SECRET` | A long random string (e.g. from a password generator) |
   | `PORT` | Leave empty (Render sets it automatically) |
   | `GOOGLE_CLIENT_ID` | Same Client ID as in Google Console (needed for Google login on production) |
   | `OPENAI_API_KEY` | Optional; for cart recommendations |

6. Click **Create Web Service**. Wait for the first deploy. Note the service URL, e.g. `https://ski-shop-api.onrender.com`. The API base URL for the client is this URL + `/api`, e.g. `https://ski-shop-api.onrender.com/api`.

Render free tier may spin down after inactivity; the first request can be slow.

### 3. Frontend on Vercel

1. Go to [Vercel](https://vercel.com), sign in, connect **GitHub** if needed.
2. **Add New** → **Project** → import the same repository.
3. **Configure Project:**
   - **Root Directory:** click **Edit** → set to `client` (so Vercel builds only the frontend).
   - **Framework Preset:** Vite (should be auto-detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** — add:

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | Your Render API URL from step 2, e.g. `https://ski-shop-api.onrender.com/api` (no trailing slash) |
   | `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth Client ID as on the backend |

5. Click **Deploy**. When finished, you get a URL like `https://your-project.vercel.app`.

### 4. Google Sign-In on the live site

So that users can log in with Google on the deployed site:

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application).
3. **Authorized JavaScript origins** — add:
   - `https://your-project.vercel.app` (your Vercel URL)
   - If you use a custom domain on Vercel, add it too.
4. **Authorized redirect URIs** — if you use redirects for Google (some setups use popup and don’t need this), add e.g. `https://your-project.vercel.app` or the exact redirect path your library uses.
5. Save. Changes can take a few minutes to apply.

After this, Login/Register and “Sign in with Google” will work on the live Vercel URL, and the client will call your Render API using `VITE_API_URL`.


