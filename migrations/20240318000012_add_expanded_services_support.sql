-- Service category enum
DO $$ BEGIN
    CREATE TYPE service_category AS ENUM (
        'internet', 'fintech', 'delivery', 'money_transfer', 'mailing', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add service categorization
ALTER TABLE service_offerings
ADD COLUMN service_category service_category NOT NULL DEFAULT 'internet',
ADD COLUMN service_requirements JSONB DEFAULT '{}',
ADD COLUMN target_segments JSONB DEFAULT '[]';

-- Create expanded services tracking
CREATE TABLE IF NOT EXISTS expanded_service_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    service_category service_category NOT NULL,
    period DATE NOT NULL,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    transaction_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    service_coverage_percentage DECIMAL(5,2) CHECK (service_coverage_percentage BETWEEN 0 AND 100),
    adoption_rate DECIMAL(5,2) CHECK (adoption_rate BETWEEN 0 AND 100),
    performance_metrics JSONB DEFAULT '{}',
    usage_patterns JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expanded_service_metrics_unique UNIQUE(estate_id, service_category, period)
);

-- Create delivery coverage zones
CREATE TABLE IF NOT EXISTS delivery_coverage_zones (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    zone_name VARCHAR(255) NOT NULL,
    coverage_area geometry(POLYGON, 4326) NOT NULL,
    service_level VARCHAR(50) NOT NULL,
    delivery_partners INTEGER NOT NULL DEFAULT 0,
    average_delivery_time INTEGER, -- in minutes
    coverage_score INTEGER CHECK (coverage_score BETWEEN 1 AND 100),
    operational_hours JSONB DEFAULT '{}',
    delivery_constraints JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_coverage_zones_name_check CHECK (length(trim(zone_name)) > 0),
    CONSTRAINT delivery_coverage_zones_service_check CHECK (length(trim(service_level)) > 0)
);

-- Create fintech service metrics
CREATE TABLE IF NOT EXISTS fintech_service_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    period DATE NOT NULL,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    transaction_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    average_transaction_value DECIMAL(12,2) GENERATED ALWAYS AS (
        CASE 
            WHEN transaction_count > 0 
            THEN ROUND(transaction_volume / transaction_count, 2)
            ELSE 0 
        END
    ) STORED,
    user_demographics JSONB DEFAULT '{}',
    usage_patterns JSONB DEFAULT '{}',
    risk_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fintech_service_metrics_unique UNIQUE(estate_id, service_type, period),
    CONSTRAINT fintech_service_type_check CHECK (length(trim(service_type)) > 0)
);

-- Create mailing system metrics
CREATE TABLE IF NOT EXISTS mailing_system_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    total_mailboxes INTEGER NOT NULL DEFAULT 0,
    active_mailboxes INTEGER NOT NULL DEFAULT 0,
    total_packages INTEGER NOT NULL DEFAULT 0,
    average_processing_time INTEGER, -- in minutes
    service_usage_metrics JSONB DEFAULT '{}',
    operational_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mailing_system_metrics_unique UNIQUE(estate_id, period)
);

-- Create triggers
CREATE TRIGGER update_expanded_service_metrics_updated_at
    BEFORE UPDATE ON expanded_service_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_coverage_zones_updated_at
    BEFORE UPDATE ON delivery_coverage_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fintech_service_metrics_updated_at
    BEFORE UPDATE ON fintech_service_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mailing_system_metrics_updated_at
    BEFORE UPDATE ON mailing_system_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expanded_service_estate ON expanded_service_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_expanded_service_category ON expanded_service_metrics(service_category);
CREATE INDEX IF NOT EXISTS idx_expanded_service_period ON expanded_service_metrics(period);
CREATE INDEX IF NOT EXISTS idx_expanded_service_metrics ON expanded_service_metrics USING gin(performance_metrics);
CREATE INDEX IF NOT EXISTS idx_expanded_service_patterns ON expanded_service_metrics USING gin(usage_patterns);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_estate ON delivery_coverage_zones(estate_id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_coverage ON delivery_coverage_zones USING gist(coverage_area);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_score ON delivery_coverage_zones(coverage_score);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_constraints ON delivery_coverage_zones USING gin(delivery_constraints);

CREATE INDEX IF NOT EXISTS idx_fintech_metrics_estate ON fintech_service_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_type ON fintech_service_metrics(service_type);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_period ON fintech_service_metrics(period);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_demographics ON fintech_service_metrics USING gin(user_demographics);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_patterns ON fintech_service_metrics USING gin(usage_patterns);
CREATE INDEX IF NOT EXISTS idx_fintech_metrics_risk ON fintech_service_metrics USING gin(risk_metrics);

CREATE INDEX IF NOT EXISTS idx_mailing_metrics_estate ON mailing_system_metrics(estate_id);
CREATE INDEX IF NOT EXISTS idx_mailing_metrics_period ON mailing_system_metrics(period);
CREATE INDEX IF NOT EXISTS idx_mailing_metrics_usage ON mailing_system_metrics USING gin(service_usage_metrics);
CREATE INDEX IF NOT EXISTS idx_mailing_metrics_operational ON mailing_system_metrics USING gin(operational_metrics);

-- Create materialized view for expanded services analysis
CREATE MATERIALIZED VIEW expanded_services_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier,
    esm.service_category,
    esm.period,
    SUM(esm.total_transactions) as total_transactions,
    SUM(esm.transaction_volume) as transaction_volume,
    SUM(esm.active_users) as active_users,
    ROUND(AVG(esm.service_coverage_percentage), 2) as avg_coverage_percentage,
    ROUND(AVG(esm.adoption_rate), 2) as avg_adoption_rate,
    COUNT(DISTINCT dcz.id) as delivery_zones_count,
    SUM(fsm.transaction_count) as fintech_transactions,
    SUM(fsm.transaction_volume) as fintech_volume,
    SUM(msm.total_packages) as total_packages_processed
FROM 
    estates e
    LEFT JOIN expanded_service_metrics esm ON e.id = esm.estate_id
    LEFT JOIN delivery_coverage_zones dcz ON e.id = dcz.estate_id
    LEFT JOIN fintech_service_metrics fsm ON e.id = fsm.estate_id
    LEFT JOIN mailing_system_metrics msm ON e.id = msm.estate_id
GROUP BY 
    e.id, e.name, e.tier, esm.service_category, esm.period;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON expanded_services_analysis (estate_id, service_category, period);

-- Create refresh function and trigger
CREATE OR REPLACE FUNCTION refresh_expanded_services_analysis()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY expanded_services_analysis;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_expanded_services_analysis_on_metrics_change
    AFTER INSERT OR UPDATE OR DELETE ON expanded_service_metrics
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_expanded_services_analysis();

CREATE TRIGGER refresh_expanded_services_analysis_on_fintech_change
    AFTER INSERT OR UPDATE OR DELETE ON fintech_service_metrics
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_expanded_services_analysis();

CREATE TRIGGER refresh_expanded_services_analysis_on_mailing_change
    AFTER INSERT OR UPDATE OR DELETE ON mailing_system_metrics
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_expanded_services_analysis();
