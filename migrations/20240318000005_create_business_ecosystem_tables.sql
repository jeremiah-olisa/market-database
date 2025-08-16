-- Enable ltree extension for hierarchical categories
CREATE EXTENSION IF NOT EXISTS ltree;

-- Business status enum
DO $$ BEGIN
    CREATE TYPE business_status AS ENUM (
        'active', 'inactive', 'temporary_closed', 'permanently_closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Business categories table
CREATE TABLE IF NOT EXISTS business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES business_categories(id) ON DELETE RESTRICT,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    path ltree NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT business_categories_name_check CHECK (length(trim(name)) > 0),
    CONSTRAINT business_categories_level_check CHECK (level > 0)
);

-- Local businesses table
CREATE TABLE IF NOT EXISTS local_businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES business_categories(id) ON DELETE RESTRICT,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    business_type VARCHAR(100) NOT NULL,
    status business_status NOT NULL DEFAULT 'active',
    establishment_date DATE,
    employee_count INTEGER CHECK (employee_count >= 0),
    floor_area_sqm DECIMAL(10,2) CHECK (floor_area_sqm > 0),
    operating_hours JSONB DEFAULT '{}',
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website VARCHAR(255),
    social_media JSONB DEFAULT '{}',
    location geometry(POINT, 4326) NOT NULL,
    address_details JSONB DEFAULT '{}',
    business_metrics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT local_businesses_name_check CHECK (length(trim(name)) > 0),
    CONSTRAINT local_businesses_type_check CHECK (length(trim(business_type)) > 0),
    CONSTRAINT local_businesses_email_check CHECK (
        contact_email IS NULL OR 
        contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Business reviews table
CREATE TABLE IF NOT EXISTS business_reviews (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    reviewer_type VARCHAR(50) NOT NULL,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verified BOOLEAN NOT NULL DEFAULT false,
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT business_reviews_reviewer_type_check CHECK (length(trim(reviewer_type)) > 0)
);

-- Business metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES local_businesses(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    foot_traffic INTEGER CHECK (foot_traffic >= 0),
    sales_volume DECIMAL(12,2) CHECK (sales_volume >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    peak_hours JSONB DEFAULT '{}',
    customer_demographics JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT business_metrics_unique UNIQUE(business_id, metric_date),
    CONSTRAINT business_metrics_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create triggers for updated_at
CREATE TRIGGER update_business_categories_updated_at
    BEFORE UPDATE ON business_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_businesses_updated_at
    BEFORE UPDATE ON local_businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_reviews_updated_at
    BEFORE UPDATE ON business_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_metrics_updated_at
    BEFORE UPDATE ON business_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_categories_parent ON business_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_business_categories_path ON business_categories USING gist(path);
CREATE INDEX IF NOT EXISTS idx_business_categories_metadata ON business_categories USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_local_businesses_category ON local_businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_local_businesses_estate ON local_businesses(estate_id);
CREATE INDEX IF NOT EXISTS idx_local_businesses_status ON local_businesses(status);
CREATE INDEX IF NOT EXISTS idx_local_businesses_type ON local_businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_local_businesses_location ON local_businesses USING gist(location);
CREATE INDEX IF NOT EXISTS idx_local_businesses_metrics ON local_businesses USING gin(business_metrics);
CREATE INDEX IF NOT EXISTS idx_local_businesses_metadata ON local_businesses USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_business_reviews_business ON business_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_business_reviews_date ON business_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_business_reviews_metadata ON business_reviews USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_business_metrics_business ON business_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_business_metrics_composite 
    ON business_metrics(business_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_business_metrics_metadata ON business_metrics USING gin(metadata);