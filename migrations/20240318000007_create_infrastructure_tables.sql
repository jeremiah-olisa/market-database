-- Infrastructure status enum
DO $$ BEGIN
    CREATE TYPE infrastructure_status AS ENUM ('operational', 'maintenance', 'degraded', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Infrastructure type enum
DO $$ BEGIN
    CREATE TYPE infrastructure_type AS ENUM ('fiber', 'tower', 'datacenter', 'distribution_point');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Network infrastructure table
CREATE TABLE IF NOT EXISTS network_infrastructure (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE RESTRICT,
    infrastructure_type infrastructure_type NOT NULL,
    status infrastructure_status NOT NULL DEFAULT 'operational',
    installation_date DATE NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    manufacturer VARCHAR(255),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    capacity_specs JSONB DEFAULT '{}',
    location geometry(POINT, 4326) NOT NULL,
    coverage_area geometry(POLYGON, 4326),
    technical_specs JSONB DEFAULT '{}',
    maintenance_history JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT network_infrastructure_manufacturer_check CHECK (length(trim(manufacturer)) > 0),
    CONSTRAINT network_infrastructure_model_check CHECK (length(trim(model_number)) > 0),
    CONSTRAINT network_infrastructure_serial_check CHECK (length(trim(serial_number)) > 0)
);

-- Capacity metrics table
CREATE TABLE IF NOT EXISTS capacity_metrics (
    id SERIAL PRIMARY KEY,
    infrastructure_id INTEGER NOT NULL REFERENCES network_infrastructure(id) ON DELETE CASCADE,
    metric_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    bandwidth_usage DECIMAL(12,2) CHECK (bandwidth_usage >= 0),
    bandwidth_capacity DECIMAL(12,2) CHECK (bandwidth_capacity >= 0),
    latency_ms DECIMAL(8,2) CHECK (latency_ms >= 0),
    packet_loss_percent DECIMAL(5,2) CHECK (packet_loss_percent BETWEEN 0 AND 100),
    active_connections INTEGER CHECK (active_connections >= 0),
    cpu_usage_percent DECIMAL(5,2) CHECK (cpu_usage_percent BETWEEN 0 AND 100),
    memory_usage_percent DECIMAL(5,2) CHECK (memory_usage_percent BETWEEN 0 AND 100),
    storage_usage_percent DECIMAL(5,2) CHECK (storage_usage_percent BETWEEN 0 AND 100),
    performance_metrics JSONB DEFAULT '{}',
    alerts JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT capacity_metrics_unique UNIQUE(infrastructure_id, metric_timestamp)
);

-- Infrastructure investments table
CREATE TABLE IF NOT EXISTS infrastructure_investments (
    id SERIAL PRIMARY KEY,
    infrastructure_id INTEGER NOT NULL REFERENCES network_infrastructure(id) ON DELETE RESTRICT,
    investment_date DATE NOT NULL,
    investment_type VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    depreciation_period INTEGER CHECK (depreciation_period > 0), -- in months
    roi_metrics JSONB DEFAULT '{}',
    vendor_details JSONB DEFAULT '{}',
    warranty_info JSONB DEFAULT '{}',
    documents JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT infrastructure_investments_type_check CHECK (length(trim(investment_type)) > 0),
    CONSTRAINT infrastructure_investments_currency_check CHECK (length(trim(currency)) = 3)
);

-- Maintenance schedule table
CREATE TABLE IF NOT EXISTS maintenance_schedule (
    id SERIAL PRIMARY KEY,
    infrastructure_id INTEGER NOT NULL REFERENCES network_infrastructure(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0), -- in minutes
    technician_assigned VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    completion_date DATE,
    maintenance_notes TEXT,
    cost_estimate DECIMAL(12,2) CHECK (cost_estimate >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maintenance_schedule_type_check CHECK (length(trim(maintenance_type)) > 0),
    CONSTRAINT maintenance_schedule_status_check CHECK (length(trim(status)) > 0),
    CONSTRAINT maintenance_schedule_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create triggers for updated_at
CREATE TRIGGER update_network_infrastructure_updated_at
    BEFORE UPDATE ON network_infrastructure
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capacity_metrics_updated_at
    BEFORE UPDATE ON capacity_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_infrastructure_investments_updated_at
    BEFORE UPDATE ON infrastructure_investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_schedule_updated_at
    BEFORE UPDATE ON maintenance_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_estate ON network_infrastructure(estate_id);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_type ON network_infrastructure(infrastructure_type);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_status ON network_infrastructure(status);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_location ON network_infrastructure USING gist(location);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_coverage ON network_infrastructure USING gist(coverage_area);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_specs ON network_infrastructure USING gin(technical_specs);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_maintenance ON network_infrastructure USING gin(maintenance_history);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_metadata ON network_infrastructure USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_capacity_metrics_infrastructure ON capacity_metrics(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_capacity_metrics_timestamp ON capacity_metrics(metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_capacity_metrics_performance ON capacity_metrics USING gin(performance_metrics);
CREATE INDEX IF NOT EXISTS idx_capacity_metrics_alerts ON capacity_metrics USING gin(alerts);
CREATE INDEX IF NOT EXISTS idx_capacity_metrics_metadata ON capacity_metrics USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_infrastructure ON infrastructure_investments(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_date ON infrastructure_investments(investment_date);
CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_type ON infrastructure_investments(investment_type);
CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_roi ON infrastructure_investments USING gin(roi_metrics);
CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_vendor ON infrastructure_investments USING gin(vendor_details);
CREATE INDEX IF NOT EXISTS idx_infrastructure_investments_metadata ON infrastructure_investments USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_infrastructure ON maintenance_schedule(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_date ON maintenance_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_status ON maintenance_schedule(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_priority ON maintenance_schedule(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_metadata ON maintenance_schedule USING gin(metadata);
