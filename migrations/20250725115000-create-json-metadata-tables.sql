-- Create JSON metadata tables for flexible data storage and extensibility
-- This migration adds tables for storing dynamic metadata and configuration data

-- Dynamic metadata storage table
CREATE TABLE dynamic_metadata (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL, -- 'estate', 'area', 'product', 'customer', etc.
    entity_id INTEGER NOT NULL,
    metadata_key VARCHAR(255) NOT NULL,
    metadata_value JSONB NOT NULL,
    metadata_type VARCHAR(50) NOT NULL CHECK (metadata_type IN ('string', 'number', 'boolean', 'array', 'object')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    validation_rules JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, metadata_key)
);

-- Configuration and settings table
CREATE TABLE system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('system', 'business', 'user', 'integration')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data validation rules table
CREATE TABLE validation_rules (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('regex', 'range', 'enum', 'custom', 'foreign_key')),
    rule_definition JSONB NOT NULL,
    error_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, column_name, rule_type)
);

-- Audit trail for metadata changes
CREATE TABLE metadata_audit_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    metadata_key VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('insert', 'update', 'delete')),
    changed_by VARCHAR(100),
    change_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for JSON metadata tables
CREATE INDEX idx_dynamic_metadata_entity ON dynamic_metadata(entity_type, entity_id);
CREATE INDEX idx_dynamic_metadata_key ON dynamic_metadata(metadata_key);
CREATE INDEX idx_dynamic_metadata_type ON dynamic_metadata(metadata_type);
CREATE INDEX idx_dynamic_metadata_value_gin ON dynamic_metadata USING GIN(metadata_value);
CREATE INDEX idx_dynamic_metadata_required ON dynamic_metadata(is_required);

CREATE INDEX idx_system_configurations_key ON system_configurations(config_key);
CREATE INDEX idx_system_configurations_type ON system_configurations(config_type);
CREATE INDEX idx_system_configurations_active ON system_configurations(is_active);
CREATE INDEX idx_system_configurations_value_gin ON system_configurations USING GIN(config_value);

CREATE INDEX idx_validation_rules_table ON validation_rules(table_name);
CREATE INDEX idx_validation_rules_column ON validation_rules(column_name);
CREATE INDEX idx_validation_rules_type ON validation_rules(rule_type);
CREATE INDEX idx_validation_rules_active ON validation_rules(is_active);
CREATE INDEX idx_validation_rules_definition_gin ON validation_rules USING GIN(rule_definition);

CREATE INDEX idx_metadata_audit_log_entity ON metadata_audit_log(entity_type, entity_id);
CREATE INDEX idx_metadata_audit_log_key ON metadata_audit_log(metadata_key);
CREATE INDEX idx_metadata_audit_log_type ON metadata_audit_log(change_type);
CREATE INDEX idx_metadata_audit_log_created ON metadata_audit_log(created_at);

-- Add compound indexes for improved query performance
CREATE INDEX idx_dynamic_metadata_entity_key ON dynamic_metadata(entity_type, entity_id, metadata_key);
CREATE INDEX idx_validation_rules_table_column ON validation_rules(table_name, column_name);
CREATE INDEX idx_metadata_audit_log_entity_key ON metadata_audit_log(entity_type, entity_id, metadata_key);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_metadata_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dynamic_metadata_updated_at_trigger
    BEFORE UPDATE ON dynamic_metadata
    FOR EACH ROW EXECUTE FUNCTION update_metadata_tables_updated_at();

CREATE TRIGGER system_configurations_updated_at_trigger
    BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION update_metadata_tables_updated_at();

CREATE TRIGGER validation_rules_updated_at_trigger
    BEFORE UPDATE ON validation_rules
    FOR EACH ROW EXECUTE FUNCTION update_metadata_tables_updated_at();

-- Insert default system configurations
INSERT INTO system_configurations (config_key, config_value, config_type, description) VALUES
('system.timezone', '"Africa/Lagos"', 'system', 'Default timezone for the system'),
('business.currency', '"NGN"', 'business', 'Default currency for business operations'),
('business.country', '"Nigeria"', 'business', 'Primary country of operation'),
('validation.default_rules', '{"email": {"regex": "^[^@]+@[^@]+\\.[^@]+$"}, "phone": {"regex": "^\\+?[0-9]{10,15}$"}}', 'system', 'Default validation rules for common fields');
