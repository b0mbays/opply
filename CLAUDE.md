# Opply Code Challenge — CLAUDE.md

## Project Overview

Opply is a B2B procurement platform connecting **Buyers** (food & beverage brands) with **Suppliers** (ingredient manufacturers). This is a prototype interview challenge: a new feature will be specified during the session and implemented on top of this scaffold.

Stack:
- **Backend**: Django 5 + Django REST Framework, SQLite (dev), Token auth
- **Frontend**: Vue 3 + Vite + TypeScript, Axios, Vue Router

## Running the Project

```bash
docker compose up          # recommended — runs migrations + seed automatically
```

Or manually:
```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
python manage.py migrate && python manage.py seed && python manage.py runserver

# Frontend
cd frontend && npm install && cp .env.example .env && npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Django admin: http://localhost:8000/admin/ (`demo` / `demo1234`)

## Domain Model

```
User ──► Buyer ──► Order ──► OrderItem ──► Ingredient ──► Supplier
                 └──► Product ──► ProductIngredient ──► Ingredient
```

Key models:
- `Buyer` (`buyers/models.py`) — linked 1:1 to Django User
- `Supplier` (`suppliers/models.py`) — ingredient manufacturer
- `Ingredient` (`ingredients/models.py`) — has `unit`, `price_per_unit`, belongs to one Supplier
- `Order` / `OrderItem` (`orders/models.py`) — order has a status state machine; OrderItem snapshots `unit_price`
- `Product` / `ProductIngredient` (`products/models.py`) — buyer's product recipe composed of ingredients

## Order State Machine

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

Transition via `POST /api/orders/<id>/transition/` with `{ "status": "<NEW_STATUS>" }`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login/` | No | Obtain token |
| GET | `/api/buyers/me/` | Token | Current buyer profile |
| GET | `/api/suppliers/` | Token | List suppliers |
| GET | `/api/suppliers/<id>/` | Token | Supplier detail |
| GET | `/api/suppliers/<id>/ingredients/` | Token | Supplier's ingredients |
| GET | `/api/ingredients/` | Token | All ingredients |
| GET, POST | `/api/orders/` | Token | List / create orders |
| GET | `/api/orders/<id>/` | Token | Order detail |
| POST | `/api/orders/<id>/transition/` | Token | Advance order state |
| GET, POST | `/api/products/` | Token | List / create products |
| GET, PATCH, PUT, DELETE | `/api/products/<id>/` | Token | Product CRUD |

Auth header: `Authorization: Token <token>`

## Repository Structure

```
backend/
  opply/            # Django settings & root URLs
  buyers/           # Buyer model + API
  suppliers/        # Supplier model + API
  ingredients/      # Ingredient model + API
  orders/           # Order, OrderItem, state machine
  products/         # Product, ProductIngredient
  core/             # Shared management commands (seed)

frontend/src/
  views/            # LoginView, DashboardView, SuppliersView, OrdersView,
                    # ProductsView, CreateOrderView, CreateProductView,
                    # OrderDetailView, ProductDetailView, SupplierDetailView
  services/         # Axios API clients (api.ts, auth.ts, orders.ts, ...)
  composables/      # useAuth
  types/            # Shared TypeScript interfaces
  router/           # Vue Router (auth guards in place)
```

## Conventions

### Backend
- New Django apps: create under `backend/`, register in `opply/settings.py` `INSTALLED_APPS`, wire URLs in `opply/urls.py`
- ViewSets + DRF Routers preferred; use `IsAuthenticated` permission class
- Models should have `__str__` and, where appropriate, `Meta` ordering
- Migrations must be generated (`python manage.py makemigrations`) before running

### Frontend
- Vue 3 Composition API (`<script setup lang="ts">`) — no Options API
- New API calls go in `src/services/`; new pages go in `src/views/` and must be registered in `src/router/index.ts`
- Authenticated routes require `meta: { requiresAuth: true }`
- Use `axios` instance from `src/services/api.ts` (handles base URL + auth token)

## Quality Guardrails

### Backend (Ruff)
```bash
cd backend
ruff check .          # lint
ruff check . --fix    # auto-fix
ruff format .         # format
```
Config: `backend/pyproject.toml` — rules: E/W (pycodestyle), F (pyflakes), I (isort), B (bugbear), UP (pyupgrade).

### Frontend (ESLint + Prettier)
```bash
cd frontend
npm run lint          # check
npm run lint:fix      # auto-fix
npm run format        # prettier write
npm run format:check  # prettier check (CI)
```
Config: `frontend/eslint.config.js`, `frontend/.prettierrc`.

---

## Development Workflow

1. Implement backend model changes → generate migration → update serializer, view, URL
2. Write backend integration tests (`APITestCase`) covering the new endpoint
3. Implement frontend service → implement view component → register route
4. Verify with `vue-tsc --noEmit` (frontend) before claiming done
5. Test the feature end-to-end in the browser against the running stack

## Testing Strategy

### Backend — Django `APITestCase` (do this)
Use DRF's `APITestCase` with the real SQLite database — no mocking. Each new API endpoint should have a test class covering at minimum:
- Unauthenticated request returns `401`
- Authenticated request returns the correct response shape
- Any business logic or filtering is verified (e.g. results are scoped to the current buyer)

Run with:
```bash
cd backend && python manage.py test
```

### Frontend — skip integration tests in this session
Playwright/Cypress setup cost is too high for a timebox. Rely on `vue-tsc --noEmit` for type correctness and manual browser verification for UI behaviour.

## Claude Superpowers — Recommended Workflow

Use these skills in order when implementing the interview feature:

1. **`superpowers:brainstorming`** — run first, before any code. Clarifies ambiguous requirements: what does "trending" mean (time window, metric, data source), what the API contract looks like, and how the UI should handle matching.

2. **`superpowers:writing-plans`** — once the design is settled, produce a concrete step-by-step implementation plan covering backend endpoint, serializer, frontend service, and view. Keeps the approach visible to the interviewer.

3. **`superpowers:dispatching-parallel-agents`** — backend and frontend work are independent once the API contract is agreed. Run them in parallel to save time in a time-boxed session.

4. **`superpowers:verification-before-completion`** — before declaring done, confirm the stack is running, the endpoint responds correctly, and the UI works end-to-end in the browser.

Skills to skip in this context: `test-driven-development` (too slow for a timebox), `receiving-code-review` / `requesting-code-review` (no reviewer), `using-git-worktrees` (single feature, no isolation needed).

---

## Feature Work (to be filled in during session)

> The specific feature to implement will be provided at the start of the interview session. Update this section once the use case is known.
