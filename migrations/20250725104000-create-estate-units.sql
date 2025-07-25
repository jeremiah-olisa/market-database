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