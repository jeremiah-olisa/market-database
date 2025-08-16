-- Data validation, constraints, and system integrity checks
-- This migration implements comprehensive data validation and business rules

-- Create check constraints for data integrity
ALTER TABLE estates ADD CONSTRAINT check_market_potential_score 
    CHECK (market_potential_score >= 0 AND market_potential_score <= 100);

ALTER TABLE estates ADD CONSTRAINT check_competitive_intensity 
    CHECK (competitive_intensity >= 1 AND competitive_intensity <= 10);

ALTER TABLE demographics ADD CONSTRAINT check_population_positive 
    CHECK (population > 0);

ALTER TABLE demographics ADD CONSTRAINT check_employment_rate 
    CHECK (employment_rate >= 0 AND employment_rate <= 100);

ALTER TABLE demographics ADD CONSTRAINT check_household_size 
    CHECK (household_size > 0 AND household_size <= 10);

ALTER TABLE revenue_metrics ADD CONSTRAINT check_revenue_positive 
    CHECK (revenue_amount > 0);

ALTER TABLE revenue_metrics ADD CONSTRAINT check_customer_count_positive 
    CHECK (customer_count > 0);

ALTER TABLE revenue_metrics ADD CONSTRAINT check_average_revenue_positive 
    CHECK (average_revenue_per_customer > 0);

ALTER TABLE cost_metrics ADD CONSTRAINT check_cost_positive 
    CHECK (amount > 0);

ALTER TABLE profitability_analysis ADD CONSTRAINT check_profit_margin 
    CHECK (profit_margin_percentage >= -100 AND profit_margin_percentage <= 100);

ALTER TABLE profitability_analysis ADD CONSTRAINT check_roi_percentage 
    CHECK (roi_percentage >= -100 AND roi_percentage <= 1000);

ALTER TABLE customer_profiles ADD CONSTRAINT check_satisfaction_score 
    CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5);

ALTER TABLE customer_profiles ADD CONSTRAINT check_tenure_months 
    CHECK (tenure_months >= 0);

ALTER TABLE usage_patterns ADD CONSTRAINT check_data_consumption 
    CHECK (data_consumption_gb IS NULL OR data_consumption_gb >= 0);

ALTER TABLE usage_patterns ADD CONSTRAINT check_service_quality 
    CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5);

ALTER TABLE network_infrastructure ADD CONSTRAINT check_capacity_positive 
    CHECK (capacity_mbps > 0);

ALTER TABLE network_infrastructure ADD CONSTRAINT check_utilization_percentage 
    CHECK (current_utilization_percentage >= 0 AND current_utilization_percentage <= 100);

ALTER TABLE network_infrastructure ADD CONSTRAINT check_reliability_score 
    CHECK (reliability_score >= 0 AND reliability_score <= 100);

ALTER TABLE capacity_metrics ADD CONSTRAINT check_utilization_values 
    CHECK (current_utilization >= 0 AND current_utilization <= 100);

ALTER TABLE capacity_metrics ADD CONSTRAINT check_peak_utilization 
    CHECK (peak_utilization >= 0 AND peak_utilization <= 100);

ALTER TABLE capacity_metrics ADD CONSTRAINT check_availability_percentage 
    CHECK (availability_percentage >= 0 AND availability_percentage <= 100);

-- Create business rule constraints
ALTER TABLE estates ADD CONSTRAINT check_platinum_requirements 
    CHECK (
        (tier_classification != 'platinum') OR 
        (tier_classification = 'platinum' AND market_potential_score >= 80 AND competitive_intensity <= 3)
    );

ALTER TABLE estates ADD CONSTRAINT check_gold_requirements 
    CHECK (
        (tier_classification != 'gold') OR 
        (tier_classification = 'gold' AND market_potential_score >= 60 AND competitive_intensity <= 5)
    );

ALTER TABLE revenue_metrics ADD CONSTRAINT check_revenue_customer_consistency 
    CHECK (
        (customer_count = 0 AND revenue_amount = 0) OR 
        (customer_count > 0 AND revenue_amount > 0)
    );

ALTER TABLE profitability_analysis ADD CONSTRAINT check_profit_calculation 
    CHECK (gross_profit = total_revenue - total_costs);

ALTER TABLE profitability_analysis ADD CONSTRAINT check_net_profit_calculation 
    CHECK (net_profit <= gross_profit);

-- Create foreign key constraints for referential integrity
ALTER TABLE demographics ADD CONSTRAINT fk_demographics_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

-- Note: coverage_area is a GEOMETRY field, cannot reference VARCHAR areas.name
-- Spatial relationships are handled through PostGIS spatial queries instead

ALTER TABLE provider_coverage ADD CONSTRAINT fk_provider_coverage_provider 
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;

ALTER TABLE provider_coverage ADD CONSTRAINT fk_provider_coverage_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE service_offerings ADD CONSTRAINT fk_service_offerings_provider 
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;

ALTER TABLE market_share_data ADD CONSTRAINT fk_market_share_provider 
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;

