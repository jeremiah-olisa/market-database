-- Service provider status enum
DO $$ BEGIN
    CREATE TYPE provider_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service quality enum
DO $$ BEGIN
    CREATE TYPE service_quality AS ENUM ('excellent', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service providers table
CREATE TABLE IF NOT EXISTS service_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    status provider_status NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_providers_name_check CHECK (length(trim(name)) > 0),
    CONSTRAINT service_providers_type_check CHECK (length(trim(type)) > 0),
    CONSTRAINT service_providers_email_check CHECK (
        contact_email IS NULL OR 
        contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Provider coverage table
CREATE TABLE IF NOT EXISTS provider_coverage (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    coverage_type VARCHAR(50) NOT NULL,
    service_quality service_quality NOT NULL,
    coverage_percentage DECIMAL(5,2) CHECK (coverage_percentage BETWEEN 0 AND 100),
    installation_date DATE,
    last_assessment_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT provider_coverage_unique UNIQUE(provider_id, estate_id, coverage_type),
    CONSTRAINT provider_coverage_type_check CHECK (length(trim(coverage_type)) > 0)
);

-- Service offerings table
CREATE TABLE IF NOT EXISTS service_offerings (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    billing_cycle VARCHAR(50) NOT NULL,
    features JSONB DEFAULT '[]',
    availability_zones JSONB DEFAULT '[]',
    terms_conditions TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_offerings_name_check CHECK (length(trim(name)) > 0),
    CONSTRAINT service_offerings_billing_cycle_check CHECK (length(trim(billing_cycle)) > 0),
    CONSTRAINT service_offerings_currency_check CHECK (length(trim(currency)) = 3)
);

-- Market share data table
CREATE TABLE IF NOT EXISTS market_share_data (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    market_share_percentage DECIMAL(5,2) CHECK (market_share_percentage BETWEEN 0 AND 100),
    total_customers INTEGER CHECK (total_customers >= 0),
    revenue DECIMAL(12,2) CHECK (revenue >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    data_source VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_share_unique UNIQUE(provider_id, estate_id, period),
    CONSTRAINT market_share_data_source_check CHECK (length(trim(data_source)) > 0),
    CONSTRAINT market_share_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create triggers for updated_at
CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON service_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_coverage_updated_at
    BEFORE UPDATE ON provider_coverage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_offerings_updated_at
    BEFORE UPDATE ON service_offerings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_share_data_updated_at
    BEFORE UPDATE ON market_share_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_type ON service_providers(type);
CREATE INDEX IF NOT EXISTS idx_service_providers_metadata ON service_providers USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_provider_coverage_provider ON provider_coverage(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_estate ON provider_coverage(estate_id);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_quality ON provider_coverage(service_quality);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_metadata ON provider_coverage USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_service_offerings_provider ON service_offerings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_price ON service_offerings(price);
CREATE INDEX IF NOT EXISTS idx_service_offerings_features ON service_offerings USING gin(features);
CREATE INDEX IF NOT EXISTS idx_service_offerings_availability ON service_offerings USING gin(availability_zones);

CREATE INDEX IF NOT EXISTS idx_market_share_provider ON market_share_data(provider_id);
CREATE INDEX IF NOT EXISTS idx_market_share_estate ON market_share_data(estate_id);
CREATE INDEX IF NOT EXISTS idx_market_share_period ON market_share_data(period);
CREATE INDEX IF NOT EXISTS idx_market_share_composite 
    ON market_share_data(provider_id, estate_id, period);
CREATE INDEX IF NOT EXISTS idx_market_share_metadata ON market_share_data USING gin(metadata);
