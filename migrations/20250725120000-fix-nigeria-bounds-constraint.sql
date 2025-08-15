-- Fix Nigeria bounds constraint for demographics table
-- The previous constraint had incorrect coordinate bounds that excluded valid Nigerian locations

-- Drop the existing constraint
ALTER TABLE demographics DROP CONSTRAINT IF EXISTS check_nigeria_bounds;

-- Recreate the constraint with correct Nigeria bounds
-- Nigeria spans approximately from longitude 2.691702 to 14.577178 and latitude 3.3792 to 13.892007
ALTER TABLE demographics ADD CONSTRAINT check_nigeria_bounds 
    CHECK (ST_Within(geometry, ST_GeomFromText('POLYGON((2.691702 3.3792, 14.577178 3.3792, 14.577178 13.892007, 2.691702 13.892007, 2.691702 3.3792))', 4326)));

-- Also update the trigger function to use the correct bounds
CREATE OR REPLACE FUNCTION validate_nigeria_bounds()
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