ALTER TABLE market_share_data ADD CONSTRAINT fk_market_share_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE business_categories ADD CONSTRAINT fk_business_categories_business_type 
    CHECK (business_type IN ('retail', 'food_service', 'healthcare', 'education', 'entertainment', 'professional_services'));

ALTER TABLE local_businesses ADD CONSTRAINT fk_local_businesses_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE local_businesses ADD CONSTRAINT fk_local_businesses_category 
    FOREIGN KEY (category_id) REFERENCES business_categories(id) ON DELETE RESTRICT;

ALTER TABLE business_metadata ADD CONSTRAINT fk_business_metadata_business 
    FOREIGN KEY (business_id) REFERENCES local_businesses(id) ON DELETE CASCADE;

ALTER TABLE customer_profiles ADD CONSTRAINT fk_customer_profiles_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE usage_patterns ADD CONSTRAINT fk_usage_patterns_customer 
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE customer_feedback ADD CONSTRAINT fk_customer_feedback_customer 
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE cross_service_adoption ADD CONSTRAINT fk_cross_service_adoption_customer 
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE network_infrastructure ADD CONSTRAINT fk_network_infrastructure_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE capacity_metrics ADD CONSTRAINT fk_capacity_metrics_infrastructure 
    FOREIGN KEY (infrastructure_id) REFERENCES network_infrastructure(id) ON DELETE CASCADE;

ALTER TABLE infrastructure_investments ADD CONSTRAINT fk_infrastructure_investments_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE revenue_metrics ADD CONSTRAINT fk_revenue_metrics_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE revenue_metrics ADD CONSTRAINT fk_revenue_metrics_product 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

ALTER TABLE cost_metrics ADD CONSTRAINT fk_cost_metrics_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

ALTER TABLE profitability_analysis ADD CONSTRAINT fk_profitability_analysis_estate 
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;

-- Create unique constraints
ALTER TABLE estates ADD CONSTRAINT unique_estate_name_area 
    UNIQUE (name, area_id);

ALTER TABLE service_providers ADD CONSTRAINT unique_provider_name_service 
    UNIQUE (name, service_type);

ALTER TABLE business_categories ADD CONSTRAINT unique_category_name_type 
    UNIQUE (name, business_type);

ALTER TABLE local_businesses ADD CONSTRAINT unique_business_name_estate 
    UNIQUE (name, estate_id);

-- Create triggers for data validation
CREATE OR REPLACE FUNCTION validate_estate_tier_classification()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate tier classification based on market potential and competitive intensity
    IF NEW.tier_classification = 'platinum' AND (NEW.market_potential_score < 80 OR NEW.competitive_intensity > 3) THEN
        RAISE EXCEPTION 'Estate cannot be classified as platinum: market potential must be >= 80 and competitive intensity must be <= 3';
    END IF;
    
    IF NEW.tier_classification = 'gold' AND (NEW.market_potential_score < 60 OR NEW.competitive_intensity > 5) THEN
        RAISE EXCEPTION 'Estate cannot be classified as gold: market potential must be >= 60 and competitive intensity must be <= 5';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER estate_tier_classification_validation
    BEFORE INSERT OR UPDATE ON estates
    FOR EACH ROW EXECUTE FUNCTION validate_estate_tier_classification();

-- Create trigger for revenue consistency
CREATE OR REPLACE FUNCTION validate_revenue_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure revenue and customer count are consistent
    IF NEW.customer_count = 0 AND NEW.revenue_amount > 0 THEN
        RAISE EXCEPTION 'Revenue cannot be positive when customer count is zero';
    END IF;
    
    IF NEW.customer_count > 0 AND NEW.revenue_amount = 0 THEN
        RAISE EXCEPTION 'Revenue cannot be zero when customer count is positive';
    END IF;
    
    -- Validate average revenue per customer
    IF NEW.customer_count > 0 AND NEW.average_revenue_per_customer IS NOT NULL THEN
        IF ABS(NEW.average_revenue_per_customer - (NEW.revenue_amount / NEW.customer_count)) > 0.01 THEN
            RAISE EXCEPTION 'Average revenue per customer is inconsistent with total revenue and customer count';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revenue_consistency_validation
    BEFORE INSERT OR UPDATE ON revenue_metrics
    FOR EACH ROW EXECUTE FUNCTION validate_revenue_consistency();

-- Create trigger for profitability validation
CREATE OR REPLACE FUNCTION validate_profitability()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate profit calculations
    IF NEW.gross_profit != (NEW.total_revenue - NEW.total_costs) THEN
        RAISE EXCEPTION 'Gross profit must equal total revenue minus total costs';
    END IF;
    
    IF NEW.net_profit > NEW.gross_profit THEN
        RAISE EXCEPTION 'Net profit cannot exceed gross profit';
    END IF;
    
    -- Validate profit margin percentage
    IF NEW.total_revenue > 0 THEN
        IF ABS(NEW.profit_margin_percentage - ((NEW.net_profit / NEW.total_revenue) * 100)) > 0.01 THEN
            RAISE EXCEPTION 'Profit margin percentage is inconsistent with net profit and total revenue';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profitability_validation
    BEFORE INSERT OR UPDATE ON profitability_analysis
    FOR EACH ROW EXECUTE FUNCTION validate_profitability();

