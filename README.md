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
| `VITE_GOOGLE_CLIENT_ID` | For Google login | OAuth 2.0 Web application Client ID from Google Cloud Console |

**Google Sign-In:** In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials, create an OAuth 2.0 Client ID (Web application) and add `http://localhost:5173` to **Authorized JavaScript origins**.

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
Output in `client/dist/`. Serve with any static host; set API base URL if not same origin (e.g. via env or proxy).


