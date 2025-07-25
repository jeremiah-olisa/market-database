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