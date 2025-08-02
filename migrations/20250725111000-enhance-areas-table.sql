-- Enhance areas table with geospatial support and market intelligence fields
-- This migration adds PostGIS geometry fields and economic indicators

-- Add PostGIS geometry field for location-based analytics
ALTER TABLE areas ADD COLUMN geometry GEOMETRY(POINT, 4326);

-- Add population and demographic metrics
ALTER TABLE areas ADD COLUMN population_density DECIMAL(10,2) 
CHECK (population_density >= 0);

ALTER TABLE areas ADD COLUMN total_population INTEGER 
CHECK (total_population >= 0);

-- Add economic activity indicators
ALTER TABLE areas ADD COLUMN economic_activity_score INTEGER 
CHECK (economic_activity_score >= 1 AND economic_activity_score <= 5);

ALTER TABLE areas ADD COLUMN business_count INTEGER DEFAULT 0 
CHECK (business_count >= 0);

ALTER TABLE areas ADD COLUMN commercial_activity_level VARCHAR(20) 
CHECK (commercial_activity_level IN ('low', 'medium', 'high', 'very_high'));

-- Add infrastructure and connectivity metrics
ALTER TABLE areas ADD COLUMN internet_penetration_rate DECIMAL(5,2) 
CHECK (internet_penetration_rate >= 0 AND internet_penetration_rate <= 100);

ALTER TABLE areas ADD COLUMN power_grid_stability INTEGER 
CHECK (power_grid_stability >= 1 AND power_grid_stability <= 5);

ALTER TABLE areas ADD COLUMN road_infrastructure_quality INTEGER 
CHECK (road_infrastructure_quality >= 1 AND road_infrastructure_quality <= 5);

-- Add market indicators
ALTER TABLE areas ADD COLUMN market_maturity VARCHAR(20) 
CHECK (market_maturity IN ('emerging', 'developing', 'mature', 'saturated'));

ALTER TABLE areas ADD COLUMN competition_level INTEGER 
CHECK (competition_level >= 1 AND competition_level <= 5);

ALTER TABLE areas ADD COLUMN growth_potential VARCHAR(20) 
CHECK (growth_potential IN ('low', 'medium', 'high', 'very_high'));

-- Add accessibility and location factors
ALTER TABLE areas ADD COLUMN distance_to_city_center DECIMAL(8,2) 
CHECK (distance_to_city_center >= 0);

ALTER TABLE areas ADD COLUMN public_transport_access BOOLEAN DEFAULT FALSE;

ALTER TABLE areas ADD COLUMN major_landmarks JSONB DEFAULT '[]'::JSONB;

-- Add regulatory and administrative data
ALTER TABLE areas ADD COLUMN administrative_zone VARCHAR(100);
ALTER TABLE areas ADD COLUMN development_restrictions JSONB DEFAULT '{}'::JSONB;
ALTER TABLE areas ADD COLUMN zoning_classification VARCHAR(50);

-- Add market analysis timestamp
ALTER TABLE areas ADD COLUMN market_analysis_updated_at TIMESTAMP;

-- Create spatial index for geometry field
CREATE INDEX idx_areas_geometry ON areas USING GIST(geometry);

-- Create indexes for new fields
CREATE INDEX idx_areas_population_density ON areas(population_density);
CREATE INDEX idx_areas_economic_activity ON areas(economic_activity_score);
CREATE INDEX idx_areas_business_count ON areas(business_count);
CREATE INDEX idx_areas_commercial_activity ON areas(commercial_activity_level);
CREATE INDEX idx_areas_internet_penetration ON areas(internet_penetration_rate);
CREATE INDEX idx_areas_market_maturity ON areas(market_maturity);
CREATE INDEX idx_areas_competition_level ON areas(competition_level);
CREATE INDEX idx_areas_growth_potential ON areas(growth_potential);
CREATE INDEX idx_areas_distance_to_center ON areas(distance_to_city_center);
CREATE INDEX idx_areas_public_transport ON areas(public_transport_access);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_areas_landmarks_gin ON areas USING GIN(major_landmarks);
CREATE INDEX idx_areas_restrictions_gin ON areas USING GIN(development_restrictions);

-- Create compound indexes for common query patterns
CREATE INDEX idx_areas_economic_competition ON areas(economic_activity_score, competition_level);
CREATE INDEX idx_areas_maturity_growth ON areas(market_maturity, growth_potential);
CREATE INDEX idx_areas_state_activity ON areas(state, economic_activity_score);

-- Add constraint for coordinate validation (Nigeria boundaries)
-- Nigeria coordinates roughly: Longitude 2.7°E to 14.7°E, Latitude 4.3°N to 13.9°N
ALTER TABLE areas ADD CONSTRAINT check_nigeria_coordinates 
CHECK (
    geometry IS NULL OR 
    (ST_X(geometry) BETWEEN 2.7 AND 14.7 AND ST_Y(geometry) BETWEEN 4.3 AND 13.9)
);

-- Create trigger to update market analysis timestamp
CREATE OR REPLACE FUNCTION update_areas_market_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Update market analysis timestamp when relevant fields change
    IF (NEW.economic_activity_score IS DISTINCT FROM OLD.economic_activity_score OR
        NEW.commercial_activity_level IS DISTINCT FROM OLD.commercial_activity_level OR
        NEW.market_maturity IS DISTINCT FROM OLD.market_maturity OR
        NEW.competition_level IS DISTINCT FROM OLD.competition_level OR
        NEW.growth_potential IS DISTINCT FROM OLD.growth_potential OR
        NEW.internet_penetration_rate IS DISTINCT FROM OLD.internet_penetration_rate) THEN
        NEW.market_analysis_updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER areas_market_analysis_trigger
    BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_areas_market_analysis();