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

### estate_type
- `apartment` - Multi-unit residential building
- `bungalow` - Single-story house
- `duplex` - Two-story house
- `mansion` - Large luxury house
- `penthouse` - Top-floor luxury unit

### estate_classification
- `luxury` - High-end premium properties
- `middle_income` - Mid-range properties
- `low_income` - Affordable properties

### occupancy_status
- `fully_occupied` - All units occupied
- `partially_occupied` - Some units available
- `under_construction` - Still being built
- `vacant` - No units occupied

### unit_status
- `available` - Unit is available
- `occupied` - Unit is rented/sold
- `under_construction` - Unit being built
- `maintenance` - Unit under maintenance

### price_type
- `rent` - Rental price
- `sale` - Sale price
- `maintenance` - Maintenance cost

## Foreign Key Relationships

```
products (1) ←→ (N) estates
areas (1) ←→ (N) estates
estates (1) ←→ (N) estate_units
products (1) ←→ (N) price_trends
areas (1) ←→ (N) price_trends
```

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