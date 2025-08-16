-- Create demographics table for population and demographic data per estate
-- This table supports geospatial analysis and demographic intelligence

CREATE TABLE demographics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    population INTEGER NOT NULL CHECK (population >= 0),
    age_groups JSONB NOT NULL, -- {"18-25": 15, "26-35": 30, "36-50": 35, "50+": 20}
    income_levels JSONB NOT NULL, -- {"low": 20, "middle": 50, "high": 30}
    education_levels JSONB, -- {"primary": 10, "secondary": 40, "tertiary": 50}
    household_size DECIMAL(4,2),
    employment_rate DECIMAL(5,2),
    geometry GEOMETRY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for demographics table
CREATE INDEX idx_demographics_estate_id ON demographics(estate_id);
CREATE INDEX idx_demographics_population ON demographics(population);
CREATE INDEX idx_demographics_geometry ON demographics USING GIST(geometry);
CREATE INDEX idx_demographics_age_groups_gin ON demographics USING GIN(age_groups);
CREATE INDEX idx_demographics_income_levels_gin ON demographics USING GIN(income_levels);

-- Note: Nigeria bounds constraint will be added in a separate migration after table creation

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_demographics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER demographics_updated_at_trigger
    BEFORE UPDATE ON demographics
    FOR EACH ROW EXECUTE FUNCTION update_demographics_updated_at();