-- Create trigger for geospatial validation
CREATE OR REPLACE FUNCTION validate_geospatial_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure geometry is within Nigeria bounds
    IF NEW.geometry IS NOT NULL THEN
        IF NOT ST_Within(NEW.geometry, ST_GeomFromText('POLYGON((2.691702 6.258817, 14.577178 6.258817, 14.577178 13.892007, 2.691702 13.892007, 2.691702 6.258817))', 4326)) THEN
            RAISE EXCEPTION 'Geometry must be within Nigeria bounds';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER geospatial_validation_areas
    BEFORE INSERT OR UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION validate_geospatial_data();

CREATE TRIGGER geospatial_validation_demographics
    BEFORE INSERT OR UPDATE ON demographics
    FOR EACH ROW EXECUTE FUNCTION validate_geospatial_data();

CREATE TRIGGER geospatial_validation_local_businesses
    BEFORE INSERT OR UPDATE ON local_businesses
    FOR EACH ROW EXECUTE FUNCTION validate_geospatial_data();

-- Create audit trigger for critical tables
CREATE OR REPLACE FUNCTION audit_metadata_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO metadata_audit_log (entity_type, entity_id, metadata_key, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.entity_type, NEW.entity_id, NEW.metadata_key, NULL, NEW.metadata_value, 'insert', current_user, 'Data creation');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO metadata_audit_log (entity_type, entity_id, metadata_key, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (NEW.entity_type, NEW.entity_id, NEW.metadata_key, OLD.metadata_value, NEW.metadata_value, 'update', current_user, 'Data modification');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO metadata_audit_log (entity_type, entity_id, metadata_key, old_value, new_value, change_type, changed_by, change_reason)
        VALUES (OLD.entity_type, OLD.entity_id, OLD.metadata_key, OLD.metadata_value, NULL, 'delete', current_user, 'Data deletion');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_dynamic_metadata_changes
    AFTER INSERT OR UPDATE OR DELETE ON dynamic_metadata
    FOR EACH ROW EXECUTE FUNCTION audit_metadata_changes();

-- Create function to check data integrity
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(table_name text, constraint_name text, constraint_type text, status text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.table_name::text,
        tc.constraint_name::text,
        tc.constraint_type::text,
        CASE 
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM information_schema.table_constraints tc2
                        WHERE tc2.constraint_name = tc.constraint_name
                        AND tc2.table_name = tc.table_name
                    ) THEN 'Valid'
                    ELSE 'Invalid'
                END
            ELSE 'Valid'
        END as status
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK', 'UNIQUE');
END;
$$ LANGUAGE plpgsql;

-- Create function to validate business rules
CREATE OR REPLACE FUNCTION validate_business_rules()
RETURNS TABLE(rule_name text, status text, message text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Platinum Estate Requirements'::text as rule_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM estates 
                WHERE tier_classification = 'platinum' 
                AND (market_potential_score < 80 OR competitive_intensity > 3)
            ) THEN 'Failed'::text
            ELSE 'Passed'::text
        END as status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM estates 
                WHERE tier_classification = 'platinum' 
                AND (market_potential_score < 80 OR competitive_intensity > 3)
            ) THEN 'Some platinum estates do not meet requirements'::text
            ELSE 'All platinum estates meet requirements'::text
        END as message;
    
    RETURN QUERY
    SELECT 
        'Revenue Consistency'::text as rule_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM revenue_metrics 
                WHERE (customer_count = 0 AND revenue_amount > 0) 
                OR (customer_count > 0 AND revenue_amount = 0)
            ) THEN 'Failed'::text
            ELSE 'Passed'::text
        END as status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM revenue_metrics 
                WHERE (customer_count = 0 AND revenue_amount > 0) 
                OR (customer_count > 0 AND revenue_amount = 0)
            ) THEN 'Revenue and customer count are inconsistent'::text
            ELSE 'Revenue and customer count are consistent'::text
        END as message;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create indexes for performance on validation queries
CREATE INDEX IF NOT EXISTS idx_estates_tier_validation ON estates(tier_classification, market_potential_score, competitive_intensity);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_validation ON revenue_metrics(customer_count, revenue_amount);
CREATE INDEX IF NOT EXISTS idx_profitability_validation ON profitability_analysis(total_revenue, total_costs, gross_profit, net_profit);

-- Analyze tables after adding constraints
ANALYZE estates;
ANALYZE demographics;
ANALYZE revenue_metrics;
ANALYZE cost_metrics;
ANALYZE profitability_analysis;
ANALYZE customer_profiles;
ANALYZE network_infrastructure;
ANALYZE dynamic_metadata;
