# AGENTS.md - GPSR Product Manager Development Guide

Quick reference for AI agents working on this monorepo-style full-stack application.

## Architecture Overview

**Full-stack GPSR Product Management System** with user authentication, hierarchical categories, and GPSR compliance tracking.

- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: React 18 + Vite + Zustand + TailwindCSS + React Hook Form
- **Deployment**: Docker Compose (all services in one file)
- **Entry Points**: `docker compose up` (entire stack), `npm run dev` in backend/frontend folders (local dev)

## Data Model & Flow

### Core Entities (See `backend/prisma/schema.prisma`)
```
User (1) → (Many) Category → (Many) Product
User (1) → (Many) Product
```

**User-Scoped Data**: All categories and products are isolated per user (via `userId` field). This is critical for multi-tenancy.

**Category Hierarchy**: Only Category has self-referential relationship (`parentId` → parent Category). Products are NOT hierarchical.
- Tree building happens in-memory: `GET /api/categories` returns flattened data, backend constructs tree with `buildTree()` function
- Cascade deletion: Deleting a category recursively deletes all descendants AND their products

## Backend Patterns

### Authentication
- **Flow**: Register/Login → JWT created with `{ id, email }` → Token stored in frontend localStorage
- **Middleware**: `authMiddleware` in `backend/src/middleware/auth.ts` extracts token from `Authorization: Bearer <token>` header and attaches `req.user`
- **Protected Routes**: ALL routes except `/api/auth/register` and `/api/auth/login` use `router.use(authMiddleware)` (see categories.ts line 7)
- **Token Expiry**: 7 days (set in `auth.ts` line 36 and 76)

### Route Structure
- **`backend/src/routes/auth.ts`**: POST register, login; GET me (all inline, ~120 lines)
- **`backend/src/routes/categories.ts`**: GET/POST/PUT/DELETE with auth check on every endpoint
- **Error Handling**: All routes catch errors, return generic 500 + error message to logs

### Database Access
- Prisma client singleton: `backend/src/db.ts` (import and use via `prisma` object)
- No connection pooling config (default Prisma behavior)
- Category deletion is transaction-like but manual: `deleteDescendants()` recursively finds children, deletes them, then parent (lines 133-150 in categories.ts)

### Permissions & Security
- User can only access/modify their own categories (checked via `category.userId !== req.user.id` → 403)
- Parent category must belong to same user when creating child
- Cannot create circular parent-child relationships (line 95-98 in categories.ts)

## Frontend Patterns

### State Management (Zustand)
- **Store**: `src/store.ts` - Single auth store with `token` and `user`
- **Persistence**: Uses Zustand's `persist` middleware → writes to localStorage under key `auth-storage`
- **No Redux/Context**: Zustand is lightweight, direct access via `useAuthStore()` hook

### API Client
- **Location**: `src/api.ts` - Axios instance with base URL from `VITE_API_URL` env var
- **Token Injection**: Request interceptor automatically adds `Authorization: Bearer <token>` from store
- **API Methods**: Grouped by domain (`authAPI`, `categoriesAPI`), each returns promise

### Form Validation
- **Library**: Zod + React Hook Form + @hookform/resolvers
- **Schemas**: Defined in `src/schemas.ts` (loginSchema, registerSchema)
- **Pattern**: `const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })`

### Routing & Pages
- **Simple Router**: Manual page switching via state in `App.tsx` (no react-router-dom usage)
- **Pages**: `pages/LoginPage`, `RegisterPage`, `DashboardPage` (has tabs via `currentPage` state)
- **Components**: Reusable `CategoriesList`, `CategoryForm` in `components/`

### Styling
- **TailwindCSS**: `tailwind.config.js` configured, `src/index.css` includes base styles
- **No CSS Modules**: All class-based, Tailwind utility classes

## Critical Development Workflows

### Start Everything
```bash
cd /home/michal/WebstormProjects/untitled
docker compose up
# Waits for Postgres health check, then starts backend (port 3000) and frontend (port 5173)
```

### Develop Backend with Hot Reload
```bash
cd backend
npm install
npm run dev  # Uses tsx watch
```
- Code changes auto-reload via `tsx watch`
- API available at `http://localhost:3000`

### Develop Frontend with Hot Reload
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```
- Port 5173 with HMR
- `VITE_API_URL` env var controls backend URL (default `http://localhost:3000` in `.env` or hardcoded in api.ts)

