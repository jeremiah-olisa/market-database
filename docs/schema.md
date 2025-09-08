# Database Schema Documentation

## Overview
The Market Database uses PostgreSQL with PostGIS extension for spatial data support.

## Core Tables

### 1. products
Primary table for service offerings and products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL, CHECK(length >= 3) | Product name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| description | TEXT | | Product description |
| status | product_status | NOT NULL DEFAULT 'active' | Product status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `products_pkey` (id)
- `products_slug_idx` (slug)
- `products_status_idx` (status)

### 2. areas
Geographic areas with spatial data support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Area name |
| state | VARCHAR(50) | NOT NULL | State/province |
| country | VARCHAR(50) | NOT NULL DEFAULT 'Nigeria' | Country |
| coordinates | GEOMETRY(POINT, 4326) | | Spatial coordinates |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `areas_pkey` (id)
- `areas_name_state_idx` (name, state)
- `areas_coordinates_idx` (coordinates) GIST

### 3. estates
Estate information and classifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL, CHECK(length >= 3) | Estate name |
| product_id | INTEGER | FOREIGN KEY(products.id) | Associated product |
| area_id | INTEGER | FOREIGN KEY(areas.id) | Geographic area |
| estate_type | estate_type | NOT NULL | Type of estate |
| classification | estate_classification | NOT NULL | Market classification |
| unit_count | INTEGER | NOT NULL DEFAULT 0 | Total units |
| gated | BOOLEAN | DEFAULT false | Gated community |
| has_security | BOOLEAN | DEFAULT false | Security features |
| occupancy_status | occupancy_status | NOT NULL DEFAULT 'under_construction' | Current occupancy |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `estates_pkey` (id)
- `estates_product_id_idx` (product_id)
- `estates_area_id_idx` (area_id)
- `estates_classification_idx` (classification)
- `estates_type_idx` (estate_type)

### 4. estate_units
Unit-level data and pricing information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| estate_id | INTEGER | FOREIGN KEY(estates.id) | Parent estate |
| unit_type | VARCHAR(50) | NOT NULL, CHECK(length >= 2) | Unit type |
| status | unit_status | NOT NULL DEFAULT 'available' | Unit status |
| rent_price | DECIMAL(10,2) | | Monthly rent price |
| sale_price | DECIMAL(10,2) | | Sale price |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `estate_units_pkey` (id)
- `estate_units_estate_id_idx` (estate_id)
- `estate_units_status_idx` (status)
- `estate_units_price_idx` (rent_price, sale_price)

### 5. price_trends
Historical pricing data for market analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| product_id | INTEGER | FOREIGN KEY(products.id) | Associated product |
| area_id | INTEGER | FOREIGN KEY(areas.id) | Geographic area |
| price_type | price_type | NOT NULL | Type of price |
| price | DECIMAL(10,2) | NOT NULL | Price value |
| date | DATE | NOT NULL | Price date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `price_trends_pkey` (id)
- `price_trends_product_id_idx` (product_id)
- `price_trends_area_id_idx` (area_id)
- `price_trends_date_idx` (date)

## Enum Types

### product_status
- `active` - Product is available
- `inactive` - Product is temporarily unavailable
- `archived` - Product is discontinued


# Database Schema

## Core Tables

- `areas`: Geographic regions, includes geometry (MultiPolygon)
- `estates`: Linked to areas, includes tier (enum: platinum, gold, silver, bronze), geometry (Point), economic indicators (JSONB)
- `demographics`: Linked to estates, population, household, distributions (JSONB)
- `service_providers`: Market providers, status (enum), metadata (JSONB)
- `service_offerings`: Linked to providers, service_category (enum), features (JSONB)
- `provider_coverage`: Provider-estate coverage, service_quality (enum), coverage type
- `competitive_benchmarking`: Service comparisons, market positioning
- `market_share_data`: Provider-estate market share, revenue, confidence score
- `local_businesses`: Linked to estates, business_type, status (enum), location (geometry Point), metrics (JSONB)
- `customer_profiles`: Linked to estates, customer_type, status (enum), preferences (JSONB)
- `usage_patterns`: Linked to customer_profiles, service_type, usage metrics (JSONB)
- `customer_feedback`: Linked to customer_profiles, service_type, satisfaction_level (enum)

## Relationships

- Estates → Areas (area_id)
- Demographics → Estates (estate_id)
- Local Businesses → Estates (estate_id)
- Customer Profiles → Estates (estate_id)
- Service Offerings → Service Providers (provider_id)
- Provider Coverage → Service Providers & Estates
- Usage Patterns → Customer Profiles (customer_id)
- Customer Feedback → Customer Profiles (customer_id)

## Indexes

- Primary key indexes on all tables
- Foreign key indexes for all relationships
- GIST indexes for geometry columns (areas, estates, local_businesses)
- GIN indexes for JSONB columns (metadata, metrics, preferences)

## Enums

- estate_tier: platinum, gold, silver, bronze
- provider_status: active, inactive
- service_quality: excellent, good, fair, poor
- business_status: active, inactive, closed
- customer_status: active, inactive, suspended
- satisfaction_level: very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied
- service_category: internet, fintech, delivery, mailing
- infrastructure_type: fiber, tower, router
- infrastructure_status: operational, maintenance, down

## Migration History

- 20240317000000_db_init.sql: PostGIS extension
- 20240318000000_create_db_tables.sql: All core and extended tables, enums, indexes

## Notes

- All tables use `created_at` and `updated_at` timestamps
- Extensive use of JSONB for flexible analytics
- Ready for future extensions (financial, infrastructure, advanced analytics)
## Spatial Data Support

The system uses PostGIS for geographic operations:
- **Coordinate System**: WGS84 (EPSG:4326)
- **Geometry Type**: POINT for area coordinates
- **Spatial Functions**: ST_DWithin, ST_Distance, ST_Contains

## Constraints

### Check Constraints
- Product names must be at least 3 characters
- Estate names must be at least 3 characters
- Unit types must be at least 2 characters

### Unique Constraints
- Product slugs must be unique
- Area name + state combination should be unique

### Not Null Constraints
- All primary keys and foreign keys
- Essential business fields (name, status, classification)

## Triggers

### Updated At Triggers
All tables have `updated_at` triggers that automatically update the timestamp when records are modified.

```sql
CREATE TRIGGER update_updated_at_column
    BEFORE UPDATE ON table_name
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Data Volume

| Table | Current Records | Estimated Growth |
|-------|----------------|------------------|
| products | 4 | Low |
| areas | 12 | Low |
| estates | 37 | Medium |
| estate_units | 148 | High |
| price_trends | 168 | High |

## Performance Considerations

- All foreign keys are indexed
- Spatial queries use GIST indexes
- Composite indexes on frequently queried combinations
- Partitioning strategy for price_trends (future) 