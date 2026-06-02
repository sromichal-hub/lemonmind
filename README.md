# GPSR Product Manager

Full-stack application for managing GPSR-compliant products with authentication, category hierarchy, and comprehensive safety information.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Database**: PostgreSQL (containerized)
- **Container**: Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run the entire stack
```bash
docker-compose up
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Backend** on `http://localhost:3000`
- **Frontend** on `http://localhost:5173`

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   └── index.ts          # Backend entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml
└── .env
```

## 🔧 Environment Variables

Backend uses `.env`:
```
DATABASE_URL=postgresql://gpsr_user:gpsr_password@postgres:5432/gpsr_db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=3000
```

## 📦 Features (To Implement)

- [x] Database schema with GPSR fields
- [ ] User authentication (JWT)
- [ ] Category tree management
- [ ] Product CRUD operations
- [ ] File uploads for GPSR documents
- [ ] Moderation workflow
- [ ] API endpoints
- [ ] Frontend UI components

## 🛠️ Development

### Stop containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f postgres   # Database logs
```

### Database migrations (when needed)
```bash
docker-compose exec backend npm run db:migrate
```

## 🗄️ Database Schema

**Users**: email, password, name  
**Categories**: hierarchical tree (parentId), user-specific  
**Products**: connected to categories, includes all GPSR fields  

---

Ready to implement features! 🎯
