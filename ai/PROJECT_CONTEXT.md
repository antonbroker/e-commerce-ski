# Project Context — React Final Project (E-commerce)

Goal:
Build an e-commerce website using React + Redux Toolkit + Node.js server.

Modes:
- Admin mode (admin only)
- Customer mode (registered users)

Must-have pages/features (from course spec):
- Login page + Registration page
- Admin:
  - Categories CRUD
  - Products CRUD
  - Customers page (see all customers and their orders)
  - Statistics dashboard (charts)
- Customer:
  - My Account (view/update own data)
  - My Orders (view all own orders)
  - Products Catalog (filter by category/price/title)
  - Cart (open/close, qty +/-, totals)
  - Order button sends order to server and logs out immediately

Guidelines:
- Use a shared/reusable table component for all tables
- Use charts library for statistics page
- Work phase-by-phase and track progress in ai/PROGRESS.md

Optional addition — AI (price comparison):
- Plan and implement a mechanism for comparing prices for the same product in other places.
- Use any LLM API (OpenAI, Gemini, Claude, etc.). The customer sees prices for the same product from other websites.

Optional addition — AI (recommendations in cart):
- Send to LLM (OpenAI): what the user has in the cart (e.g. product titles/categories) and the full catalog (id, title, category). LLM returns recommended product IDs from our catalog (e.g. skis, accessories to go with a helmet).
- Display block "Recommended for you" / "Complete your setup" in the cart, under the selected items — real product cards (image, title, price, Add to cart) from our DB.
- Cart panel is made wider to fit the recommendations block.
