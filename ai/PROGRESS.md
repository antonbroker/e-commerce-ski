# Progress

Current phase: Phase 10 done. Next: Phase 11 (Polish).

Phases:
- [x] 1. Setup & base architecture
- [x] 2. Auth (Login/Register)
- [x] 3. Admin: Categories CRUD
- [x] 4. Admin: Products CRUD
- [x] 5. Customer: Catalog + Filters
- [x] 6. Cart (qty + totals + open/close)
- [x] 7. Orders (place order => logout)
- [x] 8. Customer: My Account + My Orders
- [x] 9. Admin: Customers page (users + their orders)
- [x] 10. Statistics (pie + bar + dropdown user)
- [ ] 11. Polish (shared table component, UX, validations)

---

### Phase 1. Setup & base architecture
- [x] React + Vite client, Redux Toolkit, React Router
- [x] Express + MongoDB server, Mongoose
- [x] API: axios, baseURL, CORS

### Phase 2. Auth (Login/Register)
- [x] Login page, login form
- [x] Register page, link from Login
- [x] JWT, token stored in sessionStorage, restored on load
- [x] Route and menu split: admin / customer

### Phase 3. Admin: Categories CRUD
- [x] Categories list
- [x] Add category
- [x] Edit (Update → input field → save)
- [x] Delete category

### Phase 4. Admin: Products CRUD
- [x] Products list (data, category, image)
- [x] Add product (Add New)
- [x] Edit and delete product

### Phase 5. Customer: Catalog + Filters
- [x] Catalog page, product cards
- [x] Filters: category (from admin), price, name/search
- [x] Extra filters (brand, color, sort)

### Phase 6. Cart (qty + totals + open/close)
- [x] Cart: open/close via toggle button
- [x] Item list, line total, grand total
- [x] +/- buttons in catalog and cart, Redux update
- [x] Cart saved in localStorage

### Phase 7. Orders (place order => logout)
- [x] Order model and API (POST /api/orders, GET /api/orders — my orders)
- [x] Order button in cart sends order to server
- [x] After successful order: clear cart + logout

**Phase 7 — what was done and why (detail):**

**Backend**

1. **`server/models/Order.js`** — order model in MongoDB.
   - **Why:** to store orders: who ordered, which products, quantity, total, when.
   - **Fields:** `user` (ref to User), `items` (array `{ product: ref Product, quantity }`), `totalAmount`, `createdAt`. Validation: at least one item, quantity ≥ 1.
   - **Index** `{ user: 1, createdAt: -1 }` — fast "my orders" by user, sorted by date.
   - **toJSON** removes `__v` from response.

2. **`server/repositories/orderRepository.js`** — DB access layer.
   - **`createOrder(orderData)`** — saves order, returns it with populate `user` (firstName, lastName, email) and `items.product` (title, price) so API response has readable data.
   - **`getOrdersByUserId(userId)`** — all orders for user with populate `items.product` (title, price, imageUrl), sorted by date (newest first).
   - **Why:** separate "DB work" and "business logic"; configure populate once, no duplication in service.

3. **`server/services/orderService.js`** — order business logic.
   - **`createOrder(userId, { items, totalAmount })`:** checks items is non-empty array and totalAmount is number; for each item — product exists and enough stock; recalculates total from DB prices; if given totalAmount does not match (within 0.01) — error (protect against client tampering). Creates order via repository.
   - **Why:** cannot create order with non-existent product, quantity above stock, or wrong total.
   - **`getMyOrders(userId)`** — forwards to repository (controller uses req.user for "own orders only").

4. **`server/controllers/orderController.js`** — HTTP handlers.
   - **POST:** takes `items`, `totalAmount` from body, passes to service with `req.user._id`; on success — 201 and `{ order }`, on error — 400 (not found / not enough stock) or 500, body `{ error: message }`.
   - **GET:** calls getMyOrders(req.user._id), returns 200 and `{ orders }`.
   - **Why:** single API entry point, map errors to status codes and JSON.

5. **`server/routes/orderRoutes.js`** — routes.
   - POST `/` and GET `/` with `authMiddleware` — requests without token are rejected.
   - In **`server/server.js`** routes mounted as `app.use('/api/orders', orderRoutes)`.

**Frontend**

6. **`client/src/services/orderService.js`** — client layer for orders API.
   - **`createOrder(payload)`** — POST `/orders` with `{ items: [{ productId, quantity }], totalAmount }` (axios has baseURL and token from api).
   - **`getMyOrders()`** — GET `/orders`, returns data for My Orders page.
   - **Why:** single place for API calls, reused in Cart and Orders page.

7. **`client/src/components/Cart.jsx`** — Order button behaviour.
   - **`handleOrder`:** if cart empty — return; else `setOrderLoading(true)`, call `createOrder` with cart mapped to `{ productId, quantity }` and `totalPrice` as totalAmount. On success: `dispatch(clearCart())`, `dispatch(logout())`, `navigate('/login')`. On error — alert with server message; in `finally` — `setOrderLoading(false)`.
   - Button during request: `disabled={orderLoading}`, text "Placing order..." / "Order".
   - **Why:** per spec, after placing order user logs out; cart cleared so next login does not show old order; user sees loading and error (e.g. "Not enough stock").

