-- Data validation, constraints, and system integrity checks
-- This migration implements comprehensive data validation and business rules

-- First, ensure all required columns exist in the estates table
-- These columns should have been added by migration 20250725108000-enhance-existing-tables.sql
DO $$ 
BEGIN
    -- Add columns if they don't exist (safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estates' AND column_name = 'market_potential_score') THEN
        ALTER TABLE estates ADD COLUMN market_potential_score DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estates' AND column_name = 'competitive_intensity') THEN
        ALTER TABLE estates ADD COLUMN competitive_intensity INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estates' AND column_name = 'tier_classification') THEN
        ALTER TABLE estates ADD COLUMN tier_classification VARCHAR(20);
    END IF;
END $$;

-- Create check constraints for data integrity
ALTER TABLE estates ADD CONSTRAINT check_market_potential_score 
    CHECK (market_potential_score >= 0 AND market_potential_score <= 100);

ALTER TABLE estates ADD CONSTRAINT check_competitive_intensity 
    CHECK (competitive_intensity >= 1 AND competitive_intensity <= 10);

-- Only add demographics constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demographics') THEN
        ALTER TABLE demographics ADD CONSTRAINT check_population_positive 
            CHECK (population > 0);

        ALTER TABLE demographics ADD CONSTRAINT check_employment_rate 
            CHECK (employment_rate >= 0 AND employment_rate <= 100);

        ALTER TABLE demographics ADD CONSTRAINT check_household_size 
            CHECK (household_size > 0 AND household_size <= 10);
    END IF;
END $$;

-- Only add revenue_metrics constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        ALTER TABLE revenue_metrics ADD CONSTRAINT check_revenue_positive 
            CHECK (revenue_amount > 0);

        ALTER TABLE revenue_metrics ADD CONSTRAINT check_customer_count_positive 
            CHECK (customer_count > 0);

        ALTER TABLE revenue_metrics ADD CONSTRAINT check_average_revenue_positive 
            CHECK (average_revenue_per_customer > 0);
    END IF;
END $$;

-- Only add cost_metrics constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_metrics') THEN
        ALTER TABLE cost_metrics ADD CONSTRAINT check_cost_positive 
            CHECK (amount > 0);
    END IF;
END $$;

-- Only add profitability_analysis constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        ALTER TABLE profitability_analysis ADD CONSTRAINT check_profit_margin 
            CHECK (profit_margin_percentage >= -100 AND profit_margin_percentage <= 100);

        ALTER TABLE profitability_analysis ADD CONSTRAINT check_roi_percentage 
            CHECK (roi_percentage >= -100 AND roi_percentage <= 1000);
    END IF;
END $$;

-- Only add network_infrastructure constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'network_infrastructure') THEN
        ALTER TABLE network_infrastructure ADD CONSTRAINT check_capacity_positive 
            CHECK (capacity > 0);

        ALTER TABLE network_infrastructure ADD CONSTRAINT check_coverage_quality 
            CHECK (coverage_quality >= 0 AND coverage_quality <= 5);
    END IF;
END $$;

-- Only add capacity_metrics constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capacity_metrics') THEN
        ALTER TABLE capacity_metrics ADD CONSTRAINT check_utilization_rate 
            CHECK (utilization_rate >= 0 AND utilization_rate <= 100);
    END IF;
END $$;

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

-- Only add revenue_metrics business rule constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        ALTER TABLE revenue_metrics ADD CONSTRAINT check_revenue_customer_consistency 
            CHECK (
                (customer_count = 0 AND revenue_amount = 0) OR 
                (customer_count > 0 AND revenue_amount > 0)
            );
    END IF;
END $$;

-- Only add profitability_analysis business rule constraints if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        ALTER TABLE profitability_analysis ADD CONSTRAINT check_profit_calculation 
            CHECK (gross_profit = total_revenue - total_costs);

        ALTER TABLE profitability_analysis ADD CONSTRAINT check_net_profit_calculation 
            CHECK (net_profit <= gross_profit);
    END IF;
END $$;

