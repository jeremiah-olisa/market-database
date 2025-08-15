-- Enable PostgreSQL extensions for enhanced functionality
-- This migration enables PostGIS, full-text search, and JSON indexing capabilities

-- Enable PostGIS extension for geospatial support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm extension for full-text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin extension for JSON indexing
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Verify extensions are enabled
SELECT 
    extname, 
    extversion 
FROM pg_extension 
WHERE extname IN ('postgis', 'pg_trgm', 'btree_gin');
