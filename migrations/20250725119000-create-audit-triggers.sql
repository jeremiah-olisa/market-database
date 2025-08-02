-- Create comprehensive audit triggers for critical data tracking
-- This migration implements audit trail functionality for key business tables

-- Enhanced audit function for estate changes
CREATE OR REPLACE FUNCTION audit_estate_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES ('estates', NEW.id, 'INSERT', NULL, to_json(NEW), CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES ('estates', NEW.id, 'UPDATE', to_json(OLD), to_json(NEW), CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES ('estates', OLD.id, 'DELETE', to_json(OLD), NULL, CURRENT_USER);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create estate audit trigger
CREATE TRIGGER estate_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON estates
    FOR EACH ROW EXECUTE FUNCTION audit_estate_changes();

-- Generic audit function for market intelligence tables
CREATE OR REPLACE FUNCTION audit_market_intelligence_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, to_json(NEW), CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_json(OLD), to_json(NEW), CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_json(OLD), NULL, CURRENT_USER);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for service providers
CREATE TRIGGER service_providers_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Create audit triggers for provider coverage
CREATE TRIGGER provider_coverage_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON provider_coverage
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Create audit triggers for market share data
CREATE TRIGGER market_share_data_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON market_share_data
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Create audit triggers for customer profiles
CREATE TRIGGER customer_profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Create audit triggers for infrastructure investments
CREATE TRIGGER infrastructure_investments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON infrastructure_investments
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Create audit triggers for revenue analytics
CREATE TRIGGER revenue_analytics_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON revenue_analytics
    FOR EACH ROW EXECUTE FUNCTION audit_market_intelligence_changes();

-- Audit function for sensitive customer data changes
CREATE OR REPLACE FUNCTION audit_customer_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', 
                NULL, 
                jsonb_build_object(
                    'customer_hash', NEW.customer_hash,
                    'estate_id', NEW.estate_id,
                    'customer_segment', NEW.customer_segment,
                    'data_sharing_consent', NEW.data_sharing_consent,
                    'marketing_consent', NEW.marketing_consent
                ), 
                CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only audit significant changes to avoid excessive logging
        IF (OLD.customer_segment IS DISTINCT FROM NEW.customer_segment OR
            OLD.data_sharing_consent IS DISTINCT FROM NEW.data_sharing_consent OR
            OLD.marketing_consent IS DISTINCT FROM NEW.marketing_consent OR
            OLD.customer_status IS DISTINCT FROM NEW.customer_status OR
            OLD.churn_risk_score IS DISTINCT FROM NEW.churn_risk_score) THEN
            
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', 
                    jsonb_build_object(
                        'customer_segment', OLD.customer_segment,
                        'data_sharing_consent', OLD.data_sharing_consent,
                        'marketing_consent', OLD.marketing_consent,
                        'customer_status', OLD.customer_status,
                        'churn_risk_score', OLD.churn_risk_score
                    ),
                    jsonb_build_object(
                        'customer_segment', NEW.customer_segment,
                        'data_sharing_consent', NEW.data_sharing_consent,
                        'marketing_consent', NEW.marketing_consent,
                        'customer_status', NEW.customer_status,
                        'churn_risk_score', NEW.churn_risk_score
                    ), 
                    CURRENT_USER);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', 
                jsonb_build_object(
                    'customer_hash', OLD.customer_hash,
                    'estate_id', OLD.estate_id,
                    'customer_segment', OLD.customer_segment
                ), 
                NULL, 
                CURRENT_USER);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply customer data audit trigger
CREATE TRIGGER customer_profiles_sensitive_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_customer_data_changes();

-- Financial data audit function
CREATE OR REPLACE FUNCTION audit_financial_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, 
                jsonb_build_object(
                    'estate_id', NEW.estate_id,
                    'amount', NEW.amount,
                    'period', NEW.period,
                    'revenue_type', COALESCE(NEW.revenue_type, NEW.investment_type)
                ), 
                CURRENT_USER);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only audit financial amount changes
        IF (OLD.amount IS DISTINCT FROM NEW.amount) THEN
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', 
                    jsonb_build_object('amount', OLD.amount),
                    jsonb_build_object('amount', NEW.amount), 
                    CURRENT_USER);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', 
                jsonb_build_object(
                    'estate_id', OLD.estate_id,
                    'amount', OLD.amount
                ), 
                NULL, 
                CURRENT_USER);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply financial audit triggers
CREATE TRIGGER revenue_analytics_financial_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON revenue_analytics
    FOR EACH ROW EXECUTE FUNCTION audit_financial_data_changes();

CREATE TRIGGER investment_tracking_financial_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON investment_tracking
    FOR EACH ROW EXECUTE FUNCTION audit_financial_data_changes();

-- Business intelligence data validation function
CREATE OR REPLACE FUNCTION validate_business_intelligence_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate market share percentages don't exceed 100% per estate
    IF TG_TABLE_NAME = 'market_share_data' THEN
        IF (SELECT SUM(market_share) 
            FROM market_share_data 
            WHERE estate_id = NEW.estate_id AND period = NEW.period AND id != COALESCE(NEW.id, 0)) + NEW.market_share > 100 THEN
            RAISE EXCEPTION 'Total market share for estate % in period % would exceed 100%%', NEW.estate_id, NEW.period;
        END IF;
    END IF;
    
    -- Validate customer metrics consistency
    IF TG_TABLE_NAME = 'customer_profiles' THEN
        IF NEW.monthly_spend_average < 0 THEN
            RAISE EXCEPTION 'Monthly spend average cannot be negative';
        END IF;
        
        IF NEW.churn_risk_score IS NOT NULL AND (NEW.churn_risk_score < 1 OR NEW.churn_risk_score > 5) THEN
            RAISE EXCEPTION 'Churn risk score must be between 1 and 5';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
CREATE TRIGGER market_share_data_validation_trigger
    BEFORE INSERT OR UPDATE ON market_share_data
    FOR EACH ROW EXECUTE FUNCTION validate_business_intelligence_data();

CREATE TRIGGER customer_profiles_validation_trigger
    BEFORE INSERT OR UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION validate_business_intelligence_data();

-- Create audit cleanup function to manage audit log size
CREATE OR REPLACE FUNCTION cleanup_audit_log()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit records older than 2 years for most tables
    DELETE FROM audit_log 
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years'
    AND table_name NOT IN ('customer_profiles', 'revenue_analytics', 'investment_tracking');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Keep customer and financial data for 5 years
    DELETE FROM audit_log 
    WHERE created_at < CURRENT_DATE - INTERVAL '5 years'
    AND table_name IN ('customer_profiles', 'revenue_analytics', 'investment_tracking');
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for audit trail analysis
CREATE VIEW audit_trail_summary AS
SELECT 
    table_name,
    action,
    DATE_TRUNC('day', created_at) as audit_date,
    COUNT(*) as change_count,
    COUNT(DISTINCT record_id) as affected_records,
    COUNT(DISTINCT created_by) as users_involved
FROM audit_log
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY table_name, action, DATE_TRUNC('day', created_at)
ORDER BY audit_date DESC, table_name, action;