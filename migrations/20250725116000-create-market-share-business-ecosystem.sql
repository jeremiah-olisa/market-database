-- Create market share data and business ecosystem tables
-- This migration includes competitive positioning and local business intelligence

-- Market Share Data Table
CREATE TABLE market_share_data (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    
    -- Market share metrics
    market_share DECIMAL(5,2) NOT NULL DEFAULT 0 
    CHECK (market_share >= 0 AND market_share <= 100),
    
    customer_count INTEGER DEFAULT 0 CHECK (customer_count >= 0),
    revenue_share DECIMAL(5,2) CHECK (revenue_share >= 0 AND revenue_share <= 100),
    
    -- Period and temporal data
    period DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly',
    -- Examples: 'monthly', 'quarterly', 'annual'
    
    -- Competitive metrics
    market_rank INTEGER CHECK (market_rank >= 1),
    rank_change INTEGER, -- +/- change from previous period
    
    competitive_intensity_score INTEGER CHECK (competitive_intensity_score >= 1 AND competitive_intensity_score <= 5),
    
    -- Growth and performance indicators
    growth_rate DECIMAL(8,4), -- percentage growth from previous period
    customer_acquisition_rate DECIMAL(8,4),
    customer_churn_rate DECIMAL(5,2) CHECK (customer_churn_rate >= 0 AND customer_churn_rate <= 100),
    
    -- Data quality
    data_source VARCHAR(100),
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Categories Table (for hierarchical business classification)
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Hierarchical structure
    parent_category_id INTEGER REFERENCES business_categories(id) ON DELETE SET NULL,
    category_level INTEGER DEFAULT 1 CHECK (category_level >= 1 AND category_level <= 5),
    category_path VARCHAR(500), -- e.g., "retail/food/restaurants"
    
    -- Category characteristics
    business_type VARCHAR(100),
    -- Examples: 'retail', 'service', 'hospitality', 'professional', 'healthcare'
    
    market_relevance_score INTEGER CHECK (market_relevance_score >= 1 AND market_relevance_score <= 5),
    
    -- Economic indicators
    typical_investment_range JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"min": 500000, "max": 2000000, "currency": "NGN"}
    
    employment_potential INTEGER CHECK (employment_potential >= 1 AND employment_potential <= 5),
    
    -- Market characteristics
    target_demographics JSONB DEFAULT '[]'::JSONB,
    seasonality_factors JSONB DEFAULT '{}'::JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Local Businesses Table
CREATE TABLE local_businesses (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES business_categories(id),
    
    -- Business basic information
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    description TEXT,
    
    -- Location and contact
    address TEXT,
    location_coordinates GEOMETRY(POINT, 4326),
    contact_info JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"phone": "+234...", "email": "...", "website": "...", "social_media": {...}}
    
    -- Business characteristics
    business_size VARCHAR(50),
    -- Examples: 'micro', 'small', 'medium', 'large'
    
    employee_count_estimate INTEGER CHECK (employee_count_estimate >= 0),
    annual_revenue_estimate DECIMAL(15,2),
    
    -- Operational information
    operating_hours JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"monday": "09:00-18:00", "tuesday": "09:00-18:00", ...}
    
    services_offered JSONB DEFAULT '[]'::JSONB,
    products_offered JSONB DEFAULT '[]'::JSONB,
    
    -- Market position and reputation
    market_position VARCHAR(50),
    -- Examples: 'established', 'growing', 'struggling', 'new_entrant'
    
    reputation_score INTEGER CHECK (reputation_score >= 1 AND reputation_score <= 5),
    customer_base_estimate INTEGER CHECK (customer_base_estimate >= 0),
    
    -- Economic impact and relationships
    local_economic_impact VARCHAR(50),
    -- Examples: 'major_employer', 'community_anchor', 'niche_service', 'convenience'
    
    supplier_relationships JSONB DEFAULT '[]'::JSONB,
    customer_demographics JSONB DEFAULT '{}'::JSONB,
    
    -- Technology and digital presence
    digital_presence_score INTEGER CHECK (digital_presence_score >= 1 AND digital_presence_score <= 5),
    technology_adoption_level VARCHAR(50),
    
    -- Establishment and lifecycle
    establishment_date DATE,
    business_stage VARCHAR(50),
    -- Examples: 'startup', 'growth', 'mature', 'decline', 'expansion'
    
    -- Regulatory and compliance
    business_registration_status VARCHAR(100),
    licenses_permits JSONB DEFAULT '[]'::JSONB,
    
    -- Data collection and quality
    data_source VARCHAR(100),
    last_surveyed_date TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    
    -- Status
    operational_status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'active', 'temporarily_closed', 'permanently_closed', 'relocated'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Metadata Table
