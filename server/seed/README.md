# Seed: категории и товары в продовую БД

## 1. Экспорт с локальной MongoDB

В **MongoDB Compass** (подключение к локальной БД):

1. Коллекция **categories** → Export → JSON → сохранить как `server/seed/categories.json`.
2. Коллекция **products** → Export → JSON → сохранить как `server/seed/products.json`.

Либо из корня проекта (если есть `mongoexport`):

```bash
mongoexport --uri="mongodb://localhost:27017/ecommerce" --collection=categories --out=server/seed/categories.json
mongoexport --uri="mongodb://localhost:27017/ecommerce" --collection=products --out=server/seed/products.json
```

## 2. Запуск сида в продовую БД

Из папки **server** (подставь свой продовый URI):

**PowerShell:**

```powershell
cd server
$env:MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.xxx.mongodb.net/ecommerce?retryWrites=true&w=majority"
node seed/products.seed.js
```

**Cmd:**

```cmd
cd server
set MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.xxx.mongodb.net/ecommerce?retryWrites=true^&w=majority
node seed/products.seed.js
```

Скрипт **очищает** коллекции `categories` и `products` в целевой БД и вставляет документы из JSON. Пользователей (`users`) не трогает.
