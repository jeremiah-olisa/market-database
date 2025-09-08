# Getting Started Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **PostgreSQL**: Version 12.0 or higher
- **PostGIS**: Version 3.0 or higher
- **Docker**: For containerized deployment
- **Git**: For version control

### Software Installation
```bash
# Install Node.js (Windows)
# Download from https://nodejs.org/

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Install Docker Desktop (Windows)
# Download from https://www.docker.com/products/docker-desktop/

# Install Git (Windows)
# Download from https://git-scm.com/download/win
```

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd market-database
```

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
cp .env.example .env

# Edit environment variables
notepad .env
```

**Required Environment Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/market_database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=market_database
DB_USER=your_username
DB_PASSWORD=your_password

# Getting Started

## Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL (with PostGIS extension enabled)
- pnpm (package manager)

## Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Ensure PostgreSQL is running and PostGIS is enabled
4. Configure database connection in `.env` (see example)
5. Run migrations: `pnpm migrate` (creates all tables, enums, indexes)
6. Seed data: `pnpm seed` (populates all tables with realistic data)
7. Run tests: `pnpm test` (validates schema, data, and queries)

## Usage

- Start the application: `pnpm start`
- Orchestrate queries: `pnpm run analysis` (if available)

## Notes

- Ensure PostGIS is enabled in your PostgreSQL instance
- All commands are idempotent and safe for re-run
- Schema and data are ready for advanced analytics and future extensions
```bash
# Create database
createdb market_database

# Enable PostGIS extension
psql -d market_database -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 5. Run Migrations
```bash
# Execute all migrations
node migrations/migrate.js

# Check migration status
node migrations/migrate.js --status
```

### 6. Seed Database
```bash
# Seed with sample data
node seeders/seed.js
```

### 7. Verify Installation
```bash
# Run tests
node tests/run-all-tests.js

# Start application
node index.js
```

## Quick Start Commands

### Development Workflow
```bash
# Start development
npm run dev

# Run tests
npm test

# Database operations
npm run migrate
npm run seed
npm run reset

# Linting and formatting
npm run lint
npm run format
```

### Database Operations
```bash
# Reset database
npm run db:reset

# Migrate database
npm run db:migrate

# Seed database
npm run db:seed

# Check database status
npm run db:status
```

## Configuration Files

### package.json Scripts
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "node tests/run-all-tests.js",
    "migrate": "node migrations/migrate.js",
    "seed": "node seeders/seed.js",
    "reset": "node seeders/cleanup.js && node seeders/seed.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: market_database
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Check connection parameters
psql -h localhost -U postgres -d market_database

# Verify environment variables
echo $DATABASE_URL
```

#### Migration Failures
```bash
# Check migration status
node migrations/migrate.js --status

# Reset migrations
node migrations/migrate.js --reset

# Check database schema
psql -d market_database -c "\dt"
```

#### Permission Denied
```bash
# Check file permissions
ls -la

# Fix permissions (Windows)
icacls . /grant Everyone:F /T

# Fix permissions (Linux/Mac)
chmod -R 755 .
```

#### Port Already in Use
```bash
# Check port usage
netstat -ano | findstr :5432

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>
```

### Environment Issues

#### Node.js Version
```bash
# Check Node.js version
node --version

# Install correct version
# Use nvm or download from nodejs.org
```

#### Package Manager Issues
```bash
# Clear cache
npm cache clean --force
pnpm store prune
yarn cache clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Setup

### IDE Configuration

#### VS Code Extensions
- PostgreSQL
- SQLTools
- Docker
- Node.js Extension Pack
- Prettier
- ESLint

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.sql": "sql"
  }
}
```

### Git Configuration
```bash
# Set up Git hooks
git config core.hooksPath .githooks

# Pre-commit hooks
npm install --save-dev husky lint-staged
```

## Production Deployment

### Environment Variables
```env
# Production Configuration
NODE_ENV=production
PORT=3000

# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/market_database
DB_HOST=production-host
DB_PORT=5432
DB_NAME=market_database
DB_USER=production_user
DB_PASSWORD=secure_password

# Security
SSL_MODE=require
```

### Docker Production
```bash
# Build production image
docker build -t market-database:production .

# Run production container
docker run -d \
  --name market-database-prod \
  -p 3000:3000 \
  --env-file .env.production \
  market-database:production
```

## Next Steps

### After Installation
1. **Explore the System**: Run sample queries
2. **Review Documentation**: Read schema and API docs
3. **Run Tests**: Verify system integrity
4. **Customize Data**: Modify seeders for your needs

### Development Workflow
1. **Make Changes**: Modify code or schema
2. **Run Tests**: Ensure changes work correctly
3. **Create Migration**: For schema changes
4. **Update Seeders**: For data changes
5. **Commit Changes**: Version control

### Learning Resources
- **Schema Documentation**: `docs/schema.md`
- **API Reference**: `docs/queries.md`
- **Testing Guide**: `docs/testing.md`
- **Migration Guide**: `docs/migrations.md`
