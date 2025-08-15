# Database Schema Documentation

## Table Overview

This document provides comprehensive documentation for all tables in the Market Intelligence Database Management System.

## Core Tables

### 1. products
**Purpose**: Core product/service offerings
**Key Fields**:
- `id`: Primary key
- `name`: Product name
- `slug`: URL-friendly identifier
- `description`: Product description
- `status`: Active/Inactive status
- `service_category`: Service category (fiber, fintech, delivery, etc.)
- `pricing_tier`: Pricing tier classification
- `features`: JSONB field for flexible feature storage

**Indexes**:
- Primary key on `id`
- Index on `service_category`
- GIN index on `features` (JSONB)

### 2. areas
**Purpose**: Geographic areas and districts
**Key Fields**:
- `id`: Primary key
- `name`: Area name
- `state`: Nigerian state
- `geo_code`: Geographic code
- `geometry`: PostGIS POINT geometry (coordinates)
- `population_density`: Population density per km²
- `economic_activity_score`: Economic activity rating (1-100)

**Indexes**:
- Primary key on `id`
- GIST index on `geometry` (spatial)
- Index on `population_density`
- Index on `economic_activity_score`

### 3. estates
**Purpose**: Individual estate information with tier classification
**Key Fields**:
- `id`: Primary key
- `name`: Estate name
- `estate_type`: Type of estate
- `product_id`: Associated product (FK)
- `area_id`: Associated area (FK)
- `unit_count`: Total number of units
- `occupancy_status`: Current occupancy status
- `classification`: Estate classification
- `gated`: Whether estate is gated
- `has_security`: Security presence
- `tier_classification`: Tier (platinum, gold, silver, bronze)
- `metadata`: JSONB field for flexible estate data
- `market_potential_score`: Market potential rating (0-100)
- `competitive_intensity`: Competitive intensity rating (1-10)

**Indexes**:
- Primary key on `id`
- Foreign key indexes on `product_id`, `area_id`
- Index on `tier_classification`
- GIN index on `metadata` (JSONB)
- Compound index on `(tier_classification, area_id)`
- Compound index on `(classification, estate_type, occupancy_status)`

### 4. estate_units
**Purpose**: Individual units within estates
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `unit_type`: Type of unit
- `floor_level`: Floor level
- `status`: Unit status
- `last_surveyed_at`: Last survey timestamp
- `rent_price`: Rental price
- `sale_price`: Sale price
- `notes`: Additional notes

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `unit_type`
- Index on `status`

### 5. price_trends
**Purpose**: Price tracking and trends
**Key Fields**:
- `id`: Primary key
- `product_id`: Associated product (FK)
- `area_id`: Associated area (FK)
- `unit_type`: Unit type
- `price_type`: Type of price (rent, sale)
- `price`: Price amount
- `currency`: Currency code
- `period`: Time period
- `source`: Data source

**Indexes**:
- Primary key on `id`
- Foreign key indexes on `product_id`, `area_id`
- Index on `unit_type`
- Index on `price_type`
- Index on `period`

## New Intelligence Tables

### 6. demographics
**Purpose**: Population and demographic data per estate
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `population`: Total population
- `age_groups`: JSONB age group distribution
- `income_levels`: JSONB income level distribution
- `geometry`: PostGIS POINT geometry

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- GIST index on `geometry` (spatial)

### 7. service_providers
**Purpose**: Competitive service providers
**Key Fields**:
- `id`: Primary key
- `name`: Provider name
- `service_type`: Type of service
- `coverage_area`: PostGIS geometry for coverage
- `market_share`: Market share percentage
- `status`: Provider status

**Indexes**:
- Primary key on `id`
- Index on `service_type`
- Index on `status`
- GIST index on `coverage_area` (spatial)

### 8. provider_coverage
**Purpose**: Service provider presence per estate
**Key Fields**:
- `id`: Primary key
- `provider_id`: Associated provider (FK)
- `estate_id`: Associated estate (FK)
- `coverage_status`: Coverage status
- `quality_metrics`: JSONB quality metrics

**Indexes**:
- Primary key on `id`
- Foreign key indexes on `provider_id`, `estate_id`
- Index on `coverage_status`
- GIN index on `quality_metrics` (JSONB)

### 9. service_offerings
**Purpose**: Plans, pricing, and service details
**Key Fields**:
- `id`: Primary key
- `provider_id`: Associated provider (FK)
- `plan_name`: Plan name
- `pricing`: JSONB pricing structure
- `features`: JSONB feature list

**Indexes**:
- Primary key on `id`
- Foreign key index on `provider_id`
- Index on `plan_name`
- GIN indexes on `pricing`, `features` (JSONB)

### 10. market_share_data
**Purpose**: Competitive positioning and market share
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `provider_id`: Associated provider (FK)
- `market_share`: Market share percentage
- `period`: Time period

**Indexes**:
- Primary key on `id`
- Foreign key indexes on `estate_id`, `provider_id`
- Compound index on `(estate_id, period)`
- Index on `market_share`

### 11. local_businesses
**Purpose**: Restaurants, shops, companies, services
**Key Fields**:
- `id`: Primary key
- `name`: Business name
- `category_id`: Business category (FK)
- `estate_id`: Associated estate (FK)
- `business_type`: Type of business
- `status`: Business status

**Indexes**:
- Primary key on `id`
- Foreign key indexes on `category_id`, `estate_id`
- Index on `business_type`
- Index on `status`
- Full-text search index on `name`

### 12. business_categories
**Purpose**: Classification system for business types
**Key Fields**:
- `id`: Primary key
- `name`: Category name
- `description`: Category description
- `parent_category_id`: Parent category (self-referencing FK)

