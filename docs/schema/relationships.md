# Database Relationships Documentation

## Overview

This document provides comprehensive documentation for all foreign key relationships, constraints, and data integrity rules in the Market Intelligence Database Management System.

## Core Relationships

### 1. Estate & Geographic Intelligence

#### estates → areas
- **Relationship**: `estates.area_id` → `areas.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links estates to their geographic areas
- **Cascade**: RESTRICT (cannot delete area with existing estates)

#### estates → products
- **Relationship**: `estates.product_id` → `products.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links estates to their primary internet product
- **Cascade**: RESTRICT (cannot delete product with existing estates)

#### demographics → estates
- **Relationship**: `demographics.estate_id` → `estates.id`
- **Type**: One-to-One
- **Constraint**: NOT NULL, UNIQUE
- **Purpose**: Links demographic data to specific estates
- **Cascade**: CASCADE (delete demographics when estate is deleted)

### 2. Market & Competitive Intelligence

#### provider_coverage → service_providers
- **Relationship**: `provider_coverage.provider_id` → `service_providers.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links coverage records to service providers
- **Cascade**: CASCADE (delete coverage when provider is deleted)

#### provider_coverage → estates
- **Relationship**: `provider_coverage.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links coverage records to specific estates
- **Cascade**: CASCADE (delete coverage when estate is deleted)

#### service_offerings → service_providers
- **Relationship**: `service_offerings.provider_id` → `service_providers.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links service offerings to providers
- **Cascade**: CASCADE (delete offerings when provider is deleted)

#### market_share_data → estates
- **Relationship**: `market_share_data.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links market share data to estates
- **Cascade**: CASCADE (delete market share data when estate is deleted)

#### market_share_data → service_providers
- **Relationship**: `market_share_data.provider_id` → `service_providers.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links market share data to providers
- **Cascade**: CASCADE (delete market share data when provider is deleted)

### 3. Business Ecosystem Intelligence

#### local_businesses → business_categories
- **Relationship**: `local_businesses.category_id` → `business_categories.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links businesses to their categories
- **Cascade**: RESTRICT (cannot delete category with existing businesses)

#### local_businesses → estates
- **Relationship**: `local_businesses.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links businesses to their estate locations
- **Cascade**: CASCADE (delete businesses when estate is deleted)

#### business_categories → business_categories (Self-Referencing)
- **Relationship**: `business_categories.parent_category_id` → `business_categories.id`
- **Type**: Many-to-One (Hierarchical)
- **Constraint**: NULL (optional)
- **Purpose**: Creates hierarchical category structure
- **Cascade**: RESTRICT (cannot delete parent category with existing children)

#### business_metadata → local_businesses
- **Relationship**: `business_metadata.business_id` → `local_businesses.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links metadata to specific businesses
- **Cascade**: CASCADE (delete metadata when business is deleted)

### 4. Customer & Usage Intelligence

#### customer_profiles → estates
- **Relationship**: `customer_profiles.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links customers to their estate locations
- **Cascade**: CASCADE (delete customers when estate is deleted)

#### usage_patterns → customer_profiles
- **Relationship**: `usage_patterns.customer_id` → `customer_profiles.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links usage patterns to specific customers
- **Cascade**: CASCADE (delete usage patterns when customer is deleted)

#### customer_feedback → customer_profiles
- **Relationship**: `customer_feedback.customer_id` → `customer_profiles.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links feedback to specific customers
- **Cascade**: CASCADE (delete feedback when customer is deleted)

#### cross_service_adoption → customer_profiles
- **Relationship**: `cross_service_adoption.customer_id` → `customer_profiles.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links service adoption to specific customers
- **Cascade**: CASCADE (delete adoption records when customer is deleted)

### 5. Infrastructure & Network Intelligence

#### network_infrastructure → estates
- **Relationship**: `network_infrastructure.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links infrastructure to specific estates
- **Cascade**: CASCADE (delete infrastructure when estate is deleted)

#### capacity_metrics → network_infrastructure
- **Relationship**: `capacity_metrics.infrastructure_id` → `network_infrastructure.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links capacity metrics to infrastructure
- **Cascade**: CASCADE (delete metrics when infrastructure is deleted)

#### infrastructure_investments → estates
- **Relationship**: `infrastructure_investments.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links investments to specific estates
- **Cascade**: CASCADE (delete investments when estate is deleted)

### 6. Financial & Performance Intelligence

#### revenue_analytics → estates
- **Relationship**: `revenue_analytics.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links revenue data to specific estates
- **Cascade**: CASCADE (delete revenue data when estate is deleted)