### Database Operations
```bash
# Inside Docker:
docker compose exec backend npm run db:migrate   # Run pending migrations
docker compose exec backend npx prisma generate  # Regenerate Prisma client
docker compose exec backend npx prisma migrate reset --force  # Wipe & reseed

# Connect with psql:
psql -h localhost -U postgres -d gpsr_db  # (password: postgres)
```

### Reset Everything
```bash
docker compose down -v  # Remove volumes
docker compose up       # Fresh start
```

## Key Files to Understand First

1. **`backend/prisma/schema.prisma`** (69 lines) - Complete data model, shapes all backend/frontend
2. **`backend/src/routes/categories.ts`** (160 lines) - Most complex logic: tree building, recursive deletion, permission checks
3. **`backend/src/middleware/auth.ts`** (33 lines) - How every protected request is validated
4. **`frontend/src/store.ts`** (30 lines) - Entire auth state management
5. **`frontend/src/api.ts`** (36 lines) - How frontend talks to backend with token injection

## Common Tasks & Examples

### Add a New API Endpoint
1. Define database operation in Prisma (if needed, update schema.prisma + migrate)
2. Add route handler in `backend/src/routes/{domain}.ts`
3. Apply `authMiddleware` to protect if needed
4. Export method in `src/api.ts` (e.g., `categoriesAPI.delete = (id) => apiClient.delete(...)`)
5. Call in frontend component: `const result = await categoriesAPI.delete(id)`

### Add Form Validation
1. Define Zod schema in `frontend/src/schemas.ts`
2. Use with React Hook Form: `const form = useForm({ resolver: zodResolver(schema) })`
3. Render error: `{errors.fieldName?.message && <span>{errors.fieldName.message}</span>}`

### Modify Database Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:migrate` (or `docker compose exec backend npm run db:migrate` if containerized)
3. Regenerate Prisma client: `npm run db:generate`
4. Restart backend to pick up changes

### Debug Server Issues
```bash
docker compose logs -f backend    # Live backend logs (console.error messages)
docker compose logs -f frontend   # Live frontend dev server logs
docker compose logs -f postgres   # Database logs (less helpful)
```

## Product Management (Phase 3)

### Features
- Flat product structure (no hierarchy, unlike categories)
- Each product can be linked to one category
- Full CRUD operations with user-scoped access
- Comprehensive GPSR compliance data support:
  - gpsrIdentificationDetails, gpsrWarningPhrases, gpsrWarningText
  - gpsrPictograms, gpsrAdditionalSafetyInfo, gpsrStatementOfCompliance
  - gpsrOnlineInstructionsUrl, gpsrInstructionsManual
  - gpsrDeclarationsOfConformity, gpsrCertificates
  - gpsrModerationStatus, gpsrModerationComment
  - gpsrLastSubmissionDate, gpsrLastModerationDate, gpsrSubmittedBySupplierUser

### Endpoints
```
GET    /api/products              # Get all products for user
GET    /api/products/:id          # Get single product
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
```

### Implementation Files
- **Backend**: `backend/src/routes/products.ts` (~224 lines) - All CRUD handlers with permission checks
- **Frontend API**: `frontend/src/api.ts` - ProductData interface and productsAPI methods
- **Components**: 
  - `frontend/src/components/ProductForm.tsx` - Form with collapsible GPSR section
  - `frontend/src/components/ProductsList.tsx` - Table view with edit/delete actions
- **Page**: `frontend/src/pages/ProductsPage.tsx` - Page layout with form toggle
- **Integration**: Updated `frontend/src/pages/DashboardPage.tsx` to include Products tab

## Environment & Configuration

- **Backend Env**: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT` (see docker-compose.yml for dev values)
- **Frontend Env**: `VITE_API_URL` (where to reach backend, defaults to localhost:3000)
- **Database**: PostgreSQL 15-alpine, user=postgres, password=postgres (dev only)
- **JWT Expiry**: 7 days, signing key is `JWT_SECRET` env var

## Warnings & Gotchas

1. **Manual Tree Building**: Categories are flattened in DB but reconstructed as tree in-memory on GET. Expect nested structure from API.
2. **Recursive Deletion**: Deleting a category with many descendants is O(n) with N queries. No transaction wrapper yet (safe but slow for large trees).
3. **Token Expires Silently**: Frontend has no refresh token logic. After 7 days, requests fail with 401. User must log in again.
4. **User-Scoped Queries Missing Checks**: Some category endpoints assume `req.user` exists (checked at line 11-13 in categories.ts). Tests may fail if token is malformed.
5. **CORS Enabled**: Backend accepts all origins (`cors()` with no config). Restrict in production.
6. **Password Minimum**: Only 6 characters (see `schemas.ts` line 5). No uppercase/number requirements.