**Phase 7 summary:** order saved in DB with user and current prices/stock at creation time; client can place order from cart and logs out on success; GET orders API ready for My Orders in Phase 8. Stock decrement on order not in this phase (can be added later).

---

### Phase 8. Customer: My Account + My Orders
- [x] My Account page (view and edit own data)
- [x] My Orders page (list of own orders)

### Phase 9. Admin: Customers page
- [x] List of all customers
- [x] Show orders per customer

### Phase 10. Statistics
- [x] Pie chart (sales by product)
- [x] Bar chart (qty by product per customer)
- [x] Customer dropdown

### Phase 11. Polish
- [ ] Shared table component for all tables
- [ ] UX and validations as needed

### Optional: AI (cart recommendations)
- [x] Backend: POST /api/recommendations — send cart product IDs; call OpenAI (cart + catalog), get recommendedIds; return full products from DB (imageUrl, price, title).
- [x] Frontend: in cart under items block "Recommended for you" with recommendation cards (image, price, Add to cart).
- [x] Cart panel widened for recommendations block.

---

Step log:
- **Audit (no code changes):** Read PROJECT_CONTEXT, PROGRESS, .cursor rules; explored client (Vite/React/Redux/Router, pages, services, store) and server (Express/MongoDB, routes, models, middleware). Updated ARCHITECTURE_CURRENT.md with frontend/backend stack, structure, API, auth (JWT + sessionStorage), storage (MongoDB + cart in localStorage). Marked phases 1–6 done; 7–11 remain. No Order model or order API; Cart Order button is TODO; My Account, My Orders, Admin Customers, Statistics are stubs or missing.
- **Phase 7:** Order model (user, items with product ref + quantity, totalAmount, createdAt). orderRepository (createOrder, getOrdersByUserId), orderService (createOrder with validation and stock check, getMyOrders), orderController, orderRoutes (POST /, GET /). Mounted /api/orders. Client: orderService (createOrder, getMyOrders), Cart handleOrder calls createOrder, then dispatch clearCart + logout, navigate to /login. Order button shows loading state.
- **Phase 8, step 1:** Orders.jsx — getMyOrders() in useEffect, loading/error/orders state. Render: loading, error, empty list ("No orders yet." + link to catalog), orders list (card: date, total, items — name, qty, price). orders.css added and imported in index.css.
- **Phase 8, step 2:** Backend PATCH /api/auth/me — authService.updateProfile(userId, { firstName, lastName }), authController.updateProfileController (trim + min 2 validation), route PATCH /me with authMiddleware. Response 200 { user }; on error 400/404/500.
- **Phase 8, step 3:** Frontend My Account: authService.updateProfile(), authSlice.updateUser, Account.jsx page (email/username read-only, firstName/lastName form, Save → PATCH + dispatch updateUser), route /account, My Account link in nav for customer, account.css.
- **Nav:** Home and About shown only for customer; for admin nav has Categories, Products, Statistics, Customers.
- **Phase 9, step 1:** Backend GET /api/admin/customers (auth + isAdmin), userRepository.getUsersByRole('customer'), adminController.getCustomersController, adminRoutes, mount /api/admin. Frontend: adminService.getCustomers(), AdminCustomers.jsx (customers table), route /admin/customers, Customers in admin menu.
- **Phase 9, step 2:** Orders per customer: GET /api/admin/customers/:id/orders (orderRepository.getOrdersByUserId), adminController.getCustomerOrdersController. Client: getCustomerOrders(id), on row click — selectedCustomer, load orders, block below table "Orders: [name]" (date, total, items). Clicking same row again clears selection.
- **Phase 10, step 1:** Recharts installed. Backend: GET /api/admin/statistics/sales-by-product (auth+admin), orderRepository.getSalesByProduct() — aggregation over orders (quantity per product), response [{ name, value }]. Client: getSalesByProduct(), AdminStatistics — pie chart (PieChart), loading/empty/error.
- **Phase 10, step 2:** Backend: getSalesByProduct(userId) — optional filter by user (query userId). AdminStatistics: dropdown "All customers" + customers list (getCustomers), on customer select — BarChart (qty by product for that customer's orders), on "All" — PieChart as before. adminService.getSalesByProduct(customerId?) with params.userId.
- **Optional AI (recommendations):** Per PROJECT_CONTEXT and PROGRESS: cart recommendations — send cart contents + catalog to LLM, get recommendedIds, show in cart under items block with product cards (image, price, Add to cart). Cart panel width increased in cart.css.
- **Cart per user + admin fixes:** Cart tied to user: localStorage key `cart_${userId}`; cartSlice stores userId, restoreCart accepts { items, userId }; AuthInitializer and Login/Register restore cart by user._id; on logout — clearCart. Cart not shown to admin (App.jsx: Cart only when user?.role !== 'admin'). My Account link added to admin nav.
