-- Create business ecosystem tables for local businesses and services
-- These tables support business ecosystem intelligence and lifestyle analytics

-- Business categories table
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES business_categories(id),
    business_type VARCHAR(100), -- 'restaurant', 'retail', 'service', 'entertainment'
    target_demographic VARCHAR(100), -- 'youth', 'family', 'business', 'luxury'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Local businesses table
CREATE TABLE local_businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES business_categories(id) ON DELETE CASCADE,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    business_type VARCHAR(100) NOT NULL,
    address TEXT,
    contact_info JSONB, -- {"phone": "+234...", "email": "...", "website": "..."}
    operating_hours JSONB, -- {"monday": "9-5", "tuesday": "9-5", ...}
    price_range VARCHAR(20), -- 'budget', 'moderate', 'expensive', 'luxury'
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Business metadata table for flexible business characteristics
CREATE TABLE business_metadata (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
    metadata_type VARCHAR(100) NOT NULL, -- 'amenities', 'specialties', 'promotions'
    metadata_key VARCHAR(255) NOT NULL,
    metadata_value JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for business ecosystem tables
CREATE INDEX idx_business_categories_parent_id ON business_categories(parent_category_id);
CREATE INDEX idx_business_categories_business_type ON business_categories(business_type);
CREATE INDEX idx_business_categories_target_demographic ON business_categories(target_demographic);

CREATE INDEX idx_local_businesses_category_id ON local_businesses(category_id);
CREATE INDEX idx_local_businesses_estate_id ON local_businesses(estate_id);
CREATE INDEX idx_local_businesses_business_type ON local_businesses(business_type);
CREATE INDEX idx_local_businesses_price_range ON local_businesses(price_range);
CREATE INDEX idx_local_businesses_rating ON local_businesses(rating);
CREATE INDEX idx_local_businesses_contact_info_gin ON local_businesses USING GIN(contact_info);
CREATE INDEX idx_local_businesses_operating_hours_gin ON local_businesses USING GIN(operating_hours);

CREATE INDEX idx_business_metadata_business_id ON business_metadata(business_id);
CREATE INDEX idx_business_metadata_type ON business_metadata(metadata_type);
CREATE INDEX idx_business_metadata_key ON business_metadata(metadata_key);
CREATE INDEX idx_business_metadata_value_gin ON business_metadata USING GIN(metadata_value);

-- Add full-text search indexes for business names
CREATE INDEX idx_local_businesses_name_trgm ON local_businesses USING GIN(name gin_trgm_ops);
CREATE INDEX idx_business_categories_name_trgm ON business_categories USING GIN(name gin_trgm_ops);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_business_ecosystem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_categories_updated_at_trigger
    BEFORE UPDATE ON business_categories
    FOR EACH ROW EXECUTE FUNCTION update_business_ecosystem_updated_at();

CREATE TRIGGER local_businesses_updated_at_trigger
    BEFORE UPDATE ON local_businesses
    FOR EACH ROW EXECUTE FUNCTION update_business_ecosystem_updated_at();

CREATE TRIGGER business_metadata_updated_at_trigger
    BEFORE UPDATE ON business_metadata
    FOR EACH ROW EXECUTE FUNCTION update_business_ecosystem_updated_at();
