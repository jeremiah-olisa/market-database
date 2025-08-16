# Database Migrations Documentation

## Overview
The migration system manages database schema evolution through versioned SQL files.

## Migration Files

### 1. 20240318000000_create_migrations_table.sql
Creates the migrations tracking table.

```sql
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 20240318000001_create_enum_types.sql
Defines custom enum types for business logic.

```sql
-- Product status enum
CREATE TYPE product_status AS ENUM (
    'active', 'inactive', 'archived'
);

-- Estate type enum  
CREATE TYPE estate_type AS ENUM (
    'apartment', 'bungalow', 'duplex', 'mansion', 'penthouse'
);

-- Estate classification enum
CREATE TYPE estate_classification AS ENUM (
    'luxury', 'middle_income', 'low_income'
);

-- Occupancy status enum
CREATE TYPE occupancy_status AS ENUM (
    'fully_occupied', 'partially_occupied', 'under_construction', 'vacant'
);

-- Unit status enum
CREATE TYPE unit_status AS ENUM (
    'available', 'occupied', 'under_construction', 'maintenance'
);

-- Price type enum
CREATE TYPE price_type AS ENUM (
    'rent', 'sale', 'maintenance'
);
```

### 3. 20240318000002_create_base_tables.sql
Creates core database tables.

```sql
-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status product_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Areas table
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Nigeria',
    coordinates GEOMETRY(POINT, 4326),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Estates table
CREATE TABLE estates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 3),
    product_id INTEGER REFERENCES products(id),
    area_id INTEGER REFERENCES areas(id),
    estate_type estate_type NOT NULL,
    classification estate_classification NOT NULL,
    unit_count INTEGER NOT NULL DEFAULT 0,
    gated BOOLEAN DEFAULT false,
    has_security BOOLEAN DEFAULT false,
    occupancy_status occupancy_status NOT NULL DEFAULT 'under_construction',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Estate units table
CREATE TABLE estate_units (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER REFERENCES estates(id),
    unit_type VARCHAR(50) NOT NULL CHECK (LENGTH(unit_type) >= 2),
    status unit_status NOT NULL DEFAULT 'available',
    rent_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Price trends table
CREATE TABLE price_trends (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    area_id INTEGER REFERENCES areas(id),
    price_type price_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. 20240318000003_create_base_indexes.sql
Creates performance indexes.

```sql
-- Foreign key indexes
CREATE INDEX estates_product_id_idx ON estates(product_id);
CREATE INDEX estates_area_id_idx ON estates(area_id);
CREATE INDEX estate_units_estate_id_idx ON estate_units(estate_id);
CREATE INDEX price_trends_product_id_idx ON price_trends(product_id);
CREATE INDEX price_trends_area_id_idx ON price_trends(area_id);

-- Business logic indexes
CREATE INDEX estates_classification_idx ON estates(classification);
CREATE INDEX estates_type_idx ON estates(estate_type);
CREATE INDEX estate_units_status_idx ON estate_units(status);
CREATE INDEX price_trends_date_idx ON price_trends(date);

-- Spatial indexes
CREATE INDEX areas_coordinates_idx ON areas USING GIST(coordinates);

-- Composite indexes
CREATE INDEX estates_area_classification_idx ON estates(area_id, classification);
CREATE INDEX estates_type_classification_idx ON estates(estate_type, classification);
```

### 5. 20240318000004_create_market_intelligence_tables.sql
Creates market intelligence tables (future implementation).

### 6. 20240318000005_create_business_ecosystem_tables.sql
Creates business ecosystem tables (future implementation).

### 7. 20240318000006_create_customer_intelligence_tables.sql
Creates customer intelligence tables (future implementation).

### 8. 20240318000007_create_infrastructure_tables.sql
Creates infrastructure tables (future implementation).

### 9. 20240318000008_create_additional_business_tables.sql
Creates additional business tables (future implementation).

### 10. 20240318000009_add_estate_tier_classification.sql
Adds estate tier classification (future implementation).

### 11. 20240318000010_enhance_business_intelligence.sql
Enhances business intelligence (future implementation).

### 12. 20240318000011_enhance_competitive_intelligence.sql
Enhances competitive intelligence (future implementation).

### 13. 20240318000012_add_expanded_services_support.sql
Adds expanded services support (future implementation).

### 14. 20240318000013_enhance_investment_tracking.sql
Enhances investment tracking (future implementation).

## Migration Runner

### migrate.js
Main migration execution script.

```javascript
import { pool } from '../utils/index.js';
import fs from 'fs';
import path from 'path';

class MigrationRunner {
    async runMigrations() {
        // Migration logic
    }
    
    async checkStatus() {
        // Status checking logic
    }
}
```

## Usage

### Run Migrations
```bash
# Run all pending migrations
node migrations/migrate.js

# Check migration status
node migrations/migrate.js --status

# Run specific migration
node migrations/migrate.js --file 20240318000002_create_base_tables.sql
```

### Migration Status
```sql
-- Check executed migrations
SELECT * FROM migrations ORDER BY executed_at;

-- Check pending migrations
SELECT filename FROM migrations WHERE executed = false;
```

## Rollback

### Manual Rollback
```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS price_trends;
DROP TABLE IF EXISTS estate_units;
DROP TABLE IF EXISTS estates;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS products;

-- Drop enum types
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS estate_type CASCADE;
DROP TYPE IF EXISTS estate_classification CASCADE;
DROP TYPE IF EXISTS occupancy_status CASCADE;
DROP TYPE IF EXISTS unit_status CASCADE;
DROP TYPE IF EXISTS price_type CASCADE;
```

### Automated Rollback
```bash
# Rollback last migration
node migrations/migrate.js --rollback

# Rollback to specific migration
node migrations/migrate.js --rollback-to 20240318000002
```

## Best Practices

### Migration Naming
- Use timestamp prefix: `YYYYMMDDHHMMSS_description.sql`
- Use descriptive names: `create_users_table.sql`
- Use lowercase with underscores

### Migration Content
- One logical change per migration
- Include rollback statements
- Test migrations on development first
- Document complex migrations

### Execution Order
- Dependencies first (tables before indexes)
- Data migrations after schema changes
- Test each migration individually

## Future Migrations

### Phase 5: Extended Intelligence
- Service provider tables
- Customer profile tables
- Infrastructure mapping tables
- Financial intelligence tables

### Phase 6: Advanced Features
- Materialized views
- Partitioning strategies
- Advanced spatial functions
- JSONB enhancements
