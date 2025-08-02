-- Enhance products table for multi-service business model support
-- This migration adds service categorization and flexible feature storage

-- Add service category for multi-service business classification
ALTER TABLE products ADD COLUMN service_category VARCHAR(100);
-- Examples: 'internet', 'fintech', 'delivery', 'money_transfer', 'mailing'

-- Add pricing tier classification
ALTER TABLE products ADD COLUMN pricing_tier VARCHAR(50);
-- Examples: 'basic', 'standard', 'premium', 'enterprise'

-- Add JSONB features field for flexible product characteristics
ALTER TABLE products ADD COLUMN features JSONB DEFAULT '{}'::JSONB;
-- Examples for internet: {"speed": "100mbps", "data_limit": "unlimited", "installation": "free"}
-- Examples for fintech: {"transaction_limit": 500000, "fees": {"transfer": 50, "withdrawal": 25}}

-- Add service delivery and operational fields
ALTER TABLE products ADD COLUMN service_type VARCHAR(50);
-- Examples: 'subscription', 'one_time', 'pay_per_use', 'freemium'

ALTER TABLE products ADD COLUMN target_market JSONB DEFAULT '{}'::JSONB;
-- Examples: {"demographics": ["young_professionals", "families"], "income_level": "middle_to_high"}

-- Add availability and coverage fields
ALTER TABLE products ADD COLUMN geographic_availability JSONB DEFAULT '[]'::JSONB;
-- Examples: ["abuja", "lagos", "port_harcourt"] or specific area IDs

ALTER TABLE products ADD COLUMN minimum_infrastructure_requirements JSONB DEFAULT '{}'::JSONB;
-- Examples: {"fiber": true, "power_backup": true, "coverage_radius": 5}

-- Add competitive positioning
ALTER TABLE products ADD COLUMN competitive_advantage JSONB DEFAULT '[]'::JSONB;
-- Examples: ["fastest_speed", "24_7_support", "no_setup_fee", "mobile_app"]

ALTER TABLE products ADD COLUMN market_position VARCHAR(50);
-- Examples: 'market_leader', 'challenger', 'follower', 'niche_player'

-- Add business metrics
ALTER TABLE products ADD COLUMN revenue_model VARCHAR(50);
-- Examples: 'recurring_subscription', 'transaction_based', 'commission', 'hybrid'

ALTER TABLE products ADD COLUMN profitability_score INTEGER 
CHECK (profitability_score >= 1 AND profitability_score <= 5);

-- Add launch and lifecycle information
ALTER TABLE products ADD COLUMN launch_date DATE;
ALTER TABLE products ADD COLUMN lifecycle_stage VARCHAR(50);
-- Examples: 'development', 'launch', 'growth', 'maturity', 'decline', 'sunset'

ALTER TABLE products ADD COLUMN is_flagship BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN cross_sell_products JSONB DEFAULT '[]'::JSONB;

-- Add regulatory and compliance
ALTER TABLE products ADD COLUMN regulatory_requirements JSONB DEFAULT '{}'::JSONB;
ALTER TABLE products ADD COLUMN compliance_status VARCHAR(50);

-- Create indexes for new fields
CREATE INDEX idx_products_service_category ON products(service_category);
CREATE INDEX idx_products_pricing_tier ON products(pricing_tier);
CREATE INDEX idx_products_service_type ON products(service_type);
CREATE INDEX idx_products_market_position ON products(market_position);
CREATE INDEX idx_products_revenue_model ON products(revenue_model);
CREATE INDEX idx_products_profitability ON products(profitability_score);
CREATE INDEX idx_products_lifecycle_stage ON products(lifecycle_stage);
CREATE INDEX idx_products_launch_date ON products(launch_date);
CREATE INDEX idx_products_is_flagship ON products(is_flagship);
CREATE INDEX idx_products_compliance_status ON products(compliance_status);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_products_features_gin ON products USING GIN(features);
CREATE INDEX idx_products_target_market_gin ON products USING GIN(target_market);
CREATE INDEX idx_products_geographic_availability_gin ON products USING GIN(geographic_availability);
CREATE INDEX idx_products_infrastructure_reqs_gin ON products USING GIN(minimum_infrastructure_requirements);
CREATE INDEX idx_products_competitive_advantage_gin ON products USING GIN(competitive_advantage);
CREATE INDEX idx_products_cross_sell_gin ON products USING GIN(cross_sell_products);
CREATE INDEX idx_products_regulatory_reqs_gin ON products USING GIN(regulatory_requirements);

-- Create compound indexes for common query patterns
CREATE INDEX idx_products_category_tier ON products(service_category, pricing_tier);
CREATE INDEX idx_products_category_status ON products(service_category, status);
CREATE INDEX idx_products_position_profitability ON products(market_position, profitability_score);
CREATE INDEX idx_products_lifecycle_flagship ON products(lifecycle_stage, is_flagship);

-- Create full-text search index for product names and descriptions
CREATE INDEX idx_products_name_description_fts ON products 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add service category validation constraint
ALTER TABLE products ADD CONSTRAINT check_service_category 
CHECK (service_category IN ('internet', 'fintech', 'delivery', 'money_transfer', 'mailing', 'other'));

-- Add pricing tier validation constraint
ALTER TABLE products ADD CONSTRAINT check_pricing_tier 
CHECK (pricing_tier IN ('basic', 'standard', 'premium', 'enterprise', 'custom'));

-- Add lifecycle stage validation constraint
ALTER TABLE products ADD CONSTRAINT check_lifecycle_stage 
CHECK (lifecycle_stage IN ('development', 'launch', 'growth', 'maturity', 'decline', 'sunset'));

-- Create trigger to update updated_at when product strategy fields change
CREATE OR REPLACE FUNCTION update_products_strategy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update timestamp when strategic fields change
    IF (NEW.market_position IS DISTINCT FROM OLD.market_position OR
        NEW.profitability_score IS DISTINCT FROM OLD.profitability_score OR
        NEW.lifecycle_stage IS DISTINCT FROM OLD.lifecycle_stage OR
        NEW.competitive_advantage IS DISTINCT FROM OLD.competitive_advantage OR
        NEW.is_flagship IS DISTINCT FROM OLD.is_flagship) THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_strategy_update_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_products_strategy_timestamp();