#### investment_tracking → estates
- **Relationship**: `investment_tracking.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links investment tracking to specific estates
- **Cascade**: CASCADE (delete tracking when estate is deleted)

#### market_opportunities → estates
- **Relationship**: `market_opportunities.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links opportunities to specific estates
- **Cascade**: CASCADE (delete opportunities when estate is deleted)

### 7. Estate Unit Relationships

#### estate_units → estates
- **Relationship**: `estate_units.estate_id` → `estates.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links individual units to their estates
- **Cascade**: CASCADE (delete units when estate is deleted)

### 8. Price Trend Relationships

#### price_trends → products
- **Relationship**: `price_trends.product_id` → `products.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links price trends to specific products
- **Cascade**: CASCADE (delete trends when product is deleted)

#### price_trends → areas
- **Relationship**: `price_trends.area_id` → `areas.id`
- **Type**: Many-to-One
- **Constraint**: NOT NULL
- **Purpose**: Links price trends to specific areas
- **Cascade**: CASCADE (delete trends when area is deleted)

## Data Integrity Rules

### 1. Referential Integrity
- All foreign key relationships enforce referential integrity
- Cascade rules ensure data consistency when parent records are deleted
- RESTRICT rules prevent deletion of referenced records

### 2. Business Rules
- **Estate Tier Classification**: Must be one of: 'platinum', 'gold', 'silver', 'bronze'
- **Market Share**: Must be between 0 and 100 percent
- **Customer Ratings**: Must be between 1 and 5
- **Population Density**: Must be positive numbers
- **Economic Activity Score**: Must be between 1 and 100

### 3. Unique Constraints
- **estates**: Each estate can have only one demographic profile
- **areas**: Geographic codes must be unique
- **products**: Product slugs must be unique
- **business_categories**: Category names must be unique within the same parent

### 4. Not Null Constraints
- All primary keys are NOT NULL
- All foreign keys are NOT NULL (except hierarchical self-references)
- Critical business fields (names, types, statuses) are NOT NULL

## Cascade Rules

### CASCADE Delete
- **Customer-related**: Delete customer profiles, usage patterns, feedback, and adoption records
- **Infrastructure-related**: Delete infrastructure, capacity metrics, and investments
- **Financial-related**: Delete revenue analytics, investment tracking, and opportunities
- **Market-related**: Delete coverage, offerings, and market share data
- **Business-related**: Delete business metadata and local businesses

### RESTRICT Delete
- **Areas**: Cannot delete areas with existing estates
- **Products**: Cannot delete products with existing estates
- **Categories**: Cannot delete business categories with existing businesses
- **Service Providers**: Cannot delete providers with existing coverage or offerings

### SET NULL (Not Used)
- No foreign keys use SET NULL cascade rules
- All relationships maintain strict referential integrity

## Relationship Cardinality Summary

| Table | One-to-One | One-to-Many | Many-to-Many |
|-------|------------|-------------|---------------|
| estates | demographics | estate_units, customer_profiles, network_infrastructure, infrastructure_investments, revenue_analytics, investment_tracking, market_opportunities | provider_coverage, market_share_data, local_businesses |
| areas | - | estates, price_trends | - |
| products | - | estates, price_trends | - |
| service_providers | - | provider_coverage, service_offerings, market_share_data | - |
| business_categories | - | local_businesses | - |
| customer_profiles | - | usage_patterns, customer_feedback, cross_service_adoption | - |
| network_infrastructure | - | capacity_metrics | - |

## Performance Considerations

### 1. Join Optimization
- All foreign key relationships are indexed for optimal join performance
- Compound indexes support multi-table joins efficiently
- Spatial indexes optimize location-based queries

### 2. Cascade Performance
- CASCADE operations are optimized for bulk deletions
- RESTRICT operations use efficient constraint checking
- Foreign key indexes prevent performance degradation during constraint validation

### 3. Data Consistency
- Transaction-based operations ensure referential integrity
- Constraint validation occurs at the database level
- Application-level validation provides additional data quality checks

## Maintenance and Monitoring

### 1. Constraint Monitoring
- Regular checks for orphaned records
- Validation of cascade rule effectiveness
- Performance monitoring of foreign key operations

### 2. Data Quality
- Automated checks for data consistency
- Validation of business rule compliance
- Monitoring of relationship integrity

### 3. Performance Tuning
- Regular analysis of join performance
- Optimization of frequently used relationships
- Index maintenance for foreign key fields