**Indexes**:
- Primary key on `id`
- Foreign key index on `parent_category_id`
- Index on `name`

### 13. business_metadata
**Purpose**: JSON field for business characteristics
**Key Fields**:
- `id`: Primary key
- `business_id`: Associated business (FK)
- `metadata_type`: Type of metadata
- `metadata_key`: Metadata key
- `metadata_value`: JSONB metadata value

**Indexes**:
- Primary key on `id`
- Foreign key index on `business_id`
- Index on `metadata_type`
- GIN index on `metadata_value` (JSONB)

### 14. customer_profiles
**Purpose**: Enhanced customer data with lifestyle indicators
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `demographics`: JSONB demographic data
- `lifestyle_indicators`: JSONB lifestyle data
- `status`: Customer status

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `status`
- GIN indexes on `demographics`, `lifestyle_indicators` (JSONB)

### 15. usage_patterns
**Purpose**: Internet usage, service adoption, behavior data
**Key Fields**:
- `id`: Primary key
- `customer_id`: Associated customer (FK)
- `service_type`: Type of service
- `usage_metrics`: JSONB usage data
- `period`: Time period

**Indexes**:
- Primary key on `id`
- Foreign key index on `customer_id`
- Index on `service_type`
- Compound index on `(customer_id, period)`
- GIN index on `usage_metrics` (JSONB)

### 16. customer_feedback
**Purpose**: Reviews, complaints, satisfaction metrics
**Key Fields**:
- `id`: Primary key
- `customer_id`: Associated customer (FK)
- `service_type`: Type of service
- `rating`: Satisfaction rating (1-5)
- `feedback_text`: Feedback text content

**Indexes**:
- Primary key on `id`
- Foreign key index on `customer_id`
- Index on `service_type`
- Index on `rating`
- Full-text search index on `feedback_text`

### 17. cross_service_adoption
**Purpose**: Usage across different service offerings
**Key Fields**:
- `id`: Primary key
- `customer_id`: Associated customer (FK)
- `service_type`: Type of service
- `adoption_status`: Adoption status
- `adoption_date`: Date of adoption

**Indexes**:
- Primary key on `id`
- Foreign key index on `customer_id`
- Index on `service_type`
- Index on `adoption_status`

### 18. network_infrastructure
**Purpose**: Fiber, towers, coverage quality
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `infrastructure_type`: Type of infrastructure
- `coverage_quality`: Coverage quality rating
- `capacity`: Capacity metrics

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `infrastructure_type`
- Index on `coverage_quality`

### 19. capacity_metrics
**Purpose**: Network utilization and performance data
**Key Fields**:
- `id`: Primary key
- `infrastructure_id`: Associated infrastructure (FK)
- `utilization_rate`: Utilization percentage
- `performance_metrics`: JSONB performance data

**Indexes**:
- Primary key on `id`
- Foreign key index on `infrastructure_id`
- Index on `utilization_rate`
- GIN index on `performance_metrics` (JSONB)

### 20. infrastructure_investments
**Purpose**: Investment tracking and ROI data
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `investment_type`: Type of investment
- `amount`: Investment amount
- `roi_metrics`: JSONB ROI data

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `investment_type`
- Index on `amount`
- GIN index on `roi_metrics` (JSONB)

### 21. revenue_analytics
**Purpose**: Revenue performance per estate/area
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `revenue_type`: Type of revenue
- `amount`: Revenue amount
- `period`: Time period

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `revenue_type`
- Index on `period`

### 22. investment_tracking
**Purpose**: Capital expenditure and returns
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `investment_type`: Type of investment
- `amount`: Investment amount
- `expected_roi`: Expected ROI percentage

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `investment_type`
- Index on `amount`
- Index on `expected_roi`

### 23. market_opportunities
**Purpose**: Identified opportunities and their potential
**Key Fields**:
- `id`: Primary key
- `estate_id`: Associated estate (FK)
- `opportunity_type`: Type of opportunity
- `potential_value`: Potential value
- `risk_assessment`: JSONB risk data

**Indexes**:
- Primary key on `id`
- Foreign key index on `estate_id`
- Index on `opportunity_type`
- Index on `potential_value`
- GIN index on `risk_assessment` (JSONB)

## Data Types and Constraints

### JSONB Fields
- `estates.metadata`: Estate-specific metadata
- `products.features`: Product feature specifications
- `demographics.age_groups`: Age distribution data
- `demographics.income_levels`: Income level distribution
- `customer_profiles.lifestyle_indicators`: Lifestyle data
- `usage_patterns.usage_metrics`: Usage statistics
- `business_metadata.metadata_value`: Business characteristics
- `capacity_metrics.performance_metrics`: Performance data
- `infrastructure_investments.roi_metrics`: ROI calculations
- `market_opportunities.risk_assessment`: Risk analysis

### Geospatial Fields
- `areas.geometry`: Area coordinates (POINT)
- `demographics.geometry`: Estate coordinates (POINT)
- `service_providers.coverage_area`: Coverage area geometry

### Validation Constraints
- Estate tier classification: Must be 'platinum', 'gold', 'silver', or 'bronze'
- Market share percentages: Must be between 0 and 100
- Rating values: Must be between 1 and 5
- Population density: Must be positive
- Economic activity score: Must be between 1 and 100

## Performance Considerations

### Indexing Strategy
- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Indexed for join performance
- **JSONB Fields**: GIN indexes for efficient JSON queries
- **Geospatial Fields**: GIST indexes for spatial queries
- **Compound Indexes**: Multi-column indexes for common query patterns
- **Partial Indexes**: Filtered indexes for active/active data

### Query Optimization
- Materialized views for complex analytical queries
- Full-text search indexes for text-based searches
- Spatial indexes for location-based queries
- JSON path indexes for metadata searches
