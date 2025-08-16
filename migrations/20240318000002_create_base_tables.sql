-- Enable PostGIS extension for geometric data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status product_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_name_check CHECK (length(trim(name)) > 0)
);

-- Areas table
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    geo_code VARCHAR(50),
    geometry geometry(MULTIPOLYGON, 4326), -- Add spatial data support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT areas_name_check CHECK (length(trim(name)) > 0),
    CONSTRAINT areas_state_check CHECK (length(trim(state)) > 0)
);

-- Estates table
CREATE TABLE IF NOT EXISTS estates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    estate_type estate_type NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    unit_count INTEGER NOT NULL CHECK (unit_count >= 0),
    occupancy_status occupancy_status NOT NULL DEFAULT 'vacant',
    classification estate_classification NOT NULL,
    gated BOOLEAN NOT NULL DEFAULT false,
    has_security BOOLEAN NOT NULL DEFAULT false,
    geometry geometry(POINT, 4326), -- Add point location for estate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT estates_name_check CHECK (length(trim(name)) > 0)
);

-- Estate units table
CREATE TABLE IF NOT EXISTS estate_units (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_type VARCHAR(100) NOT NULL,
    floor_level VARCHAR(50) NOT NULL,
    status unit_status NOT NULL DEFAULT 'vacant',
    last_surveyed_at TIMESTAMP WITH TIME ZONE,
    rent_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT estate_units_unit_type_check CHECK (length(trim(unit_type)) > 0),
    CONSTRAINT estate_units_floor_level_check CHECK (length(trim(floor_level)) > 0),
    CONSTRAINT estate_units_rent_price_check CHECK (rent_price > 0),
    CONSTRAINT estate_units_sale_price_check CHECK (sale_price > 0)
);

-- Price trends table
CREATE TABLE IF NOT EXISTS price_trends (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    unit_type VARCHAR(100) NOT NULL,
    price_type price_type NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    period DATE NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT price_trends_unit_type_check CHECK (length(trim(unit_type)) > 0),
    CONSTRAINT price_trends_source_check CHECK (length(trim(source)) > 0),
    CONSTRAINT price_trends_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estates_updated_at
    BEFORE UPDATE ON estates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estate_units_updated_at
    BEFORE UPDATE ON estate_units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_trends_updated_at
    BEFORE UPDATE ON price_trends
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
