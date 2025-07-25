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