# Current Architecture (to be filled after audit)

## Frontend

**Stack:**
- React 19, Vite 7
- Redux Toolkit (store, slices)
- React Router DOM 7
- Axios (HTTP client)
- Plain CSS (no Tailwind/Bootstrap; files in `src/css/`)

**Folder structure:**
- `src/App.jsx` — router, route guards (auth/admin), Cart + Navigation for logged-in users
- `src/main.jsx` — React root, Redux Provider, Router
- `src/pages/` — Login, Register, Home, Catalog, Orders; `pages/admin/` — AdminCategories, AdminProducts, AdminStatistics
- `src/components/` — AuthInitializer, Cart, Navigation; `components/filters/` — RangeSlider
- `src/services/` — api.js (axios instance + auth header), authService, categoryService, productService
- `src/store/` — store.js (auth + cart reducers), slices/authSlice.js, slices/cartSlice.js
- `src/css/` — global, auth, admin, catalog, cart, navigation, forms, buttons, etc.

**State management:**
- Redux: `auth` (user, token, isAuthenticated, isLoading), `cart` (items, totalItems, totalPrice)
- Auth: token in sessionStorage; restored on load via AuthInitializer → GET /api/auth/me
- Cart: persisted in localStorage (manual in cartSlice); restored in AuthInitializer

**Routing:**
- `/` — Home (redirect to /login if not authenticated)
- `/login`, `/register` — public
- `/catalog`, `/orders` — customer, require auth
- `/admin/categories`, `/admin/products`, `/admin/statistics` — admin only (user.role === 'admin')
- Navigate to `/` or `/login` when role/route mismatch

**API layer:**
- Single axios instance in `services/api.js`: baseURL `http://localhost:3000/api`, JSON header, request interceptor adds `Authorization: Bearer <token>` from sessionStorage
- Services call api.get/post/put/delete; authService (login, register, getMe), categoryService (getAll, create, update, delete), productService (getAll, getFilterOptions, create, update, delete)

---

## Backend

**Stack:**
- Node.js, Express 4
- MongoDB (Mongoose 8)
- dotenv, cors, bcryptjs, jsonwebtoken

**Folder structure:**
- `server.js` — app setup, CORS, express.json(), mount routes, connect DB, listen
- `config/db.js` — Mongoose connect using MONGODB_URI
- `routes/` — authRoutes, categoryRoutes, productRoutes (no orderRoutes)
- `controllers/` — authController, categoryController, productController
- `services/` — authService (hash, verify, JWT sign/verify), categoryService, productService (business logic)
- `repositories/` — categoryRepository, productRepository, userRepository (DB access)
- `models/` — User, Category, Product (no Order model)
- `middleware/` — auth.js (JWT validation, set req.user), isAdmin.js (check req.user.role === 'admin')

**Auth:**
- JWT in response body (login/register); client stores in sessionStorage and sends in Authorization header
- authMiddleware: reads Bearer token, verifies via authService.verifyToken (JWT verify + load user from DB), returns 401 if missing/invalid
- isAdminMiddleware: after auth, checks req.user.role === 'admin', else 403
- Routes: POST /api/auth/register, POST /api/auth/login (public); GET /api/auth/me (auth)

**API endpoints:**
- GET /api/health — server + DB status
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Categories: GET /api/categories, GET /api/categories/:id (public); POST, PUT /:id, DELETE /:id (auth + admin)
- Products: GET /api/products (with query: category, search, minPrice, maxPrice, sort, etc.), GET /api/products/filters/options, GET /api/products/category/:categoryId, GET /api/products/:id (public); POST, PUT /:id, DELETE /:id (auth + admin)
- No /api/orders or /api/users (for admin customers list)

**DB/storage:**
- MongoDB via Mongoose. Connection string from .env (MONGODB_URI).
- Models: User (email, username, firstName, lastName, passwordHash, role enum admin|customer, createdAt), Category (name, createdAt), Product (title, price, category ref, imageUrl, stock, optional gender, length, brand, color, createdAt). No Order or OrderItem collections.
