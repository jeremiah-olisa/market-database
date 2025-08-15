-- Create infrastructure intelligence tables for network monitoring
-- These tables support infrastructure performance tracking and investment analysis

-- Network infrastructure table
CREATE TABLE network_infrastructure (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    infrastructure_type VARCHAR(100) NOT NULL, -- 'fiber', 'wireless', 'satellite', 'hybrid'
    coverage_quality DECIMAL(3,2) CHECK (coverage_quality >= 0 AND coverage_quality <= 5),
    capacity DECIMAL(10,2) NOT NULL, -- in Mbps
    technology VARCHAR(100), -- 'GPON', '5G', 'LTE', 'WiFi6'
    installation_date DATE,
    last_maintenance_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'upgrade', 'decommissioned')),
    coordinates GEOMETRY(POINT, 4326),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Capacity metrics table
CREATE TABLE capacity_metrics (
    id SERIAL PRIMARY KEY,
    infrastructure_id INTEGER NOT NULL REFERENCES network_infrastructure(id) ON DELETE CASCADE,
    utilization_rate DECIMAL(5,2) NOT NULL CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
    performance_metrics JSONB NOT NULL, -- {"latency": 15, "packet_loss": 0.1, "jitter": 5}
    peak_hours JSONB, -- {"morning": "7-9AM", "evening": "6-9PM"}
    measurement_period TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructure investments table
CREATE TABLE infrastructure_investments (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    investment_type VARCHAR(100) NOT NULL, -- 'expansion', 'upgrade', 'maintenance', 'new_installation'
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'NGN',
    investment_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    roi_metrics JSONB, -- {"expected_roi": 25.5, "payback_period": "18_months", "irr": 15.2}
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for infrastructure tables
CREATE INDEX idx_network_infrastructure_estate_id ON network_infrastructure(estate_id);
CREATE INDEX idx_network_infrastructure_type ON network_infrastructure(infrastructure_type);
CREATE INDEX idx_network_infrastructure_status ON network_infrastructure(status);
CREATE INDEX idx_network_infrastructure_coverage_quality ON network_infrastructure(coverage_quality);
CREATE INDEX idx_network_infrastructure_coordinates ON network_infrastructure USING GIST(coordinates);
CREATE INDEX idx_network_infrastructure_installation_date ON network_infrastructure(installation_date);

CREATE INDEX idx_capacity_metrics_infrastructure_id ON capacity_metrics(infrastructure_id);
CREATE INDEX idx_capacity_metrics_utilization_rate ON capacity_metrics(utilization_rate);
CREATE INDEX idx_capacity_metrics_measurement_period ON capacity_metrics(measurement_period);
CREATE INDEX idx_capacity_metrics_performance_gin ON capacity_metrics USING GIN(performance_metrics);

CREATE INDEX idx_infrastructure_investments_estate_id ON infrastructure_investments(estate_id);
CREATE INDEX idx_infrastructure_investments_type ON infrastructure_investments(investment_type);
CREATE INDEX idx_infrastructure_investments_status ON infrastructure_investments(status);
CREATE INDEX idx_infrastructure_investments_date ON infrastructure_investments(investment_date);
CREATE INDEX idx_infrastructure_investments_amount ON infrastructure_investments(amount);
CREATE INDEX idx_infrastructure_investments_roi_gin ON infrastructure_investments USING GIN(roi_metrics);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_infrastructure_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER network_infrastructure_updated_at_trigger
    BEFORE UPDATE ON network_infrastructure
    FOR EACH ROW EXECUTE FUNCTION update_infrastructure_updated_at();

CREATE TRIGGER capacity_metrics_updated_at_trigger
    BEFORE UPDATE ON capacity_metrics
    FOR EACH ROW EXECUTE FUNCTION update_infrastructure_updated_at();

CREATE TRIGGER infrastructure_investments_updated_at_trigger
    BEFORE UPDATE ON infrastructure_investments
    FOR EACH ROW EXECUTE FUNCTION update_infrastructure_updated_at();
