-- Add competitor strengths and weaknesses tracking
ALTER TABLE service_providers
ADD COLUMN competitive_advantages TEXT[],
ADD COLUMN competitive_disadvantages TEXT[],
ADD COLUMN market_positioning JSONB DEFAULT '{}';

-- Add detailed market penetration tracking
CREATE TABLE IF NOT EXISTS market_penetration_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    total_addressable_market INTEGER NOT NULL CHECK (total_addressable_market > 0),
    current_customers INTEGER NOT NULL CHECK (current_customers >= 0),
    penetration_rate DECIMAL(5,2) GENERATED ALWAYS AS 
        (CASE 
            WHEN total_addressable_market > 0 
            THEN ROUND((current_customers::DECIMAL / total_addressable_market::DECIMAL) * 100, 2)
            ELSE 0 
        END) STORED,
    conversion_rate DECIMAL(5,2) CHECK (conversion_rate BETWEEN 0 AND 100),
    churn_rate DECIMAL(5,2) CHECK (churn_rate BETWEEN 0 AND 100),
    market_share DECIMAL(5,2) CHECK (market_share BETWEEN 0 AND 100),
    competitor_comparison JSONB DEFAULT '{}',
    growth_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_penetration_unique UNIQUE(estate_id, provider_id, period)
);

-- Add competitive service comparison
CREATE TABLE IF NOT EXISTS competitive_service_comparison (
    id SERIAL PRIMARY KEY,
    our_service_id INTEGER NOT NULL REFERENCES service_offerings(id) ON DELETE CASCADE,
    competitor_service_id INTEGER NOT NULL REFERENCES service_offerings(id) ON DELETE CASCADE,
    comparison_date DATE NOT NULL DEFAULT CURRENT_DATE,
    price_difference DECIMAL(12,2),
    feature_comparison JSONB DEFAULT '{}',
    competitive_advantages TEXT[],
    competitive_disadvantages TEXT[],
    market_positioning_score INTEGER CHECK (market_positioning_score BETWEEN 1 AND 100),
    customer_preference_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT competitive_service_unique UNIQUE(our_service_id, competitor_service_id, comparison_date),
    CONSTRAINT different_services CHECK (our_service_id != competitor_service_id)
);

-- Create triggers
CREATE TRIGGER update_market_penetration_metrics_updated_at
    BEFORE UPDATE ON market_penetration_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitive_service_comparison_updated_at
    BEFORE UPDATE ON competitive_service_comparison
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_penetration_estate ON market_penetration_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_market_penetration_provider ON market_penetration_metrics(provider_id);
CREATE INDEX IF NOT EXISTS idx_market_penetration_period ON market_penetration_metrics(period);
CREATE INDEX IF NOT EXISTS idx_market_penetration_rate ON market_penetration_metrics(penetration_rate);
CREATE INDEX IF NOT EXISTS idx_market_penetration_share ON market_penetration_metrics(market_share);
CREATE INDEX IF NOT EXISTS idx_market_penetration_metrics ON market_penetration_metrics USING gin(growth_metrics);
CREATE INDEX IF NOT EXISTS idx_market_penetration_comparison ON market_penetration_metrics USING gin(competitor_comparison);

CREATE INDEX IF NOT EXISTS idx_competitive_service_our ON competitive_service_comparison(our_service_id);
CREATE INDEX IF NOT EXISTS idx_competitive_service_competitor ON competitive_service_comparison(competitor_service_id);
CREATE INDEX IF NOT EXISTS idx_competitive_service_date ON competitive_service_comparison(comparison_date);
CREATE INDEX IF NOT EXISTS idx_competitive_service_score ON competitive_service_comparison(market_positioning_score);
CREATE INDEX IF NOT EXISTS idx_competitive_service_features ON competitive_service_comparison USING gin(feature_comparison);
CREATE INDEX IF NOT EXISTS idx_competitive_service_preferences ON competitive_service_comparison USING gin(customer_preference_data);

CREATE INDEX IF NOT EXISTS idx_service_providers_advantages ON service_providers USING gin(competitive_advantages);
CREATE INDEX IF NOT EXISTS idx_service_providers_disadvantages ON service_providers USING gin(competitive_disadvantages);
CREATE INDEX IF NOT EXISTS idx_service_providers_positioning ON service_providers USING gin(market_positioning);

-- Create materialized view for competitive analysis
CREATE MATERIALIZED VIEW competitive_landscape_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    sp.id as provider_id,
    sp.name as provider_name,
    mpm.period,
    mpm.penetration_rate,
    mpm.market_share,
    mpm.conversion_rate,
    mpm.churn_rate,
    COUNT(DISTINCT so.id) as service_offerings_count,
    json_build_object(
        'high_penetration', COUNT(DISTINCT CASE WHEN mpm.penetration_rate >= 75 THEN e.id END),
        'medium_penetration', COUNT(DISTINCT CASE WHEN mpm.penetration_rate BETWEEN 25 AND 74 THEN e.id END),
        'low_penetration', COUNT(DISTINCT CASE WHEN mpm.penetration_rate < 25 THEN e.id END)
    ) as penetration_distribution,
    sp.market_positioning,
    sp.competitive_advantages,
    sp.competitive_disadvantages
FROM 
    estates e
    JOIN market_penetration_metrics mpm ON e.id = mpm.estate_id
    JOIN service_providers sp ON mpm.provider_id = sp.id
    LEFT JOIN service_offerings so ON sp.id = so.provider_id
GROUP BY 
    e.id, e.name, sp.id, sp.name, mpm.period, mpm.penetration_rate, 
    mpm.market_share, mpm.conversion_rate, mpm.churn_rate,
    sp.market_positioning, sp.competitive_advantages, sp.competitive_disadvantages;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON competitive_landscape_analysis (estate_id, provider_id, period);

-- Create refresh function and trigger
CREATE OR REPLACE FUNCTION refresh_competitive_landscape_analysis()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY competitive_landscape_analysis;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_competitive_landscape_analysis_on_change
    AFTER INSERT OR UPDATE OR DELETE ON market_penetration_metrics
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_competitive_landscape_analysis();
