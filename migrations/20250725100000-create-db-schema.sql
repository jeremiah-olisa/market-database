-- Creating schema for Market Database Management System

-- Creating products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_status ON products(status);

-- Creating areas table
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    geo_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_areas_state ON areas(state);

-- Creating estates table
CREATE TABLE estates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    estate_type VARCHAR(50) NOT NULL CHECK (estate_type IN ('bungalow', 'duplex', 'block_of_flats')),
    product_id INTEGER NOT NULL REFERENCES products(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    unit_count INTEGER NOT NULL CHECK (unit_count >= 0),
    occupancy_status VARCHAR(20) NOT NULL CHECK (occupancy_status IN ('fully_occupied', 'vacant', 'under_construction')),
    classification VARCHAR(50) NOT NULL,
    gated BOOLEAN NOT NULL DEFAULT FALSE,
    has_security BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_estates_product_id ON estates(product_id);
CREATE INDEX idx_estates_area_id ON estates(area_id);
CREATE INDEX idx_estates_occupancy_status ON estates(occupancy_status);

-- Creating estate_units table
CREATE TABLE estate_units (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id),
    unit_type VARCHAR(100) NOT NULL,
    floor_level VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('occupied', 'vacant', 'under_construction')),
    last_surveyed_at TIMESTAMP,
    rent_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_estate_units_estate_id ON estate_units(estate_id);
CREATE INDEX idx_estate_units_status ON estate_units(status);
CREATE INDEX idx_estate_units_unit_type ON estate_units(unit_type);

-- Creating price_trends table
CREATE TABLE price_trends (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    unit_type VARCHAR(100) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('rent', 'sale')),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    period DATE NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_price_trends_product_id ON price_trends(product_id);
CREATE INDEX idx_price_trends_area_id ON price_trends(area_id);
CREATE INDEX idx_price_trends_period ON price_trends(period);
CREATE INDEX idx_price_trends_unit_type_price_type ON price_trends(unit_type, price_type);