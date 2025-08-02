-- Create service offerings table for plans, pricing, and service details
-- This table stores detailed service packages and pricing from each provider

CREATE TABLE service_offerings (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    
    -- Service offering basic information
    plan_name VARCHAR(255) NOT NULL,
    plan_code VARCHAR(100),
    service_category VARCHAR(100) NOT NULL,
    -- Examples: 'internet', 'mobile', 'fintech', 'delivery', 'voice'
    
    -- Pricing structure
    pricing JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Examples: {"monthly": 25000, "setup": 10000, "equipment": 15000, "currency": "NGN"}
    
    billing_cycle VARCHAR(50),
    -- Examples: 'monthly', 'quarterly', 'annual', 'one_time', 'pay_per_use'
    
    price_tier VARCHAR(50),
    -- Examples: 'basic', 'standard', 'premium', 'enterprise', 'custom'
    
    -- Service specifications and features
    features JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"speed": "100mbps", "data_limit": "unlimited", "static_ip": true, "support": "24/7"}
    
    technical_specifications JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"download": 100, "upload": 50, "latency": "<20ms", "uptime_sla": 99.5}
    
    service_limits JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"data_cap": null, "concurrent_users": 10, "bandwidth_burst": true}
    
    -- Target market and availability
    target_segment VARCHAR(100),
    -- Examples: 'residential', 'sme', 'enterprise', 'government', 'mixed'
    
    geographic_availability JSONB DEFAULT '[]'::JSONB,
    -- Array of area IDs or estate IDs where this offering is available
    
    minimum_contract_period INTEGER DEFAULT 0,
    -- Contract period in months
    
    -- Competitive positioning
    competitive_advantages JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["fastest_speed", "best_value", "no_data_cap", "free_installation"]
    
    unique_selling_points JSONB DEFAULT '[]'::JSONB,
    value_proposition TEXT,
    
    -- Operational details
    installation_requirements JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"fiber_ready": true, "power_backup": false, "line_of_sight": false}
    
    equipment_included JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["router", "modem", "cables", "power_adapter"]
    
    support_channels JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["phone", "email", "chat", "social_media", "in_person"]
    
    -- Terms and conditions
    terms_and_conditions JSONB DEFAULT '{}'::JSONB,
    fair_usage_policy JSONB DEFAULT '{}'::JSONB,
    cancellation_policy JSONB DEFAULT '{}'::JSONB,
    
    -- Promotional and marketing
    promotional_status VARCHAR(50) DEFAULT 'standard',
    -- Examples: 'new_launch', 'promotional', 'standard', 'phasing_out', 'discontinued'
    
    marketing_campaigns JSONB DEFAULT '[]'::JSONB,
    seasonal_offers JSONB DEFAULT '[]'::JSONB,
    
    -- Performance and customer metrics
    popularity_score INTEGER CHECK (popularity_score >= 1 AND popularity_score <= 5),
    customer_satisfaction_rating DECIMAL(3,2) CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    market_performance JSONB DEFAULT '{}'::JSONB,
    
    -- Lifecycle and status
    launch_date DATE,
    last_updated_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'active', 'limited', 'discontinued', 'coming_soon'
    
    lifecycle_stage VARCHAR(50),
    -- Examples: 'new', 'growth', 'mature', 'decline'
    
    -- Data quality and intelligence
    data_source VARCHAR(100),
    data_accuracy_score INTEGER CHECK (data_accuracy_score >= 1 AND data_accuracy_score <= 5),
    last_verified_date TIMESTAMP,
    verification_method VARCHAR(100),
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient service offering queries
CREATE INDEX idx_service_offerings_provider_id ON service_offerings(provider_id);
CREATE INDEX idx_service_offerings_plan_name ON service_offerings(plan_name);
CREATE INDEX idx_service_offerings_category ON service_offerings(service_category);
CREATE INDEX idx_service_offerings_price_tier ON service_offerings(price_tier);
CREATE INDEX idx_service_offerings_target_segment ON service_offerings(target_segment);
CREATE INDEX idx_service_offerings_billing_cycle ON service_offerings(billing_cycle);
CREATE INDEX idx_service_offerings_promotional_status ON service_offerings(promotional_status);
CREATE INDEX idx_service_offerings_status ON service_offerings(status);
CREATE INDEX idx_service_offerings_lifecycle_stage ON service_offerings(lifecycle_stage);
CREATE INDEX idx_service_offerings_popularity ON service_offerings(popularity_score);
CREATE INDEX idx_service_offerings_satisfaction ON service_offerings(customer_satisfaction_rating);
CREATE INDEX idx_service_offerings_launch_date ON service_offerings(launch_date);
CREATE INDEX idx_service_offerings_last_verified ON service_offerings(last_verified_date);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_service_offerings_pricing ON service_offerings USING GIN(pricing);
CREATE INDEX idx_service_offerings_features ON service_offerings USING GIN(features);
CREATE INDEX idx_service_offerings_specifications ON service_offerings USING GIN(technical_specifications);
CREATE INDEX idx_service_offerings_availability ON service_offerings USING GIN(geographic_availability);
CREATE INDEX idx_service_offerings_advantages ON service_offerings USING GIN(competitive_advantages);
CREATE INDEX idx_service_offerings_equipment ON service_offerings USING GIN(equipment_included);
CREATE INDEX idx_service_offerings_support_channels ON service_offerings USING GIN(support_channels);
CREATE INDEX idx_service_offerings_campaigns ON service_offerings USING GIN(marketing_campaigns);

-- Create compound indexes for common query patterns
CREATE INDEX idx_service_offerings_provider_category ON service_offerings(provider_id, service_category);
CREATE INDEX idx_service_offerings_category_tier ON service_offerings(service_category, price_tier);
CREATE INDEX idx_service_offerings_segment_status ON service_offerings(target_segment, status);
CREATE INDEX idx_service_offerings_provider_status ON service_offerings(provider_id, status);

-- Create full-text search index for plan names and descriptions
CREATE INDEX idx_service_offerings_fts ON service_offerings 
USING GIN(to_tsvector('english', plan_name || ' ' || COALESCE(value_proposition, '')));

-- Create unique constraint for plan names per provider
CREATE UNIQUE INDEX idx_service_offerings_unique_plan 
ON service_offerings(provider_id, LOWER(plan_name)) 
WHERE status IN ('active', 'limited');

-- Add validation constraints
ALTER TABLE service_offerings ADD CONSTRAINT check_minimum_contract_period 
CHECK (minimum_contract_period >= 0 AND minimum_contract_period <= 60);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_offerings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_updated_date = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_offerings_updated_at_trigger
    BEFORE UPDATE ON service_offerings
    FOR EACH ROW EXECUTE FUNCTION update_service_offerings_updated_at();