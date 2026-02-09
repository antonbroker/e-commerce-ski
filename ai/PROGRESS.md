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

### Фаза 1. Setup & base architecture
- [x] React + Vite client, Redux Toolkit, React Router
- [x] Express + MongoDB server, Mongoose
- [x] API: axios, baseURL, CORS

### Фаза 2. Auth (Login/Register)
- [x] Страница Login, форма входа
- [x] Страница Register, ссылка с Login
- [x] JWT, сохранение токена (sessionStorage), восстановление при загрузке
- [x] Разделение роутов и меню: admin / customer

### Фаза 3. Admin: Categories CRUD
- [x] Список категорий
- [x] Добавление категории
- [x] Редактирование (Update → поле ввода → сохранение)
- [x] Удаление категории

### Фаза 4. Admin: Products CRUD
- [x] Список продуктов (данные, категория, картинка)
- [x] Добавление продукта (Add New)
- [x] Редактирование и удаление продукта

### Фаза 5. Customer: Catalog + Filters
- [x] Страница каталога, карточки товаров
- [x] Фильтры: категория (динамически из админки), цена, название/поиск
- [x] Доп. фильтры (бренд, цвет, сортировка)

### Фаза 6. Cart (qty + totals + open/close)
- [x] Корзина: открытие/закрытие по кнопке-стрелке
- [x] Список позиций, сумма по позиции, общая сумма
- [x] Кнопки +/- в каталоге и в корзине, обновление в Redux
- [x] Сохранение корзины в localStorage

### Фаза 7. Orders (place order => logout)
- [x] Модель Order и API (POST /api/orders, GET /api/orders — мои заказы)
- [x] Кнопка Order в корзине отправляет заказ на сервер
- [x] После успешного заказа: очистка корзины + logout

**Phase 7 — что сделано и зачем (подробно):**

**Бэкенд**

1. **`server/models/Order.js`** — модель заказа в MongoDB.
   - **Зачем:** чтобы хранить заказы: кто заказал, какие товары, в каком количестве, на какую сумму, когда.
   - **Поля:** `user` (ref на User), `items` (массив `{ product: ref Product, quantity }`), `totalAmount`, `createdAt`. Валидация: минимум один товар, quantity ≥ 1.
   - **Индекс** `{ user: 1, createdAt: -1 }` — быстрая выборка «мои заказы» по пользователю, сортировка по дате.
   - **toJSON** убирает `__v` из ответа.

2. **`server/repositories/orderRepository.js`** — слой доступа к БД.
   - **`createOrder(orderData)`** — сохраняет заказ, возвращает его с populate `user` (firstName, lastName, email) и `items.product` (title, price), чтобы в ответе API сразу были читаемые данные.
   - **`getOrdersByUserId(userId)`** — все заказы пользователя с populate `items.product` (title, price, imageUrl), сортировка по дате (новые первые).
   - **Зачем:** разделение «работа с БД» и «бизнес-логика»; один раз настроенный populate не дублировать в сервисе.

3. **`server/services/orderService.js`** — бизнес-логика заказов.
   - **`createOrder(userId, { items, totalAmount })`:** проверяет, что items — непустой массив и totalAmount — число; для каждой позиции — существование продукта и достаточный stock; пересчитывает сумму по ценам из БД; если переданная totalAmount не совпадает с пересчитанной (с допуском 0.01) — ошибка (защита от подделки суммы с клиента). Создаёт заказ через репозиторий.
   - **Зачем:** нельзя создать заказ с несуществующим товаром, с количеством больше остатка или с неправильной суммой.
   - **`getMyOrders(userId)`** — просто прокидывает запрос в репозиторий (логика «только свои заказы» обеспечивается контроллером через req.user).

4. **`server/controllers/orderController.js`** — HTTP-обработчики.
   - **POST:** берёт `items`, `totalAmount` из body, передаёт в сервис вместе с `req.user._id`; при успехе — 201 и `{ order }`, при ошибке — 400 (not found / not enough stock) или 500, тело `{ error: message }`.
   - **GET:** вызывает getMyOrders(req.user._id), возвращает 200 и `{ orders }`.
   - **Зачем:** единая точка входа с API, преобразование ошибок в коды и JSON.

5. **`server/routes/orderRoutes.js`** — маршруты.
   - POST `/` и GET `/` с `authMiddleware` — без токена запросы не проходят.
   - В **`server/server.js`** роуты подключены как `app.use('/api/orders', orderRoutes)`.

**Фронтенд**

6. **`client/src/services/orderService.js`** — клиентский слой для API заказов.
   - **`createOrder(payload)`** — POST `/orders` с `{ items: [{ productId, quantity }], totalAmount }` (axios уже с baseURL и токеном из api).
   - **`getMyOrders()`** — GET `/orders`, возвращает данные для страницы «Мои заказы».
   - **Зачем:** один раз настроенный вызов API, переиспользование в Cart и на будущей странице Orders.

7. **`client/src/components/Cart.jsx`** — поведение кнопки «Order».
   - **`handleOrder`:** если корзина пуста — выход; иначе `setOrderLoading(true)`, вызов `createOrder` с маппингом корзины в `{ productId, quantity }` и `totalPrice` как totalAmount. При успехе: `dispatch(clearCart())`, `dispatch(logout())`, `navigate('/login')`. При ошибке — alert с текстом из ответа сервера; в `finally` — `setOrderLoading(false)`.
   - Кнопка во время запроса: `disabled={orderLoading}`, текст «Placing order...» / «Order».
   - **Зачем:** по ТЗ после оформления заказа — выход из аккаунта; корзина очищается, чтобы при следующем входе не показывать старый заказ; пользователь видит состояние загрузки и сообщение об ошибке (например, «Not enough stock»).

