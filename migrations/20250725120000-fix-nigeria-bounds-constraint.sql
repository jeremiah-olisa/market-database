-- Add Nigeria bounds constraint and geospatial validation after all tables are created
-- This ensures that the constraint is added after the table structure is complete

-- Add constraint to ensure geometry is within Nigeria bounds for demographics table
ALTER TABLE demographics ADD CONSTRAINT check_nigeria_bounds 
    CHECK (ST_Within(geometry, ST_GeomFromText('POLYGON((2.691702 3.3792, 14.577178 3.3792, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3792))', 4326)));

-- Create geospatial validation function
CREATE OR REPLACE FUNCTION validate_geospatial_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure geometry is within Nigeria bounds
    IF NEW.geometry IS NOT NULL THEN
        IF NOT ST_Within(NEW.geometry, ST_GeomFromText('POLYGON((2.691702 3.3792, 14.577178 3.3792, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3792))', 4326)) THEN
            RAISE EXCEPTION 'Geometry must be within Nigeria bounds';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create geospatial validation triggers for tables with geometry
-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS geospatial_validation_areas ON areas;
DROP TRIGGER IF EXISTS geospatial_validation_demographics ON demographics;

CREATE TRIGGER geospatial_validation_areas
    BEFORE INSERT OR UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION validate_geospatial_data();

CREATE TRIGGER geospatial_validation_demographics
    BEFORE INSERT OR UPDATE ON demographics
    FOR EACH ROW EXECUTE FUNCTION validate_geospatial_data();

-- Note: local_businesses table might not exist yet, so we'll add that trigger separately if needed
