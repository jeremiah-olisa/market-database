-- Create migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS "__migrations" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL, -- Store hash of migration content for integrity check
    UNIQUE(name)
);

-- Create function to check if migration has been applied
CREATE OR REPLACE FUNCTION has_migration(migration_name VARCHAR) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM "__migrations" 
        WHERE name = migration_name
    );
END;
$$ LANGUAGE plpgsql;
