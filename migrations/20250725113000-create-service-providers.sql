-- Create service providers table for competitive landscape analysis
-- This table tracks competitors and their market presence

CREATE TABLE service_providers (
    id SERIAL PRIMARY KEY,
    
    -- Basic provider information
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    brand_name VARCHAR(255),
    
    -- Service categorization
    service_type VARCHAR(100) NOT NULL,
    -- Examples: 'internet', 'fintech', 'delivery', 'telecommunications', 'banking'
    
    primary_services JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["fiber_internet", "mobile_data", "voice_calls"]
    
    secondary_services JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["technical_support", "equipment_rental", "installation"]
    
    -- Market positioning and size
    market_segment VARCHAR(50),
    -- Examples: 'enterprise', 'residential', 'sme', 'government', 'mixed'
    
    company_size VARCHAR(50),
    -- Examples: 'startup', 'small', 'medium', 'large', 'multinational'
    
    market_share_estimate DECIMAL(5,2) CHECK (market_share_estimate >= 0 AND market_share_estimate <= 100),
    
    -- Geographic coverage and operations
    coverage_area GEOMETRY(MULTIPOLYGON, 4326),
    operational_states JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["fcr", "lagos", "rivers", "kano"]
    
    headquarters_location VARCHAR(255),
    regional_offices JSONB DEFAULT '[]'::JSONB,
    
    -- Financial and business metrics
    annual_revenue_estimate DECIMAL(15,2),
    customer_base_estimate INTEGER,
    employee_count_estimate INTEGER,
    
    years_in_operation INTEGER CHECK (years_in_operation >= 0),
    founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    
    -- Competitive intelligence
    competitive_strengths JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["wide_coverage", "competitive_pricing", "excellent_support", "innovative_products"]
    
    competitive_weaknesses JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["limited_coverage", "poor_support", "outdated_technology", "high_pricing"]
    
    key_differentiators JSONB DEFAULT '[]'::JSONB,
    market_strategy JSONB DEFAULT '{}'::JSONB,
    
    -- Technology and infrastructure
    technology_stack JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"network": "fiber", "core": "cisco", "billing": "custom", "customer_portal": "proprietary"}
    
    infrastructure_quality_score INTEGER CHECK (infrastructure_quality_score >= 1 AND infrastructure_quality_score <= 5),
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 5),
    
    -- Customer and service metrics
    customer_satisfaction_rating DECIMAL(3,2) CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    service_quality_score INTEGER CHECK (service_quality_score >= 1 AND service_quality_score <= 5),
    
    support_quality_rating DECIMAL(3,2) CHECK (support_quality_rating >= 1 AND support_quality_rating <= 5),
    response_time_score INTEGER CHECK (response_time_score >= 1 AND response_time_score <= 5),
    
    -- Regulatory and compliance
    regulatory_status VARCHAR(100),
    licenses_held JSONB DEFAULT '[]'::JSONB,
    compliance_issues JSONB DEFAULT '[]'::JSONB,
    
    -- Partnership and relationships
    key_partners JSONB DEFAULT '[]'::JSONB,
    vendor_relationships JSONB DEFAULT '[]'::JSONB,
    
    -- Threat assessment
    threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    competitive_threat_score INTEGER CHECK (competitive_threat_score >= 1 AND competitive_threat_score <= 5),
    
    -- Data source and intelligence gathering
    data_source VARCHAR(100),
    intelligence_confidence_level INTEGER CHECK (intelligence_confidence_level >= 1 AND intelligence_confidence_level <= 5),
    last_intelligence_update TIMESTAMP,
    
    -- Status and operational state
    operational_status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'active', 'inactive', 'acquired', 'merged', 'discontinued'
    
    business_model VARCHAR(100),
    -- Examples: 'b2c', 'b2b', 'b2g', 'marketplace', 'hybrid'
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient provider queries
CREATE INDEX idx_service_providers_name ON service_providers(name);
CREATE INDEX idx_service_providers_service_type ON service_providers(service_type);
CREATE INDEX idx_service_providers_market_segment ON service_providers(market_segment);
CREATE INDEX idx_service_providers_company_size ON service_providers(company_size);
CREATE INDEX idx_service_providers_market_share ON service_providers(market_share_estimate);
CREATE INDEX idx_service_providers_threat_level ON service_providers(threat_level);
CREATE INDEX idx_service_providers_competitive_threat ON service_providers(competitive_threat_score);
CREATE INDEX idx_service_providers_operational_status ON service_providers(operational_status);
CREATE INDEX idx_service_providers_customer_satisfaction ON service_providers(customer_satisfaction_rating);
CREATE INDEX idx_service_providers_founded_year ON service_providers(founded_year);
CREATE INDEX idx_service_providers_last_update ON service_providers(last_intelligence_update);

-- Create spatial index for coverage area
CREATE INDEX idx_service_providers_coverage_area ON service_providers USING GIST(coverage_area);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_service_providers_primary_services ON service_providers USING GIN(primary_services);
CREATE INDEX idx_service_providers_operational_states ON service_providers USING GIN(operational_states);
CREATE INDEX idx_service_providers_strengths ON service_providers USING GIN(competitive_strengths);
CREATE INDEX idx_service_providers_weaknesses ON service_providers USING GIN(competitive_weaknesses);
CREATE INDEX idx_service_providers_differentiators ON service_providers USING GIN(key_differentiators);
CREATE INDEX idx_service_providers_technology ON service_providers USING GIN(technology_stack);
CREATE INDEX idx_service_providers_licenses ON service_providers USING GIN(licenses_held);
CREATE INDEX idx_service_providers_partners ON service_providers USING GIN(key_partners);

-- Create compound indexes for common query patterns
CREATE INDEX idx_service_providers_type_segment ON service_providers(service_type, market_segment);
CREATE INDEX idx_service_providers_threat_share ON service_providers(threat_level, market_share_estimate);
CREATE INDEX idx_service_providers_size_status ON service_providers(company_size, operational_status);

-- Create full-text search index for provider names and descriptions
CREATE INDEX idx_service_providers_fts ON service_providers 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(legal_name, '') || ' ' || COALESCE(brand_name, '')));

-- Create unique constraint for provider names within service type
CREATE UNIQUE INDEX idx_service_providers_unique_name 
ON service_providers(LOWER(name), service_type) 
WHERE operational_status = 'active';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_providers_updated_at_trigger
    BEFORE UPDATE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_service_providers_updated_at();