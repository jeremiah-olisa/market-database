-- Create demographics table for population and demographic data per estate
-- This table supports market intelligence and customer segmentation analysis

CREATE TABLE demographics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Population metrics
    population INTEGER NOT NULL CHECK (population >= 0),
    households INTEGER CHECK (households >= 0),
    population_density DECIMAL(10,2) CHECK (population_density >= 0),
    
    -- Age group distributions (stored as percentages)
    age_groups JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Example: {"0-17": 25, "18-25": 15, "26-35": 30, "36-50": 20, "51-65": 8, "65+": 2}
    
    -- Income level distributions (stored as percentages)
    income_levels JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Example: {"low": 20, "lower_middle": 25, "middle": 30, "upper_middle": 20, "high": 5}
    
    -- Education level distributions (stored as percentages)
    education_levels JSONB DEFAULT '{}'::JSONB,
    -- Example: {"primary": 15, "secondary": 40, "tertiary": 35, "postgraduate": 10}
    
    -- Employment sector distributions (stored as percentages)
    employment_sectors JSONB DEFAULT '{}'::JSONB,
    -- Example: {"government": 30, "private": 45, "business": 15, "unemployed": 10}
    
    -- Geospatial data for location-based analytics
    geometry GEOMETRY(POINT, 4326),
    
    -- Lifestyle and socioeconomic indicators
    average_income DECIMAL(12,2) CHECK (average_income >= 0),
    median_rent DECIMAL(10,2) CHECK (median_rent >= 0),
    vehicle_ownership_rate DECIMAL(5,2) CHECK (vehicle_ownership_rate >= 0 AND vehicle_ownership_rate <= 100),
    internet_penetration_rate DECIMAL(5,2) CHECK (internet_penetration_rate >= 0 AND internet_penetration_rate <= 100),
    
    -- Data source and quality metrics
    data_source VARCHAR(100),
    data_quality_score INTEGER CHECK (data_quality_score >= 1 AND data_quality_score <= 5),
    last_surveyed_at TIMESTAMP,
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient demographic queries
CREATE INDEX idx_demographics_estate_id ON demographics(estate_id);
CREATE INDEX idx_demographics_population ON demographics(population);
CREATE INDEX idx_demographics_avg_income ON demographics(average_income);
CREATE INDEX idx_demographics_data_quality ON demographics(data_quality_score);
CREATE INDEX idx_demographics_last_surveyed ON demographics(last_surveyed_at);

-- Create spatial index for location-based queries
CREATE INDEX idx_demographics_geometry ON demographics USING GIST(geometry);

-- Create GIN indexes for JSONB demographic data
CREATE INDEX idx_demographics_age_groups ON demographics USING GIN(age_groups);
CREATE INDEX idx_demographics_income_levels ON demographics USING GIN(income_levels);
CREATE INDEX idx_demographics_education_levels ON demographics USING GIN(education_levels);
CREATE INDEX idx_demographics_employment_sectors ON demographics USING GIN(employment_sectors);

-- Add constraints for JSON structure validation
ALTER TABLE demographics ADD CONSTRAINT check_age_groups_sum 
CHECK (
    -- Age group percentages should roughly sum to 100 (allow 5% tolerance for rounding)
    (age_groups->>'0-17')::DECIMAL + (age_groups->>'18-25')::DECIMAL + 
    (age_groups->>'26-35')::DECIMAL + (age_groups->>'36-50')::DECIMAL + 
    (age_groups->>'51-65')::DECIMAL + (age_groups->>'65+')::DECIMAL 
    BETWEEN 95 AND 105
);

-- Create trigger to update updated_at timestamp
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