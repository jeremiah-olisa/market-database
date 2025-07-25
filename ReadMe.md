# Market Database Management System

A comprehensive PostgreSQL database system for real estate market analysis, featuring modular migrations, seeders, and utility functions.

## 📁 Project Structure

```
market-database/
├── migrations/                    # Database schema migrations
│   ├── migrate.js                # Migration runner
│   ├── 20250725101000-create-products.sql
│   ├── 20250725102000-create-areas.sql
│   ├── 20250725103000-create-estates.sql
│   ├── 20250725104000-create-estate-units.sql
│   └── 20250725105000-create-price-trends.sql
├── seeders/                      # Database seeding modules
│   ├── seed.js                   # Main seeder orchestrator
│   ├── products-seed.js          # Products table seeder
│   ├── areas-seed.js             # Areas table seeder
│   ├── estates-seed.js           # Estates table seeder
│   ├── estate-units-seed.js      # Estate units table seeder
│   └── price-trends-seed.js      # Price trends table seeder
├── utils/                        # Utility functions
│   ├── pool.js                   # PostgreSQL connection pool
│   └── index.js                  # Shared utility functions
├── docker-compose.yml            # Docker services configuration
├── Dockerfile                    # Node.js application container
├── package.json                  # Project dependencies and scripts
└── index.js                      # Application entry point
```

## 🗂️ Database Schema (ERD)

```mermaid
erDiagram
    products {
        serial id PK
        varchar name
        varchar slug UK
        text description
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    areas {
        serial id PK
        varchar name
        varchar state
        varchar geo_code
        timestamp created_at
        timestamp updated_at
    }
    
    estates {
        serial id PK
        varchar name
        varchar estate_type
        integer product_id FK
        integer area_id FK
        integer unit_count
        varchar occupancy_status
        varchar classification
        boolean gated
        boolean has_security
        timestamp created_at
        timestamp updated_at
    }
    
    estate_units {
        serial id PK
        integer estate_id FK
        varchar unit_type
        varchar floor_level
        varchar status
        timestamp last_surveyed_at
        decimal rent_price
        decimal sale_price
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    price_trends {
        serial id PK
        integer product_id FK
        integer area_id FK
        varchar unit_type
        varchar price_type
        decimal price
        varchar currency
        date period
        varchar source
        timestamp created_at
        timestamp updated_at
    }
    
    products ||--o{ estates : "has"
    areas ||--o{ estates : "contains"
    estates ||--o{ estate_units : "contains"
    products ||--o{ price_trends : "tracks"
    areas ||--o{ price_trends : "tracks"
```
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (for local development)
- **Docker & Docker Compose** (for containerized setup)

### Option 1: Local Development (Without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=market_db
   DB_PASSWORD=postgres
   DB_PORT=5432
   ```

3. **Start PostgreSQL locally** (ensure it's running on port 5432)

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

### Option 2: Docker Setup (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Start PostgreSQL database
   - Build and run the Node.js application
   - Automatically run migrations and seeders

2. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📊 Database Schema

### Tables Overview

| Table | Description | Records |
|-------|-------------|---------|
| `products` | Product offerings (MDU Data, Home Internet, etc.) | 7 |
| `areas` | Geographical locations (Lagos, Abuja areas) | 8 |
| `estates` | Residential clusters linked to products and areas | 8 |
| `estate_units` | Individual units within estates | 10 |
| `price_trends` | Historical pricing data | 8 |

### Key Relationships
- **estates** → `products` (product_id)
- **estates** → `areas` (area_id)
- **estate_units** → `estates` (estate_id)
- **price_trends** → `products` (product_id)
- **price_trends** → `areas` (area_id)

## 🛠️ Available Scripts

```bash
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm start          # Start the application
```

## 🔧 Utility Functions

### `utils/index.js`
- `generatePlaceholders(dataArray, columnsPerRow)` - Generate SQL placeholders
- `extractValues(dataArray, fieldNames)` - Extract values from objects
- `generateInsertData(dataArray, fieldNames)` - Complete insert data generation

### `utils/pool.js`
- Shared PostgreSQL connection pool for all database operations

## 📈 Sample Queries

### Count estates by area and occupancy status:
```sql
SELECT a.name, e.occupancy_status, COUNT(*) as estate_count
FROM estates e
JOIN areas a ON e.area_id = a.id
GROUP BY a.name, e.occupancy_status;
```

### Average rent price by unit type in an area:
```sql
SELECT pt.unit_type, AVG(pt.price) as avg_price
FROM price_trends pt
JOIN areas a ON pt.area_id = a.id
WHERE pt.price_type = 'rent' AND a.name = 'Victoria Island'
GROUP BY pt.unit_type;
```

### List vacant units in luxury estates:
```sql
SELECT eu.unit_type, eu.rent_price, e.name as estate_name
FROM estate_units eu
JOIN estates e ON eu.estate_id = e.id
WHERE eu.status = 'vacant' AND e.classification = 'luxury';
```

## 🏗️ Architecture Features

### Modular Seeders
- **Separate files** for each table seeder
- **Dependency-aware** execution order
- **Reusable utility functions** for SQL generation
- **Scalable structure** for adding new tables

### Migration System
- **Timestamped files** for ordered execution
- **Automatic discovery** of SQL migration files
- **Transaction safety** with rollback on errors
- **Friendly logging** with emojis and progress indicators

### Database Design
- **Foreign key constraints** for data integrity
- **Check constraints** for enum validation
- **Indexes** on frequently queried fields
- **Timestamps** for audit trails
- **Decimal precision** for currency values

## 🔍 Data Insights

### Sample Data Includes:
- **7 Products**: MDU Data, Home Internet, Business Fiber, etc.
- **8 Areas**: Victoria Island, Ikeja, Garki, Lekki, etc.
- **8 Estates**: Banana Island, Ikeja GRA, Lekki Phase 1, etc.
- **10 Estate Units**: Various unit types (1-5 bedrooms, studios, penthouses)
- **8 Price Trends**: Rent and sale prices across different areas

### Price Ranges:
- **Rent**: ₦2.5M - ₦10M per annum
- **Sale**: ₦120M - ₦200M
- **Unit Types**: 1-bedroom to 5-bedroom, studios, penthouses
- **Classifications**: Luxury, middle-income, low-income

## 🐳 Docker Configuration

### Services:
- **PostgreSQL**: Latest version with health checks
- **Node.js App**: Custom container with migrations and seeding

### Environment Variables:
- Database connection settings
- Automatic migration and seeding on startup

### Volumes:
- Persistent database storage
- Live code reloading for development

## 📝 Development Notes

### Adding New Tables:
1. Create migration file with timestamp prefix
2. Create corresponding seeder file
3. Import seeder in `seeders/seed.js`
4. Add to execution order

### Adding New Seed Data:
1. Update the data array in the respective seeder file
2. The utility functions will automatically handle SQL generation

### Database Connection:
- Uses connection pooling for efficiency
- Environment variable configuration
- Automatic cleanup on application shutdown

## 🤝 Contributing

1. Follow the existing file structure
2. Use the utility functions for SQL generation
3. Maintain foreign key relationships
4. Add appropriate indexes for performance
5. Include sample data in seeders