CREATE TABLE business_metadata (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
    
    -- Metadata categorization
    metadata_type VARCHAR(100) NOT NULL,
    -- Examples: 'facilities', 'services', 'equipment', 'certifications', 'partnerships'
    
    metadata_key VARCHAR(255) NOT NULL,
    -- Examples: 'parking_spaces', 'delivery_service', 'pos_system', 'halal_certified'
    
    -- Flexible metadata storage
    metadata_value JSONB NOT NULL,
    -- Examples: {"available": true, "count": 20, "type": "covered"}
    
    -- Validation and quality
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    data_source VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for market_share_data
CREATE INDEX idx_market_share_estate_id ON market_share_data(estate_id);
CREATE INDEX idx_market_share_provider_id ON market_share_data(provider_id);
CREATE INDEX idx_market_share_period ON market_share_data(period);
CREATE INDEX idx_market_share_value ON market_share_data(market_share);
CREATE INDEX idx_market_share_rank ON market_share_data(market_rank);
CREATE UNIQUE INDEX idx_market_share_unique ON market_share_data(estate_id, provider_id, period);

-- Create indexes for business_categories
CREATE INDEX idx_business_categories_parent ON business_categories(parent_category_id);
CREATE INDEX idx_business_categories_type ON business_categories(business_type);
CREATE INDEX idx_business_categories_level ON business_categories(category_level);
CREATE INDEX idx_business_categories_relevance ON business_categories(market_relevance_score);

-- Create indexes for local_businesses
CREATE INDEX idx_local_businesses_estate_id ON local_businesses(estate_id);
CREATE INDEX idx_local_businesses_category_id ON local_businesses(category_id);
CREATE INDEX idx_local_businesses_name ON local_businesses(name);
CREATE INDEX idx_local_businesses_business_type ON local_businesses(business_type);
CREATE INDEX idx_local_businesses_size ON local_businesses(business_size);
CREATE INDEX idx_local_businesses_position ON local_businesses(market_position);
CREATE INDEX idx_local_businesses_reputation ON local_businesses(reputation_score);
CREATE INDEX idx_local_businesses_status ON local_businesses(operational_status);
CREATE INDEX idx_local_businesses_location ON local_businesses USING GIST(location_coordinates);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_local_businesses_contact_gin ON local_businesses USING GIN(contact_info);
CREATE INDEX idx_local_businesses_services_gin ON local_businesses USING GIN(services_offered);
CREATE INDEX idx_local_businesses_hours_gin ON local_businesses USING GIN(operating_hours);

-- Create indexes for business_metadata
CREATE INDEX idx_business_metadata_business_id ON business_metadata(business_id);
CREATE INDEX idx_business_metadata_type ON business_metadata(metadata_type);
CREATE INDEX idx_business_metadata_key ON business_metadata(metadata_key);
CREATE INDEX idx_business_metadata_verified ON business_metadata(is_verified);
CREATE INDEX idx_business_metadata_value_gin ON business_metadata USING GIN(metadata_value);

-- Create full-text search indexes
CREATE INDEX idx_local_businesses_fts ON local_businesses 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add constraints
ALTER TABLE market_share_data ADD CONSTRAINT check_market_share_sum
CHECK (market_share >= 0 AND market_share <= 100);

-- Create unique constraint for business metadata
CREATE UNIQUE INDEX idx_business_metadata_unique 
ON business_metadata(business_id, metadata_type, metadata_key);

-- Create triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER market_share_data_updated_at_trigger
    BEFORE UPDATE ON market_share_data
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER business_categories_updated_at_trigger
    BEFORE UPDATE ON business_categories
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER local_businesses_updated_at_trigger
    BEFORE UPDATE ON local_businesses
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER business_metadata_updated_at_trigger
    BEFORE UPDATE ON business_metadata
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();