**Итог по Phase 7:** заказ сохраняется в БД с привязкой к пользователю и актуальными ценами/остатками на момент создания; клиент может оформить заказ из корзины и после успеха разлогинивается; API для «мои заказы» (GET) готов для страницы My Orders в Phase 8. Уменьшение stock при заказе в этой фазе не реализовано (при желании добавляется отдельным шагом).

---

### Фаза 8. Customer: My Account + My Orders
- [x] Страница My Account (просмотр и редактирование своих данных)
- [x] Страница My Orders (список своих заказов)

### Фаза 9. Admin: Customers page
- [x] Список всех пользователей (customers)
- [x] Отображение заказов по каждому пользователю

### Фаза 10. Statistics
- [x] Круговая диаграмма (продажи по продуктам)
- [x] Столбчатая диаграмма (qty по продуктам по клиенту)
- [x] Выбор пользователя в выпадающем списке

### Фаза 11. Polish
- [ ] Единый table-компонент для всех таблиц
- [ ] UX и валидации по необходимости

### Опционально: AI (рекомендации в корзине)
- [ ] Backend: POST /api/recommendations — передаём id товаров в корзине; отправляем в OpenAI (корзина + каталог), получаем recommendedIds; возвращаем полные товары из БД (imageUrl, price, title).
- [ ] Frontend: в корзине под списком товаров блок «Рекомендуем к покупке» с карточками рекомендованных товаров (фото, цена, «В корзину»).
- [ ] Окно корзины сделано пошире для размещения блока рекомендаций.

---

Step log:
- **Audit (no code changes):** Read PROJECT_CONTEXT, PROGRESS, .cursor rules; explored client (Vite/React/Redux/Router, pages, services, store) and server (Express/MongoDB, routes, models, middleware). Updated ARCHITECTURE_CURRENT.md with frontend/backend stack, structure, API, auth (JWT + sessionStorage), storage (MongoDB + cart in localStorage). Marked phases 1–6 done; 7–11 remain. No Order model or order API; Cart Order button is TODO; My Account, My Orders, Admin Customers, Statistics are stubs or missing.
- **Phase 7:** Order model (user, items with product ref + quantity, totalAmount, createdAt). orderRepository (createOrder, getOrdersByUserId), orderService (createOrder with validation and stock check, getMyOrders), orderController, orderRoutes (POST /, GET /). Mounted /api/orders. Client: orderService (createOrder, getMyOrders), Cart handleOrder calls createOrder, then dispatch clearCart + logout, navigate to /login. Order button shows loading state.
- **Phase 8, шаг 1:** Orders.jsx — getMyOrders() в useEffect, состояния loading/error/orders. Рендер: loading, ошибка, пустой список («У вас пока нет заказов» + ссылка на каталог), список заказов (карточка: дата, сумма, состав — название, qty, цена). orders.css добавлен и подключён в index.css.
- **Phase 8, шаг 2:** Backend PATCH /api/auth/me — authService.updateProfile(userId, { firstName, lastName }), authController.updateProfileController (валидация trim + min 2), роут PATCH /me с authMiddleware. Ответ 200 { user }; при ошибке 400/404/500.
- **Phase 8, шаг 3:** Frontend My Account: authService.updateProfile(), authSlice.updateUser, страница Account.jsx (email/username read-only, firstName/lastName форма, Save → PATCH + dispatch updateUser), роут /account, ссылка My Account в навигации для customer, account.css.
- **Nav:** Home и About показываются только для customer; для admin в навигации только Categories, Products, Statistics, Customers.
- **Phase 9, шаг 1:** Backend GET /api/admin/customers (auth + isAdmin), userRepository.getUsersByRole('customer'), adminController.getCustomersController, adminRoutes, mount /api/admin. Frontend: adminService.getCustomers(), AdminCustomers.jsx (таблица customers), роут /admin/customers, пункт Customers в админ-меню.
- **Phase 9, шаг 2:** Заказы по customer: GET /api/admin/customers/:id/orders (orderRepository.getOrdersByUserId), adminController.getCustomerOrdersController. Client: getCustomerOrders(id), по клику на строку — selectedCustomer, загрузка заказов, блок под таблицей «Orders: [имя]» (дата, сумма, состав). Повторный клик по той же строке снимает выбор.
- **Phase 10, шаг 1:** Recharts установлен. Backend: GET /api/admin/statistics/sales-by-product (auth+admin), orderRepository.getSalesByProduct() — агрегация по заказам (quantity по product), ответ [{ name, value }]. Client: getSalesByProduct(), AdminStatistics — круговая диаграмма (PieChart), загрузка/пусто/ошибка.
- **Phase 10, шаг 2:** Backend: getSalesByProduct(userId) — опциональный фильтр по user (query userId). AdminStatistics: dropdown «All customers» + список customers (getCustomers), при выборе клиента — BarChart (qty по продуктам по его заказам), при «All» — PieChart как раньше. adminService.getSalesByProduct(customerId?) с params.userId.
- **Optional AI (recommendations):** Зафиксировано в PROJECT_CONTEXT и PROGRESS: рекомендации в корзине — в LLM передаём содержимое корзины + каталог, получаем recommendedIds, показываем в корзине под товарами блок с карточками наших товаров (фото, цена, «В корзину»). Окно корзины расширено (width увеличена в cart.css).
- **Cart per user + admin fixes:** Корзина привязана к пользователю: localStorage ключ `cart_${userId}`; cartSlice хранит userId, restoreCart принимает { items, userId }; AuthInitializer и Login/Register восстанавливают корзину по user._id; при logout — clearCart. Корзина не показывается админу (App.jsx: Cart только при user?.role !== 'admin'). В навигации для админа добавлена ссылка My Account.