-- Create market intelligence tables for competitive analysis
-- These tables support competitive intelligence and market share analysis

-- Service providers table
CREATE TABLE service_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'internet', 'fintech', 'delivery', 'money_transfer'
    coverage_area GEOMETRY(POLYGON, 4326),
    market_share DECIMAL(5,2) CHECK (market_share >= 0 AND market_share <= 100),
    service_quality_rating DECIMAL(3,2) CHECK (service_quality_rating >= 0 AND service_quality_rating <= 5),
    pricing_strategy VARCHAR(50), -- 'premium', 'competitive', 'budget'
    technology_stack JSONB, -- {"fiber": true, "5g": false, "lte": true}
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Provider coverage table
CREATE TABLE provider_coverage (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    coverage_status VARCHAR(50) NOT NULL CHECK (coverage_status IN ('active', 'planned', 'discontinued')),
    quality_metrics JSONB, -- {"speed": "100mbps", "reliability": 95, "uptime": 99.9}
    coverage_start_date DATE,
    coverage_end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, estate_id)
);

-- Service offerings table
CREATE TABLE service_offerings (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    pricing DECIMAL(10,2) NOT NULL CHECK (pricing >= 0),
    currency VARCHAR(3) DEFAULT 'NGN',
    features JSONB, -- {"speed": "100mbps", "data_cap": "unlimited", "contract": "12_months"}
    service_tier VARCHAR(50), -- 'basic', 'standard', 'premium', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Market share data table
CREATE TABLE market_share_data (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    market_share DECIMAL(5,2) NOT NULL CHECK (market_share >= 0 AND market_share <= 100),
    customer_count INTEGER CHECK (customer_count >= 0),
    period DATE NOT NULL,
    data_source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estate_id, provider_id, period)
);

-- Add indexes for market intelligence tables
CREATE INDEX idx_service_providers_service_type ON service_providers(service_type);
CREATE INDEX idx_service_providers_coverage_area ON service_providers USING GIST(coverage_area);
CREATE INDEX idx_service_providers_market_share ON service_providers(market_share);
CREATE INDEX idx_service_providers_technology_stack_gin ON service_providers USING GIN(technology_stack);

CREATE INDEX idx_provider_coverage_provider_id ON provider_coverage(provider_id);
CREATE INDEX idx_provider_coverage_estate_id ON provider_coverage(estate_id);
CREATE INDEX idx_provider_coverage_status ON provider_coverage(coverage_status);
CREATE INDEX idx_provider_coverage_quality_metrics_gin ON provider_coverage USING GIN(quality_metrics);

CREATE INDEX idx_service_offerings_provider_id ON service_offerings(provider_id);
CREATE INDEX idx_service_offerings_service_tier ON service_offerings(service_tier);
CREATE INDEX idx_service_offerings_pricing ON service_offerings(pricing);
CREATE INDEX idx_service_offerings_features_gin ON service_offerings USING GIN(features);

CREATE INDEX idx_market_share_data_estate_id ON market_share_data(estate_id);
CREATE INDEX idx_market_share_data_provider_id ON market_share_data(provider_id);
CREATE INDEX idx_market_share_data_period ON market_share_data(period);
CREATE INDEX idx_market_share_data_estate_provider_period ON market_share_data(estate_id, provider_id, period);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_market_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_providers_updated_at_trigger
    BEFORE UPDATE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();

CREATE TRIGGER provider_coverage_updated_at_trigger
    BEFORE UPDATE ON provider_coverage
    FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();

CREATE TRIGGER service_offerings_updated_at_trigger
    BEFORE UPDATE ON service_offerings
    FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();

CREATE TRIGGER market_share_data_updated_at_trigger
    BEFORE UPDATE ON market_share_data
    FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
