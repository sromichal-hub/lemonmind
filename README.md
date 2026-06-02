# GPSR Product Manager

Full-stack application for managing GPSR-compliant products with authentication, hierarchical category management, and comprehensive safety information.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma ORM
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Zustand
- **Database**: PostgreSQL (containerized)
- **Container**: Docker Compose
- **Authentication**: JWT tokens with bcrypt password hashing

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run the entire stack
```bash
cd /home/michal/WebstormProjects/untitled
docker compose up
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Backend API** on `http://localhost:3000`
- **Frontend** on `http://localhost:5173`

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── db.ts                 # Prisma client
│   │   ├── types.ts              # TypeScript types
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.ts           # Authentication endpoints
│   │       └── categories.ts     # Category management endpoints
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app component with routing
│   │   ├── main.tsx
│   │   ├── api.ts                # API client with Axios
│   │   ├── store.ts              # Zustand auth store
│   │   ├── schemas.ts            # Zod validation schemas
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx (with tabs)
│   │   │   └── CategoriesPage.tsx
│   │   └── components/
│   │       ├── CategoriesList.tsx
│   │       └── CategoryForm.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml
└── README.md
```

## 🔐 Authentication

### Features
- User registration with email validation
- Login with JWT tokens (7 days expiration)
- Password hashing with bcryptjs
- Token-based API authentication
- Persistent auth state with Zustand

### Endpoints
```
POST   /api/auth/register   # Register new user
POST   /api/auth/login      # Login user
GET    /api/auth/me         # Get current user (requires auth)
```

## 📂 Categories Management

### Features
- Hierarchical category tree structure
- Create, read, update, delete operations
- Parent-child relationships
- Cascade deletion of subcategories
- Visual tree representation with expand/collapse

### Endpoints
```
GET    /api/categories              # Get all categories for user
POST   /api/categories              # Create new category
PUT    /api/categories/:id          # Update category
DELETE /api/categories/:id          # Delete category (with children)
```

## 🔗 Database Connection

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: gpsr_db

### Using psql
```bash
psql -h localhost -U postgres -d gpsr_db
# Password: postgres

# List tables
\dt

# View users
SELECT * FROM "User";

# View categories
SELECT * FROM "Category";

# View products
SELECT * FROM "Product";
```

### Using GUI Tools
- **DBeaver**: File → New → Database Connection → PostgreSQL
- **pgAdmin**: http://localhost:5050 (requires separate container)

## 🎯 Features Implemented

### ✅ Phase 1: Authentication
- [x] User registration with validation
- [x] User login with JWT
- [x] Password hashing
- [x] Protected routes
- [x] Persistent auth state

### ✅ Phase 2: Categories
- [x] Create categories
- [x] Hierarchical tree structure
- [x] Edit categories
- [x] Delete with cascade
- [x] Visual tree UI with expand/collapse

### 🔄 Phase 3: Products (Coming Soon)
- [ ] Create products
- [ ] Link products to categories
- [ ] GPSR fields form
- [ ] File uploads (pictograms, manuals, certificates)
- [ ] Product listing and filtering

## 🛠️ Development

### Stop containers
```bash
docker compose down
```

### View logs
```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend logs
docker compose logs -f postgres   # Database logs
```

### Database migrations
```bash
docker compose exec backend npm run db:migrate
```

### Reset database
```bash
docker compose exec backend npx prisma migrate reset --force
```

## 🌍 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/gpsr_db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=3000
```

### Frontend (Vite)
```
VITE_API_URL=http://localhost:3000
```

## 📦 Dependencies

### Backend
- express - Web framework
- @prisma/client - ORM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - Cross-origin requests
- dotenv - Environment variables

### Frontend
- react - UI library
- react-hook-form - Form handling
- zod - Schema validation
- zustand - State management
- axios - HTTP client
- tailwindcss - Styling
- @hookform/resolvers - Form validation resolver

## 🔒 Security

- ✅ JWT tokens for API authentication
- ✅ Bcrypt for password hashing
- ✅ Environment variables for secrets
- ✅ CORS configured
- ✅ User-isolated data (categories/products per user)
- ⚠️ Change JWT_SECRET in production

## 🚧 Next Steps

1. Implement product management (CRUD)
2. Add GPSR fields form with validation
3. Implement file uploads for GPSR documents
4. Add product filtering and search
5. Add moderation workflow
6. Implement role-based access control

---

**Ready to build!** 🚀
