-- Enhance existing tables with new fields for requirements v2
-- This migration adds tier classification, metadata, and geospatial support

-- Enhance estates table with tier classification and metadata
ALTER TABLE estates ADD COLUMN IF NOT EXISTS tier_classification VARCHAR(20) CHECK (tier_classification IN ('platinum', 'gold', 'silver', 'bronze'));

-- You can do it like this 
ALTER TABLE estates ADD COLUMN IF NOT EXISTS metadata JSONB;
-- or
-- CREATE TABLE estate_metadata (
--     id SERIAL PRIMARY KEY,
--     estate_id INTEGER REFERENCES estates(id),
--     metadata_type VARCHAR(100),
--     metadata_key VARCHAR(255),
--     metadata_value JSONB,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

ALTER TABLE estates ADD COLUMN IF NOT EXISTS market_potential_score DECIMAL(5,2);
ALTER TABLE estates ADD COLUMN IF NOT EXISTS competitive_intensity INTEGER;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_estates_tier_classification ON estates(tier_classification);
CREATE INDEX IF NOT EXISTS idx_estates_metadata_gin ON estates USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_estates_market_potential ON estates(market_potential_score);

-- Enhance areas table with geospatial support
ALTER TABLE areas ADD COLUMN IF NOT EXISTS geometry GEOMETRY(POINT, 4326);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS population_density DECIMAL(10,2);
ALTER TABLE areas ADD COLUMN IF NOT EXISTS economic_activity_score INTEGER;

-- Add spatial index for areas
CREATE INDEX IF NOT EXISTS idx_areas_geometry ON areas USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_areas_population_density ON areas(population_density);

-- Enhance products table for service offerings
ALTER TABLE products ADD COLUMN IF NOT EXISTS service_category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS features JSONB;

-- Add indexes for new product fields
CREATE INDEX IF NOT EXISTS idx_products_service_category ON products(service_category);
CREATE INDEX IF NOT EXISTS idx_products_features_gin ON products USING GIN(features);

-- Add compound indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_estates_tier_area ON estates(tier_classification, area_id);
CREATE INDEX IF NOT EXISTS idx_estates_classification_type ON estates(classification, estate_type, occupancy_status);
