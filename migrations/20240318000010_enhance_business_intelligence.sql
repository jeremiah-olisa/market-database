-- Add lifestyle indicators tracking
ALTER TABLE local_businesses
ADD COLUMN business_density_score INTEGER CHECK (business_density_score BETWEEN 1 AND 100),
ADD COLUMN entertainment_venue_type VARCHAR(50),
ADD COLUMN peak_hours_data JSONB DEFAULT '{}';

-- Enhance cross-selling opportunities tracking
CREATE TABLE IF NOT EXISTS cross_selling_opportunities (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    potential_customer_count INTEGER CHECK (potential_customer_count >= 0),
    readiness_score INTEGER CHECK (readiness_score BETWEEN 1 AND 100),
    market_fit_score INTEGER CHECK (market_fit_score BETWEEN 1 AND 100),
    competitor_presence_level INTEGER CHECK (competitor_presence_level BETWEEN 1 AND 5),
    estimated_penetration_rate DECIMAL(5,2) CHECK (estimated_penetration_rate BETWEEN 0 AND 100),
    target_demographic JSONB DEFAULT '{}',
    opportunity_factors JSONB DEFAULT '{}',
    barriers_to_entry JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cross_selling_opportunities_service_check CHECK (length(trim(service_type)) > 0)
);

-- Enhance market readiness tracking
CREATE TABLE IF NOT EXISTS market_readiness_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    service_tier VARCHAR(50) NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    infrastructure_readiness INTEGER CHECK (infrastructure_readiness BETWEEN 1 AND 100),
    demographic_fit_score INTEGER CHECK (demographic_fit_score BETWEEN 1 AND 100),
    economic_viability_score INTEGER CHECK (economic_viability_score BETWEEN 1 AND 100),
    competition_intensity INTEGER CHECK (competition_intensity BETWEEN 1 AND 5),
    market_demand_indicators JSONB DEFAULT '{}',
    barrier_analysis JSONB DEFAULT '{}',
    readiness_factors JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_readiness_metrics_unique UNIQUE(estate_id, service_tier, assessment_date),
    CONSTRAINT market_readiness_tier_check CHECK (length(trim(service_tier)) > 0)
);

-- Add economic activity tracking
ALTER TABLE estates
ADD COLUMN economic_activity_score INTEGER CHECK (economic_activity_score BETWEEN 1 AND 100),
ADD COLUMN business_growth_rate DECIMAL(5,2),
ADD COLUMN economic_indicators JSONB DEFAULT '{}';

-- Create triggers
CREATE TRIGGER update_cross_selling_opportunities_updated_at
    BEFORE UPDATE ON cross_selling_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_readiness_metrics_updated_at
    BEFORE UPDATE ON market_readiness_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cross_selling_estate ON cross_selling_opportunities(estate_id);
CREATE INDEX IF NOT EXISTS idx_cross_selling_service ON cross_selling_opportunities(service_type);
CREATE INDEX IF NOT EXISTS idx_cross_selling_readiness ON cross_selling_opportunities(readiness_score);
CREATE INDEX IF NOT EXISTS idx_cross_selling_market_fit ON cross_selling_opportunities(market_fit_score);
CREATE INDEX IF NOT EXISTS idx_cross_selling_factors ON cross_selling_opportunities USING gin(opportunity_factors);

CREATE INDEX IF NOT EXISTS idx_market_readiness_estate ON market_readiness_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_market_readiness_tier ON market_readiness_metrics(service_tier);
CREATE INDEX IF NOT EXISTS idx_market_readiness_date ON market_readiness_metrics(assessment_date);
CREATE INDEX IF NOT EXISTS idx_market_readiness_composite ON market_readiness_metrics(estate_id, service_tier);
CREATE INDEX IF NOT EXISTS idx_market_readiness_indicators ON market_readiness_metrics USING gin(market_demand_indicators);

CREATE INDEX IF NOT EXISTS idx_estates_economic ON estates(economic_activity_score);
CREATE INDEX IF NOT EXISTS idx_estates_business_growth ON estates(business_growth_rate);
CREATE INDEX IF NOT EXISTS idx_estates_economic_indicators ON estates USING gin(economic_indicators);

-- Create materialized view for economic activity analysis
CREATE MATERIALIZED VIEW estate_economic_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.economic_activity_score,
    e.business_growth_rate,
    COUNT(DISTINCT lb.id) as total_businesses,
    ROUND(AVG(lb.business_density_score), 2) as avg_business_density,
    COUNT(DISTINCT CASE WHEN lb.entertainment_venue_type IS NOT NULL THEN lb.id END) as entertainment_venues,
    json_build_object(
        'high_activity', COUNT(DISTINCT CASE WHEN e.economic_activity_score >= 75 THEN e.id END),
        'medium_activity', COUNT(DISTINCT CASE WHEN e.economic_activity_score BETWEEN 50 AND 74 THEN e.id END),
        'low_activity', COUNT(DISTINCT CASE WHEN e.economic_activity_score < 50 THEN e.id END)
    ) as activity_distribution,
    e.economic_indicators
FROM 
    estates e
    LEFT JOIN local_businesses lb ON e.id = lb.estate_id
GROUP BY 
    e.id, e.name, e.economic_activity_score, e.business_growth_rate, e.economic_indicators;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON estate_economic_analysis (estate_id);

-- Create refresh function and trigger
CREATE OR REPLACE FUNCTION refresh_estate_economic_analysis()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY estate_economic_analysis;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_estate_economic_analysis_on_change
    AFTER INSERT OR UPDATE OR DELETE ON estates
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_estate_economic_analysis();
