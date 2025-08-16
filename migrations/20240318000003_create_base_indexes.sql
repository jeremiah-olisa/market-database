-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Areas indexes
CREATE INDEX IF NOT EXISTS idx_areas_state ON areas(state);
CREATE INDEX IF NOT EXISTS idx_areas_geometry ON areas USING GIST(geometry);

-- Estates indexes
CREATE INDEX IF NOT EXISTS idx_estates_product_id ON estates(product_id);
CREATE INDEX IF NOT EXISTS idx_estates_area_id ON estates(area_id);
CREATE INDEX IF NOT EXISTS idx_estates_classification ON estates(classification);
CREATE INDEX IF NOT EXISTS idx_estates_occupancy_status ON estates(occupancy_status);
CREATE INDEX IF NOT EXISTS idx_estates_geometry ON estates USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_estates_composite_location 
    ON estates(area_id, classification, occupancy_status);

-- Estate units indexes
CREATE INDEX IF NOT EXISTS idx_estate_units_estate_id ON estate_units(estate_id);
CREATE INDEX IF NOT EXISTS idx_estate_units_status ON estate_units(status);
CREATE INDEX IF NOT EXISTS idx_estate_units_unit_type ON estate_units(unit_type);
CREATE INDEX IF NOT EXISTS idx_estate_units_composite_price 
    ON estate_units(estate_id, status) 
    WHERE rent_price IS NOT NULL OR sale_price IS NOT NULL;

-- Price trends indexes
CREATE INDEX IF NOT EXISTS idx_price_trends_product_id ON price_trends(product_id);
CREATE INDEX IF NOT EXISTS idx_price_trends_area_id ON price_trends(area_id);
CREATE INDEX IF NOT EXISTS idx_price_trends_period ON price_trends(period);
CREATE INDEX IF NOT EXISTS idx_price_trends_composite 
    ON price_trends(area_id, unit_type, period, price_type);
