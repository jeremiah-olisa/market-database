-- Customer status enum
DO $$ BEGIN
    CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended', 'churned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Service adoption status enum
DO $$ BEGIN
    CREATE TYPE adoption_status AS ENUM ('active', 'pending', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Customer satisfaction enum
DO $$ BEGIN
    CREATE TYPE satisfaction_level AS ENUM ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id SERIAL PRIMARY KEY,
    estate_unit_id INTEGER NOT NULL REFERENCES estate_units(id) ON DELETE RESTRICT,
    customer_type VARCHAR(50) NOT NULL,
    status customer_status NOT NULL DEFAULT 'active',
    registration_date DATE NOT NULL,
    household_size INTEGER CHECK (household_size > 0),
    income_bracket VARCHAR(50),
    occupation_category VARCHAR(100),
    age_bracket VARCHAR(50),
    lifestyle_tags TEXT[],
    preferences JSONB DEFAULT '{}',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_profiles_type_check CHECK (length(trim(customer_type)) > 0),
    CONSTRAINT customer_profiles_email_check CHECK (
        contact_email IS NULL OR 
        contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Usage patterns table
CREATE TABLE IF NOT EXISTS usage_patterns (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    usage_date DATE NOT NULL,
    data_consumed DECIMAL(12,2) CHECK (data_consumed >= 0),
    peak_usage_time TIME,
    device_type VARCHAR(50),
    connection_quality INTEGER CHECK (connection_quality BETWEEN 1 AND 10),
    usage_duration INTEGER CHECK (usage_duration >= 0), -- in minutes
    usage_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usage_patterns_service_type_check CHECK (length(trim(service_type)) > 0),
    CONSTRAINT usage_patterns_unique UNIQUE(customer_id, service_type, usage_date)
);

-- Customer feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
    satisfaction_level satisfaction_level NOT NULL,
    feedback_text TEXT,
    category VARCHAR(100) NOT NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    resolution_status VARCHAR(50) DEFAULT 'pending',
    resolved_date DATE,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_feedback_service_type_check CHECK (length(trim(service_type)) > 0),
    CONSTRAINT customer_feedback_category_check CHECK (length(trim(category)) > 0)
);

-- Cross service adoption table
CREATE TABLE IF NOT EXISTS cross_service_adoption (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES service_offerings(id) ON DELETE RESTRICT,
    adoption_date DATE NOT NULL,
    status adoption_status NOT NULL DEFAULT 'active',
    subscription_tier VARCHAR(50) NOT NULL,
    monthly_cost DECIMAL(12,2) NOT NULL CHECK (monthly_cost >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    usage_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cross_service_unique UNIQUE(customer_id, service_id),
    CONSTRAINT cross_service_tier_check CHECK (length(trim(subscription_tier)) > 0),
    CONSTRAINT cross_service_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create triggers for updated_at
CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_patterns_updated_at
    BEFORE UPDATE ON usage_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_feedback_updated_at
    BEFORE UPDATE ON customer_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_service_adoption_updated_at
    BEFORE UPDATE ON cross_service_adoption
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_estate_unit ON customer_profiles(estate_unit_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON customer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_type ON customer_profiles(customer_type);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_lifestyle ON customer_profiles USING gin(lifestyle_tags);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_preferences ON customer_profiles USING gin(preferences);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_metadata ON customer_profiles USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_usage_patterns_customer ON usage_patterns(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_service_type ON usage_patterns(service_type);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_date ON usage_patterns(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_metrics ON usage_patterns USING gin(usage_metrics);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_metadata ON usage_patterns USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_satisfaction ON customer_feedback(satisfaction_level);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_date ON customer_feedback(feedback_date);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_category ON customer_feedback(category);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_resolution ON customer_feedback(resolution_status);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_metadata ON customer_feedback USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_cross_service_customer ON cross_service_adoption(customer_id);
CREATE INDEX IF NOT EXISTS idx_cross_service_service ON cross_service_adoption(service_id);
CREATE INDEX IF NOT EXISTS idx_cross_service_status ON cross_service_adoption(status);
CREATE INDEX IF NOT EXISTS idx_cross_service_metrics ON cross_service_adoption USING gin(usage_metrics);
CREATE INDEX IF NOT EXISTS idx_cross_service_metadata ON cross_service_adoption USING gin(metadata);
