-- Create audit log table for tracking data changes
-- This table provides audit trail functionality for critical data modifications

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    -- Additional metadata for comprehensive audit tracking
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for efficient audit log queries
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_by ON audit_log(created_by);

-- Create a partial index for recent audit entries
CREATE INDEX idx_audit_log_recent ON audit_log(created_at DESC, table_name) 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';