-- Fix Nigeria bounds constraint to use correct coordinates
-- The previous constraint was using incorrect northern boundary that excluded Lagos

-- Drop the existing incorrect constraint
ALTER TABLE demographics DROP CONSTRAINT IF EXISTS check_nigeria_bounds;

-- Add the correct constraint with proper Nigeria bounds
-- Coordinates: (2.691702 3.3792, 14.577178 3.3792, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3792)
-- This includes Lagos (around 3.3792 latitude) and covers the full extent of Nigeria
ALTER TABLE demographics ADD CONSTRAINT check_nigeria_bounds 
    CHECK (ST_Within(geometry, ST_GeomFromText('POLYGON((2.691702 3.3000, 14.577178 3.3000, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3000))', 4326)));

-- Update the geospatial validation function to use the correct bounds
CREATE OR REPLACE FUNCTION validate_geospatial_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure geometry is within Nigeria bounds
    IF NEW.geometry IS NOT NULL THEN
        IF NOT ST_Within(NEW.geometry, ST_GeomFromText('POLYGON((2.691702 3.3000, 14.577178 3.3000, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3000))', 4326)) THEN
            RAISE EXCEPTION 'Geometry must be within Nigeria bounds';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