-- Create foreign key constraints for referential integrity
-- Only add if the referenced tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demographics') THEN
        ALTER TABLE demographics ADD CONSTRAINT fk_demographics_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider_coverage') THEN
        ALTER TABLE provider_coverage ADD CONSTRAINT fk_provider_coverage_provider 
            FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;
            
        ALTER TABLE provider_coverage ADD CONSTRAINT fk_provider_coverage_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_offerings') THEN
        ALTER TABLE service_offerings ADD CONSTRAINT fk_service_offerings_provider 
            FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_share_data') THEN
        ALTER TABLE market_share_data ADD CONSTRAINT fk_market_share_provider 
            FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE;
            
        ALTER TABLE market_share_data ADD CONSTRAINT fk_market_share_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'local_businesses') THEN
        ALTER TABLE local_businesses ADD CONSTRAINT fk_local_businesses_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    -- Note: business_metadata table has business_id column, not estate_id
    -- The foreign key constraint is already defined in the table creation
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_profiles') THEN
        ALTER TABLE customer_profiles ADD CONSTRAINT fk_customer_profiles_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_patterns') THEN
        ALTER TABLE usage_patterns ADD CONSTRAINT fk_usage_patterns_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_feedback') THEN
        ALTER TABLE customer_feedback ADD CONSTRAINT fk_customer_feedback_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cross_service_adoption') THEN
        ALTER TABLE cross_service_adoption ADD CONSTRAINT fk_cross_service_adoption_customer 
            FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'network_infrastructure') THEN
        ALTER TABLE network_infrastructure ADD CONSTRAINT fk_network_infrastructure_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capacity_metrics') THEN
        ALTER TABLE capacity_metrics ADD CONSTRAINT fk_capacity_metrics_infrastructure 
            FOREIGN KEY (infrastructure_id) REFERENCES network_infrastructure(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'infrastructure_investments') THEN
        ALTER TABLE infrastructure_investments ADD CONSTRAINT fk_infrastructure_investments_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        ALTER TABLE revenue_metrics ADD CONSTRAINT fk_revenue_metrics_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
            
        ALTER TABLE revenue_metrics ADD CONSTRAINT fk_revenue_metrics_product 
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_metrics') THEN
        ALTER TABLE cost_metrics ADD CONSTRAINT fk_cost_metrics_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        ALTER TABLE profitability_analysis ADD CONSTRAINT fk_profitability_analysis_estate 
            FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create business rule constraints for business_categories
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_categories') THEN
        ALTER TABLE business_categories ADD CONSTRAINT fk_business_categories_business_type 
            CHECK (business_type IN ('retail', 'food_service', 'healthcare', 'education', 'entertainment', 'professional_services'));
    END IF;
END $$;

-- Create unique constraints
ALTER TABLE estates ADD CONSTRAINT unique_estate_name_area 
    UNIQUE (name, area_id);

-- Only add unique constraints if the tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_providers') THEN
        ALTER TABLE service_providers ADD CONSTRAINT unique_provider_name_service 
            UNIQUE (name, service_type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_categories') THEN
        ALTER TABLE business_categories ADD CONSTRAINT unique_category_name_type 
            UNIQUE (name, business_type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'local_businesses') THEN
        ALTER TABLE local_businesses ADD CONSTRAINT unique_business_name_estate 
            UNIQUE (name, estate_id);
    END IF;
END $$;

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

-- Create function for revenue consistency validation
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

-- Create function for profitability validation
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

-- Create function for audit metadata changes
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

-- Create triggers for validation (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        CREATE TRIGGER revenue_consistency_validation
            BEFORE INSERT OR UPDATE ON revenue_metrics
            FOR EACH ROW EXECUTE FUNCTION validate_revenue_consistency();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        CREATE TRIGGER profitability_validation
            BEFORE INSERT OR UPDATE ON profitability_analysis
            FOR EACH ROW EXECUTE FUNCTION validate_profitability();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dynamic_metadata') THEN
        CREATE TRIGGER audit_dynamic_metadata_changes
            AFTER INSERT OR UPDATE OR DELETE ON dynamic_metadata
            FOR EACH ROW EXECUTE FUNCTION audit_metadata_changes();
    END IF;
END $$;

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

-- Only create indexes if the tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_metrics_validation ON revenue_metrics(customer_count, revenue_amount);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        CREATE INDEX IF NOT EXISTS idx_profitability_validation ON profitability_analysis(total_revenue, total_costs, gross_profit, net_profit);
    END IF;
END $$;

-- Analyze tables after adding constraints (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estates') THEN
        ANALYZE estates;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demographics') THEN
        ANALYZE demographics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_metrics') THEN
        ANALYZE revenue_metrics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_metrics') THEN
        ANALYZE cost_metrics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profitability_analysis') THEN
        ANALYZE profitability_analysis;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_profiles') THEN
        ANALYZE customer_profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'network_infrastructure') THEN
        ANALYZE network_infrastructure;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dynamic_metadata') THEN
        ANALYZE dynamic_metadata;
    END IF;
END $$;
