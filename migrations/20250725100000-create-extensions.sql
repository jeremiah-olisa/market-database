-- Enable PostgreSQL extensions required for Market Intelligence Database v2
-- This migration enables geospatial, full-text search, and JSON indexing capabilities

-- Enable PostGIS extension for geospatial support
-- This provides geometry data types and spatial functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm extension for full-text search capabilities
-- This provides trigram matching for text search operations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin extension for JSON indexing
-- This provides GIN indexing support for JSONB fields
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Verify extensions are properly installed
-- This will help with debugging if extensions fail to load
DO $$
BEGIN
    -- Check if PostGIS is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        RAISE EXCEPTION 'PostGIS extension failed to install';
    END IF;
    
    -- Check if pg_trgm is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        RAISE EXCEPTION 'pg_trgm extension failed to install';
    END IF;
    
    -- Check if btree_gin is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'btree_gin') THEN
        RAISE EXCEPTION 'btree_gin extension failed to install';
    END IF;
    
    -- Verify JSON/JSONB support (built-in since PostgreSQL 9.4+)
    -- Test creating a sample JSONB column
    CREATE TEMP TABLE jsonb_test (data JSONB);
    INSERT INTO jsonb_test VALUES ('{"test": "success"}');
    
    RAISE NOTICE 'All extensions installed successfully: PostGIS, pg_trgm, btree_gin, and JSONB support verified';
END $$;