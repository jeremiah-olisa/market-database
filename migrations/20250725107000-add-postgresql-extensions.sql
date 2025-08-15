-- Enable PostgreSQL extensions for enhanced functionality
-- This migration enables PostGIS, full-text search, and JSON indexing capabilities

-- Enable PostGIS extension for geospatial support (only if available)
DO $$ 
BEGIN
    -- Check if PostGIS is available before trying to create it
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'postgis'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS postgis;
        RAISE NOTICE 'PostGIS extension enabled successfully';
    ELSE
        RAISE WARNING 'PostGIS extension is not available - geographic features will be limited';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not enable PostGIS extension: %', SQLERRM;
END $$;

-- Enable pg_trgm extension for full-text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin extension for JSON indexing
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Verify extensions are enabled
SELECT 
    extname, 
    extversion,
    CASE 
        WHEN extname = 'postgis' THEN 'Geographic/spatial data support'
        WHEN extname = 'pg_trgm' THEN 'Full-text search capabilities'
        WHEN extname = 'btree_gin' THEN 'JSON indexing support'
        ELSE 'Unknown extension'
    END as description
FROM pg_extension 
WHERE extname IN ('postgis', 'pg_trgm', 'btree_gin')
ORDER BY extname;
