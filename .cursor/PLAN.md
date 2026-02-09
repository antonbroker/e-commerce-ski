# E-Commerce Final Project — Development Plan

## Project Goal
Build a **portfolio-ready e-commerce web application** with two operation modes:
- **Admin** — manage store data and view statistics
- **Customer** — browse products, manage cart, create orders

The project is developed as a **learning project**:
- very small steps
- clear explanations of why things are done
- clean but junior-friendly code
- strict adherence to course requirements

---

## Tech Stack (Fixed Decisions)

### Frontend
- React (Vite)
- React Router
- Redux Toolkit (mandatory by course)
- CSS (plain, no UI library for now)
- Charts: Recharts

Redux is used **only where it makes sense**:
- auth (user, token, role)
- cart
- core entities caching (products/categories if needed)

Local component state is used for forms and UI-only state.

### Backend
- Node.js + Express (JavaScript)
- REST API
- MongoDB (local, inspected via Studio 3T)
- Mongoose ODM

### Authentication & Authorization
- JWT access token
- Token stored in `sessionStorage`
- Middleware:
  - `auth` — verifies token
  - `isAdmin` — role-based access

---

## Project Structure (Monorepo)
/
├── client/ # React frontend
├── server/ # Express backend
├── PLAN.md
├── README.md
└── .env.example
---

## Rules of Work (Important)
- Ultra small steps (5–20 minutes)
- One feature per step
- 1–3 files maximum per step
- Each step has a **Definition of Done**
- Always understand *why* before coding
- No jumping ahead
- Backend and frontend are developed **together** as vertical slices

---

## Milestones Overview

- Milestone 0 — Project Setup & Skeleton
- Milestone 1 — Authentication (Vertical Slice)
- Milestone 2 — Admin: Categories CRUD
- Milestone 3 — Admin: Products CRUD
- Milestone 4 — Customer: Catalog + Filters + Cart
- Milestone 5 — Orders (Customer + Admin)
- Milestone 6 — Statistics & Charts
- Milestone 7 — Polish, Validation & Deploy

---

## Milestone 0 — Project Setup & Skeleton

### Scope

#### Backend
- Initialize Node.js project
- Basic Express server
- MongoDB connection
- Environment variables setup
- Health check endpoint

#### Frontend
- Create Vite React app
- Setup routing structure
- Setup Redux Toolkit store
- Create empty page placeholders

#### Shared
- `.env.example`
- Base README structure

### Definition of Done
- Client runs on `localhost:5173`
- Server runs on `localhost:3001`
- `GET /api/health` returns `{ ok: true }`
- MongoDB connection successful
- No business logic yet

---

## Milestone 1 — Authentication (Vertical Slice)

### Scope

#### Backend
- User model:
  - email
  - passwordHash
  - role (`admin` / `customer`)
- Routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Password hashing
- JWT creation
- `auth` middleware

#### Frontend
- Pages:
  - `/login`
  - `/register`
- Auth Redux slice:
  - user
  - token
  - role
- Store token in `sessionStorage`
- Route guards:
  - public
  - customer-only
  - admin-only

### Definition of Done
- User can register
- User can login
- Token stored in sessionStorage
- Protected route `/me` works
- UI changes based on role
- Unauthorized access is blocked

---

## Milestone 2 — Admin: Categories CRUD

### Scope

#### Backend
- Category model
- CRUD endpoints:
  - create
  - read
  - update
  - delete
- Admin-only protection

#### Frontend
- Admin Categories page
- Categories displayed in table
- Add category
- Update category:
  - click "Update" → text becomes editable input
- Delete category

### Definition of Done
- Admin can fully manage categories
- Non-admin users cannot access endpoints
- UI behavior matches project requirements

---

## Milestone 3 — Admin: Products CRUD

### Scope

#### Backend
- Product model:
  - title
  - price
  - category
  - image URL
  - quantity in stock
- CRUD endpoints
- Admin-only access

#### Frontend
- Admin Products page
- Table with products
- Add product (empty editable row)
- Update product
- Delete product

### Definition of Done
- Products linked to categories
- Admin can manage all products
- Products persist in DB

---

## Milestone 4 — Customer: Catalog, Filters & Cart

### Scope

#### Backend
- Public products endpoint
- Query params for filtering (category, price, search)

#### Frontend
- Product catalog page
- Filters:
  - by category
  - by price
  - by title
- Cart (Redux):
  - add product
  - increase / decrease quantity
  - remove product
- Cart summary:
  - total items
  - total price

### Definition of Done
- Customer can browse and filter products
- Cart updates correctly
- Product stock respected
- UI updates immediately

---

## Milestone 5 — Orders

### Scope

#### Backend
- Order model:
  - user
  - products snapshot
  - total price
  - createdAt
- Routes:
  - create order
  - get user orders
  - admin: get all orders

#### Frontend
- Create order from cart
- After order:
  - cart cleared
  - user logged out (requirement)
- Customer orders page
- Admin customers/orders page

### Definition of Done
- Orders saved in DB
- Customer sees own orders
- Admin sees all orders
- Logout after order works

---

## Milestone 6 — Statistics & Charts

### Scope

#### Backend
- Aggregation queries:
  - total sold products
  - product quantity per customer

#### Frontend
- Statistics page (Admin)
- Charts:
  - Pie chart: all products sold
  - Bar chart: quantity per product per customer
- Dropdown to select customer

### Definition of Done
- Charts render correctly
- Data matches DB
- Dropdown affects bar chart

---

## Milestone 7 — Polish & Deploy

### Scope
- Input validation (frontend + backend)
- Error handling
- Loading states
- Reusable table component
- Seed data
- README completion
- Deploy:
  - Backend (Render / Fly.io)
  - Frontend (Netlify / Vercel)

### Definition of Done
- App stable
- No critical bugs
- Clear README
- Ready for submission and portfolio

---

## Final Note
This project prioritizes **learning and understanding** over speed.
Every decision should be explainable in an interview.