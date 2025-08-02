-- Create estate metadata table for flexible JSON metadata storage
-- This table allows dynamic storage of estate characteristics and attributes

CREATE TABLE estate_metadata (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Metadata categorization
    metadata_type VARCHAR(100) NOT NULL,
    -- Examples: 'infrastructure', 'amenities', 'security', 'commercial', 'accessibility'
    
    metadata_key VARCHAR(255) NOT NULL,
    -- Examples: 'fiber_coverage', 'swimming_pool', 'cctv_cameras', 'shopping_centers', 'public_transport'
    
    -- Flexible metadata storage using JSONB
    metadata_value JSONB NOT NULL,
    -- Examples: 
    -- {"coverage": "full", "speed": "1000mbps", "provider": "techosphere"}
    -- {"available": true, "count": 2, "size": "olympic", "maintenance": "weekly"}
    -- {"cameras": 50, "guards": 10, "access_control": "biometric", "patrol_frequency": "hourly"}
    
    -- Data source and validation
    data_source VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by VARCHAR(100),
    
    -- Metadata priority and visibility
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient metadata queries
CREATE INDEX idx_estate_metadata_estate_id ON estate_metadata(estate_id);
CREATE INDEX idx_estate_metadata_type ON estate_metadata(metadata_type);
CREATE INDEX idx_estate_metadata_key ON estate_metadata(metadata_key);
CREATE INDEX idx_estate_metadata_verified ON estate_metadata(is_verified);
CREATE INDEX idx_estate_metadata_priority ON estate_metadata(priority);

-- Create GIN index for JSONB metadata searches
CREATE INDEX idx_estate_metadata_value_gin ON estate_metadata USING GIN(metadata_value);

-- Create compound indexes for common query patterns
CREATE INDEX idx_estate_metadata_estate_type ON estate_metadata(estate_id, metadata_type);
CREATE INDEX idx_estate_metadata_type_key ON estate_metadata(metadata_type, metadata_key);

-- Create unique constraint to prevent duplicate metadata entries
CREATE UNIQUE INDEX idx_estate_metadata_unique 
ON estate_metadata(estate_id, metadata_type, metadata_key);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_estate_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER estate_metadata_updated_at_trigger
    BEFORE UPDATE ON estate_metadata
    FOR EACH ROW EXECUTE FUNCTION update_estate_metadata_updated_at();