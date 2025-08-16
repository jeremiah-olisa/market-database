# Package.json Commands Documentation

## Overview
Available npm/pnpm scripts for development, testing, and deployment.

## Available Scripts

### Application Commands
```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Build production version
npm run build
```

### Testing Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:schema
npm run test:migrations
npm run test:performance

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Database Commands
```bash
# Run database migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback

# Seed database with sample data
npm run seed

# Reset database (clean + seed)
npm run reset

# Clean database
npm run clean
```

### Development Commands
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check

# Type checking
npm run type-check
```

### Build Commands
```bash
# Build application
npm run build

# Build for production
npm run build:prod

# Build for development
npm run build:dev

# Clean build artifacts
npm run clean:build
```

### Docker Commands
```bash
# Start database
npm run docker:up

# Stop database
npm run docker:down

# Restart database
npm run docker:restart

# View database logs
npm run docker:logs

# Reset database container
npm run docker:reset
```

## Script Definitions

### package.json Scripts Section
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "npm run build:prod",
    "build:prod": "NODE_ENV=production webpack --mode production",
    "build:dev": "NODE_ENV=development webpack --mode development",
    "clean:build": "rimraf dist build",
    
    "test": "node tests/run-all-tests.js",
    "test:schema": "node tests/schema-validation.test.js",
    "test:migrations": "node tests/migration-tests.test.js",
    "test:performance": "node tests/query-performance.test.js",
    "test:coverage": "nyc npm test",
    "test:watch": "nodemon --exec npm test",
    
    "migrate": "node migrations/migrate.js",
    "migrate:status": "node migrations/migrate.js --status",
    "migrate:rollback": "node migrations/migrate.js --rollback",
    
    "seed": "node seeders/seed.js",
    "reset": "npm run clean && npm run seed",
    "clean": "node seeders/cleanup.js",
    
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:restart": "docker-compose restart",
    "docker:logs": "docker-compose logs -f",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

## Usage Examples

### Development Workflow
```bash
# 1. Start development environment
npm run docker:up
npm run dev

# 2. Make changes to code

# 3. Run tests
npm test

# 4. Format code
npm run format

# 5. Lint code
npm run lint

# 6. Commit changes
git add .
git commit -m "Feature: Add new query module"
```

### Database Management
```bash
# 1. Start database
npm run docker:up

# 2. Run migrations
npm run migrate

# 3. Seed database
npm run seed

# 4. Check status
npm run migrate:status

# 5. Reset if needed
npm run reset
```

### Testing Workflow
```bash
# 1. Run all tests
npm test

# 2. Run specific test suite
npm run test:schema

# 3. Run tests with coverage
npm run test:coverage

# 4. Watch mode for development
npm run test:watch
```

### Production Deployment
```bash
# 1. Build production version
npm run build:prod

# 2. Run production tests
npm test

# 3. Start production server
npm start
```

## Custom Scripts

### Adding New Scripts
```json
{
  "scripts": {
    "custom:script": "node scripts/custom.js",
    "db:backup": "pg_dump $DATABASE_URL > backup.sql",
    "db:restore": "psql $DATABASE_URL < backup.sql"
  }
}
```

### Script with Arguments
```bash
# Run script with arguments
npm run custom:script -- --arg1 value1 --arg2 value2

# Database backup with timestamp
npm run db:backup -- --timestamp $(date +%Y%m%d_%H%M%S)
```

### Conditional Scripts
```json
{
  "scripts": {
    "prebuild": "npm run clean:build",
    "postbuild": "npm run test",
    "prestart": "npm run build",
    "postinstall": "npm run migrate"
  }
}
```

## Environment-Specific Scripts

### Development Environment
```bash
# Development database
npm run docker:up

# Development server
npm run dev

# Development tests
npm run test:watch
```

### Production Environment
```bash
# Production build
npm run build:prod

# Production tests
npm test

# Production start
npm start
```

### CI/CD Environment
```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build application
npm run build:prod
```

## Script Dependencies

### Required Dependencies
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "nyc": "^15.1.0"
  }
}
```

### Optional Dependencies
```json
{
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3",
    "typescript": "^5.1.6",
    "webpack": "^5.88.0"
  }
}
```

## Error Handling

### Script Failures
```bash
# Check script exit codes
npm run test
echo $?

# Handle script failures
npm run test || echo "Tests failed"
```

### Debugging Scripts
```bash
# Run with verbose output
npm run test -- --verbose

# Run with debug logging
DEBUG=* npm run test

# Run with specific Node options
NODE_OPTIONS="--inspect" npm run test
```

## Performance Optimization

### Parallel Execution
```bash
# Run multiple scripts in parallel
npm run test:schema & npm run test:migrations & wait

# Using npm-run-all
npm install --save-dev npm-run-all
npm run all --parallel test:schema test:migrations
```

### Caching
```bash
# Clear npm cache
npm cache clean --force

# Clear pnpm cache
pnpm store prune

# Clear yarn cache
yarn cache clean
```

## Troubleshooting

### Common Issues

#### Script Not Found
```bash
# Check available scripts
npm run

# Verify package.json
cat package.json | grep scripts -A 20
```

#### Permission Denied
```bash
# Fix file permissions
chmod +x scripts/*.js

# Run with sudo (if needed)
sudo npm run docker:up
```

#### Environment Variables
```bash
# Check environment
env | grep NODE

# Load environment file
source .env
npm run start
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
netstat -tulpn | grep :3000

# Kill conflicting process
kill -9 <PID>
```
