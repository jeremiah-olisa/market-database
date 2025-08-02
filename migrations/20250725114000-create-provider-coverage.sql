-- Create provider coverage table for tracking service provider presence per estate
-- This table maps service provider coverage and quality across different estates

CREATE TABLE provider_coverage (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Coverage status and availability
    coverage_status VARCHAR(50) NOT NULL DEFAULT 'not_covered',
    -- Examples: 'full_coverage', 'partial_coverage', 'planned', 'not_covered'
    
    coverage_percentage DECIMAL(5,2) DEFAULT 0 
    CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    
    service_availability JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"internet": true, "voice": false, "mobile": true, "support": true}
    
    -- Quality metrics and performance indicators
    quality_metrics JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"speed": 85, "latency": 15, "uptime": 99.5, "packet_loss": 0.1}
    
    service_quality_score INTEGER CHECK (service_quality_score >= 1 AND service_quality_score <= 5),
    reliability_score INTEGER CHECK (reliability_score >= 1 AND reliability_score <= 5),
    
    -- Network and infrastructure details
    infrastructure_type VARCHAR(100),
    -- Examples: 'fiber', 'wireless', 'hybrid', 'satellite', 'copper'
    
    connection_capacity VARCHAR(100),
    -- Examples: '1gbps', '100mbps', '50mbps', 'variable'
    
    infrastructure_age_years INTEGER CHECK (infrastructure_age_years >= 0),
    last_infrastructure_upgrade TIMESTAMP,
    
    -- Customer metrics in this estate
    estimated_customer_count INTEGER DEFAULT 0 CHECK (estimated_customer_count >= 0),
    customer_penetration_rate DECIMAL(5,2) 
    CHECK (customer_penetration_rate >= 0 AND customer_penetration_rate <= 100),
    
    customer_satisfaction_rating DECIMAL(3,2) 
    CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    
    churn_rate DECIMAL(5,2) CHECK (churn_rate >= 0 AND churn_rate <= 100),
    
    -- Competitive positioning in this estate
    market_share_percentage DECIMAL(5,2) DEFAULT 0 
    CHECK (market_share_percentage >= 0 AND market_share_percentage <= 100),
    
    competitive_ranking INTEGER CHECK (competitive_ranking >= 1),
    -- 1 = market leader in this estate, 2 = second place, etc.
    
    -- Pricing and offerings
    pricing_strategy VARCHAR(50),
    -- Examples: 'premium', 'competitive', 'budget', 'penetration', 'value'
    
    service_packages JSONB DEFAULT '[]'::JSONB,
    -- Examples: [{"name": "basic", "price": 15000, "speed": "25mbps"}, {"name": "premium", "price": 30000, "speed": "100mbps"}]
    
    promotional_offers JSONB DEFAULT '[]'::JSONB,
    special_pricing JSONB DEFAULT '{}'::JSONB,
    
    -- Service delivery and support
    installation_timeframe VARCHAR(100),
    -- Examples: 'same_day', '1_3_days', '1_week', '2_weeks', 'on_demand'
    
    support_presence VARCHAR(50),
    -- Examples: 'local_office', 'regional_support', 'remote_only', 'partner_support'
    
    maintenance_frequency VARCHAR(100),
    response_time_sla VARCHAR(100),
    
    -- Operational and strategic information
    entry_date DATE,
    expansion_plans JSONB DEFAULT '{}'::JSONB,
    investment_level VARCHAR(50),
    -- Examples: 'low', 'medium', 'high', 'strategic'
    
    -- Regulatory and compliance
    operating_licenses JSONB DEFAULT '[]'::JSONB,
    compliance_status VARCHAR(100),
    regulatory_issues JSONB DEFAULT '[]'::JSONB,
    
    -- Intelligence and data quality
    data_source VARCHAR(100),
    data_confidence_level INTEGER CHECK (data_confidence_level >= 1 AND data_confidence_level <= 5),
    last_survey_date TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient coverage queries
CREATE INDEX idx_provider_coverage_provider_id ON provider_coverage(provider_id);
CREATE INDEX idx_provider_coverage_estate_id ON provider_coverage(estate_id);
CREATE INDEX idx_provider_coverage_status ON provider_coverage(coverage_status);
CREATE INDEX idx_provider_coverage_percentage ON provider_coverage(coverage_percentage);
CREATE INDEX idx_provider_coverage_quality_score ON provider_coverage(service_quality_score);
CREATE INDEX idx_provider_coverage_market_share ON provider_coverage(market_share_percentage);
CREATE INDEX idx_provider_coverage_competitive_ranking ON provider_coverage(competitive_ranking);
CREATE INDEX idx_provider_coverage_customer_satisfaction ON provider_coverage(customer_satisfaction_rating);
CREATE INDEX idx_provider_coverage_penetration_rate ON provider_coverage(customer_penetration_rate);
CREATE INDEX idx_provider_coverage_entry_date ON provider_coverage(entry_date);
CREATE INDEX idx_provider_coverage_last_survey ON provider_coverage(last_survey_date);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_provider_coverage_availability ON provider_coverage USING GIN(service_availability);
CREATE INDEX idx_provider_coverage_quality_metrics ON provider_coverage USING GIN(quality_metrics);
CREATE INDEX idx_provider_coverage_packages ON provider_coverage USING GIN(service_packages);
CREATE INDEX idx_provider_coverage_offers ON provider_coverage USING GIN(promotional_offers);
CREATE INDEX idx_provider_coverage_expansion ON provider_coverage USING GIN(expansion_plans);
CREATE INDEX idx_provider_coverage_licenses ON provider_coverage USING GIN(operating_licenses);

-- Create compound indexes for common query patterns
CREATE INDEX idx_provider_coverage_provider_estate ON provider_coverage(provider_id, estate_id);
CREATE INDEX idx_provider_coverage_estate_status ON provider_coverage(estate_id, coverage_status);
CREATE INDEX idx_provider_coverage_estate_ranking ON provider_coverage(estate_id, competitive_ranking);
CREATE INDEX idx_provider_coverage_provider_share ON provider_coverage(provider_id, market_share_percentage);
CREATE INDEX idx_provider_coverage_quality_share ON provider_coverage(service_quality_score, market_share_percentage);

-- Create unique constraint to prevent duplicate coverage entries
CREATE UNIQUE INDEX idx_provider_coverage_unique 
ON provider_coverage(provider_id, estate_id);

-- Add constraint for market share percentage validation
ALTER TABLE provider_coverage ADD CONSTRAINT check_market_share 
CHECK (market_share_percentage >= 0 AND market_share_percentage <= 100);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_provider_coverage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_coverage_updated_at_trigger
    BEFORE UPDATE ON provider_coverage
    FOR EACH ROW EXECUTE FUNCTION update_provider_coverage_updated_at();