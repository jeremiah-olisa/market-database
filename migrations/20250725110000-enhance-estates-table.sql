-- Enhance estates table with tier classification and market intelligence fields
-- This migration adds fields required for comprehensive market analysis

-- Add tier classification for estate categorization
ALTER TABLE estates ADD COLUMN tier_classification VARCHAR(20) 
CHECK (tier_classification IN ('platinum', 'gold', 'silver', 'bronze'));

-- Add JSONB metadata field for flexible estate data storage
ALTER TABLE estates ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;

-- Add market potential scoring
ALTER TABLE estates ADD COLUMN market_potential_score DECIMAL(5,2) 
CHECK (market_potential_score >= 0 AND market_potential_score <= 100);

-- Add competitive intensity metrics
ALTER TABLE estates ADD COLUMN competitive_intensity INTEGER 
CHECK (competitive_intensity >= 1 AND competitive_intensity <= 5);

-- Add market intelligence fields
ALTER TABLE estates ADD COLUMN market_size_estimate INTEGER 
CHECK (market_size_estimate >= 0);

ALTER TABLE estates ADD COLUMN target_demographics JSONB DEFAULT '{}'::JSONB;

-- Add infrastructure readiness indicators
ALTER TABLE estates ADD COLUMN infrastructure_readiness_score INTEGER 
CHECK (infrastructure_readiness_score >= 1 AND infrastructure_readiness_score <= 5);

ALTER TABLE estates ADD COLUMN fiber_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE estates ADD COLUMN power_stability_score INTEGER 
CHECK (power_stability_score >= 1 AND power_stability_score <= 5);

-- Add business opportunity metrics
ALTER TABLE estates ADD COLUMN business_density_score INTEGER 
CHECK (business_density_score >= 1 AND business_density_score <= 5);

ALTER TABLE estates ADD COLUMN commercial_potential VARCHAR(20) 
CHECK (commercial_potential IN ('low', 'medium', 'high', 'very_high'));

-- Add market entry indicators
ALTER TABLE estates ADD COLUMN entry_barriers JSONB DEFAULT '{}'::JSONB;
ALTER TABLE estates ADD COLUMN regulatory_compliance_status VARCHAR(50);
ALTER TABLE estates ADD COLUMN investment_priority INTEGER 
CHECK (investment_priority >= 1 AND investment_priority <= 5);

-- Add timestamp for market analysis updates
ALTER TABLE estates ADD COLUMN market_analysis_updated_at TIMESTAMP;

-- Create indexes for new fields
CREATE INDEX idx_estates_tier_classification ON estates(tier_classification);
CREATE INDEX idx_estates_market_potential ON estates(market_potential_score);
CREATE INDEX idx_estates_competitive_intensity ON estates(competitive_intensity);
CREATE INDEX idx_estates_infrastructure_readiness ON estates(infrastructure_readiness_score);
CREATE INDEX idx_estates_business_density ON estates(business_density_score);
CREATE INDEX idx_estates_commercial_potential ON estates(commercial_potential);
CREATE INDEX idx_estates_investment_priority ON estates(investment_priority);
CREATE INDEX idx_estates_fiber_ready ON estates(fiber_ready);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_estates_metadata_gin ON estates USING GIN(metadata);
CREATE INDEX idx_estates_target_demographics_gin ON estates USING GIN(target_demographics);
CREATE INDEX idx_estates_entry_barriers_gin ON estates USING GIN(entry_barriers);

-- Create compound indexes for common query patterns
CREATE INDEX idx_estates_tier_area ON estates(tier_classification, area_id);
CREATE INDEX idx_estates_classification_type ON estates(classification, estate_type);
CREATE INDEX idx_estates_potential_priority ON estates(market_potential_score, investment_priority);

-- Add validation constraint for tier classification
ALTER TABLE estates ADD CONSTRAINT check_tier_classification 
CHECK (tier_classification IN ('platinum', 'gold', 'silver', 'bronze'));

-- Create updated_at trigger for market analysis tracking
CREATE OR REPLACE FUNCTION update_estates_market_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Update market analysis timestamp when relevant fields change
    IF (NEW.market_potential_score IS DISTINCT FROM OLD.market_potential_score OR
        NEW.competitive_intensity IS DISTINCT FROM OLD.competitive_intensity OR
        NEW.tier_classification IS DISTINCT FROM OLD.tier_classification OR
        NEW.infrastructure_readiness_score IS DISTINCT FROM OLD.infrastructure_readiness_score OR
        NEW.business_density_score IS DISTINCT FROM OLD.business_density_score OR
        NEW.commercial_potential IS DISTINCT FROM OLD.commercial_potential OR
        NEW.investment_priority IS DISTINCT FROM OLD.investment_priority) THEN
        NEW.market_analysis_updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER estates_market_analysis_trigger
    BEFORE UPDATE ON estates
    FOR EACH ROW EXECUTE FUNCTION update_estates_market_analysis();