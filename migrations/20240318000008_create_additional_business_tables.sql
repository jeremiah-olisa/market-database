-- Demographics table (required for demographic intelligence)
CREATE TABLE IF NOT EXISTS demographics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    total_population INTEGER NOT NULL CHECK (total_population >= 0),
    avg_household_size DECIMAL(4,2) NOT NULL CHECK (avg_household_size > 0),
    avg_household_income DECIMAL(12,2) CHECK (avg_household_income >= 0),
    age_distribution JSONB NOT NULL DEFAULT '{}',
    income_distribution JSONB NOT NULL DEFAULT '{}',
    occupation_distribution JSONB NOT NULL DEFAULT '{}',
    education_levels JSONB DEFAULT '{}',
    lifestyle_indicators JSONB DEFAULT '{}',
    updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demographics_unique UNIQUE(estate_id)
);

-- Revenue analytics table (for financial intelligence)
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    revenue_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    customer_count INTEGER NOT NULL CHECK (customer_count >= 0),
    growth_rate DECIMAL(5,2),
    performance_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT revenue_analytics_unique UNIQUE(estate_id, period, revenue_type),
    CONSTRAINT revenue_analytics_type_check CHECK (length(trim(revenue_type)) > 0)
);

-- Market opportunities table
CREATE TABLE IF NOT EXISTS market_opportunities (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER REFERENCES estates(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    opportunity_type VARCHAR(100) NOT NULL,
    potential_revenue DECIMAL(12,2) CHECK (potential_revenue >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    probability DECIMAL(5,2) CHECK (probability BETWEEN 0 AND 100),
    competition_level INTEGER CHECK (competition_level BETWEEN 1 AND 5),
    market_size INTEGER CHECK (market_size >= 0),
    implementation_cost DECIMAL(12,2) CHECK (implementation_cost >= 0),
    roi_estimate DECIMAL(5,2),
    priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 100),
    status VARCHAR(50) NOT NULL DEFAULT 'identified',
    analysis_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_opportunities_type_check CHECK (length(trim(opportunity_type)) > 0),
    CONSTRAINT market_opportunities_status_check CHECK (length(trim(status)) > 0),
    CONSTRAINT market_opportunities_area_check CHECK (
        (estate_id IS NOT NULL AND area_id IS NULL) OR 
        (estate_id IS NULL AND area_id IS NOT NULL)
    )
);

-- Service quality metrics table
CREATE TABLE IF NOT EXISTS service_quality_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    period DATE NOT NULL,
    uptime_percentage DECIMAL(5,2) CHECK (uptime_percentage BETWEEN 0 AND 100),
    avg_response_time INTEGER CHECK (avg_response_time >= 0), -- in milliseconds
    customer_satisfaction_score DECIMAL(3,2) CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
    incident_count INTEGER CHECK (incident_count >= 0),
    resolution_time_avg INTEGER CHECK (resolution_time_avg >= 0), -- in minutes
    quality_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_quality_metrics_unique UNIQUE(estate_id, service_type, period),
    CONSTRAINT service_quality_type_check CHECK (length(trim(service_type)) > 0)
);

-- Create triggers for updated_at
CREATE TRIGGER update_demographics_updated_at
    BEFORE UPDATE ON demographics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_analytics_updated_at
    BEFORE UPDATE ON revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_opportunities_updated_at
    BEFORE UPDATE ON market_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_quality_metrics_updated_at
    BEFORE UPDATE ON service_quality_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_demographics_estate ON demographics(estate_id);
CREATE INDEX IF NOT EXISTS idx_demographics_income ON demographics(avg_household_income);
CREATE INDEX IF NOT EXISTS idx_demographics_age ON demographics USING gin(age_distribution);
CREATE INDEX IF NOT EXISTS idx_demographics_income_dist ON demographics USING gin(income_distribution);
CREATE INDEX IF NOT EXISTS idx_demographics_occupation ON demographics USING gin(occupation_distribution);
CREATE INDEX IF NOT EXISTS idx_demographics_metadata ON demographics USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_estate ON revenue_analytics(estate_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON revenue_analytics(period);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_type ON revenue_analytics(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_metrics ON revenue_analytics USING gin(performance_metrics);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_metadata ON revenue_analytics USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_market_opportunities_estate ON market_opportunities(estate_id);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_area ON market_opportunities(area_id);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_type ON market_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_status ON market_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_priority ON market_opportunities(priority_score);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_analysis ON market_opportunities USING gin(analysis_data);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_metadata ON market_opportunities USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_service_quality_estate ON service_quality_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_service_quality_type ON service_quality_metrics(service_type);
CREATE INDEX IF NOT EXISTS idx_service_quality_period ON service_quality_metrics(period);
CREATE INDEX IF NOT EXISTS idx_service_quality_metrics ON service_quality_metrics USING gin(quality_metrics);
CREATE INDEX IF NOT EXISTS idx_service_quality_metadata ON service_quality_metrics USING gin(metadata);
