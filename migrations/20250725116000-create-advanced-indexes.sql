-- Create advanced indexes and performance optimization strategies
-- This migration implements advanced indexing for improved query performance

-- Full-text search indexes for text-based searching
CREATE INDEX IF NOT EXISTS idx_estates_name_fts ON estates USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_estates_classification_fts ON estates USING GIN(to_tsvector('english', classification));
CREATE INDEX IF NOT EXISTS idx_areas_name_fts ON areas USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_fts ON products USING GIN(to_tsvector('english', description));

-- Partial indexes for active/active records
CREATE INDEX IF NOT EXISTS idx_estates_active ON estates(area_id, estate_type, occupancy_status) 
    WHERE occupancy_status != 'under_construction';
CREATE INDEX IF NOT EXISTS idx_products_active ON products(id, name, status) 
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_areas_active ON areas(id, name, state) 
    WHERE state IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_estates_area_type_status ON estates(area_id, estate_type, occupancy_status, tier_classification);
CREATE INDEX IF NOT EXISTS idx_estates_type_classification ON estates(estate_type, classification, gated, has_security);
CREATE INDEX IF NOT EXISTS idx_estates_tier_potential ON estates(tier_classification, market_potential_score, competitive_intensity);

-- Spatial compound indexes
CREATE INDEX IF NOT EXISTS idx_areas_geo_population ON areas USING GIST(geometry) 
    WHERE population_density IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_demographics_estate_geo ON demographics(estate_id) 
    WHERE geometry IS NOT NULL;

-- JSONB path indexes for specific metadata queries
CREATE INDEX IF NOT EXISTS idx_estates_metadata_features ON estates USING GIN((metadata->'features'));
CREATE INDEX IF NOT EXISTS idx_estates_metadata_amenities ON estates USING GIN((metadata->'amenities'));
CREATE INDEX IF NOT EXISTS idx_products_features_category ON products USING GIN((features->'category'));
CREATE INDEX IF NOT EXISTS idx_products_features_bandwidth ON products USING GIN((features->'bandwidth'));

-- Partial indexes for business intelligence queries
-- Create index only if the table and columns exist
DO $$ 
BEGIN
    -- Check if revenue_metrics table exists and has the required columns
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'revenue_metrics'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'revenue_metrics' 
        AND column_name = 'period_start'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_metrics_high_value ON revenue_metrics(estate_id, revenue_amount, period_start) 
            WHERE revenue_amount > 100000;
        RAISE NOTICE 'Created idx_revenue_metrics_high_value index';
    ELSE
        RAISE WARNING 'Skipping idx_revenue_metrics_high_value - table or columns not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create idx_revenue_metrics_high_value: %', SQLERRM;
END $$;
CREATE INDEX IF NOT EXISTS idx_cost_metrics_operational ON cost_metrics(estate_id, cost_type, amount) 
    WHERE cost_type = 'operational';
CREATE INDEX IF NOT EXISTS idx_profitability_analysis_profitable ON profitability_analysis(estate_id, profit_margin_percentage) 
    WHERE profit_margin_percentage > 20;

-- Indexes for time-series analysis (defensive creation)
DO $$ 
BEGIN
    -- Revenue metrics time series index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'revenue_metrics')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'revenue_metrics' AND column_name = 'period_start') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_metrics_time_series ON revenue_metrics(estate_id, period_start, revenue_amount);
        RAISE NOTICE 'Created idx_revenue_metrics_time_series index';
    ELSE
        RAISE WARNING 'Skipping idx_revenue_metrics_time_series - table or columns not found';
    END IF;

    -- Cost metrics time series index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cost_metrics')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cost_metrics' AND column_name = 'period_start') THEN
        CREATE INDEX IF NOT EXISTS idx_cost_metrics_time_series ON cost_metrics(estate_id, period_start, amount);
        RAISE NOTICE 'Created idx_cost_metrics_time_series index';
    ELSE
        RAISE WARNING 'Skipping idx_cost_metrics_time_series - table or columns not found';
    END IF;

    -- Profitability analysis time series index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profitability_analysis')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profitability_analysis' AND column_name = 'period_start') THEN
        CREATE INDEX IF NOT EXISTS idx_profitability_analysis_time_series ON profitability_analysis(estate_id, period_start, net_profit);
        RAISE NOTICE 'Created idx_profitability_analysis_time_series index';
    ELSE
        RAISE WARNING 'Skipping idx_profitability_analysis_time_series - table or columns not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating time-series indexes: %', SQLERRM;
END $$;

-- Indexes for demographic analysis
CREATE INDEX IF NOT EXISTS idx_demographics_population_income ON demographics(estate_id, population, income_levels);
CREATE INDEX IF NOT EXISTS idx_demographics_age_employment ON demographics(estate_id, age_groups, employment_rate);

-- Indexes for market intelligence queries
CREATE INDEX IF NOT EXISTS idx_service_providers_coverage ON service_providers(service_type, coverage_area);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_estate ON provider_coverage(provider_id, estate_id, coverage_status);
-- Market share data period index (defensive creation)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_share_data')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_share_data' AND column_name = 'period_start') THEN
        CREATE INDEX IF NOT EXISTS idx_market_share_data_period ON market_share_data(provider_id, period_start, market_share_percentage);
        RAISE NOTICE 'Created idx_market_share_data_period index';
    ELSE
        RAISE WARNING 'Skipping idx_market_share_data_period - table or columns not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating market share data period index: %', SQLERRM;
END $$;

-- Indexes for business ecosystem analysis (defensive creation)
DO $$ 
BEGIN
    -- Local businesses category location index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'local_businesses')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'local_businesses' AND column_name = 'category_id') THEN
        CREATE INDEX IF NOT EXISTS idx_local_businesses_category_location ON local_businesses(category_id, estate_id);
        RAISE NOTICE 'Created idx_local_businesses_category_location index';
    ELSE
        RAISE WARNING 'Skipping idx_local_businesses_category_location - table or columns not found';
    END IF;

    -- Business metadata estate index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_metadata') THEN
        CREATE INDEX IF NOT EXISTS idx_business_metadata_estate ON business_metadata(estate_id, metadata_type);
        RAISE NOTICE 'Created idx_business_metadata_estate index';
    ELSE
        RAISE WARNING 'Skipping idx_business_metadata_estate - table not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating business ecosystem indexes: %', SQLERRM;
END $$;

-- Indexes for customer intelligence (defensive creation)
DO $$ 
BEGIN
    -- Customer profiles demographics index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_customer_profiles_estate_demographics ON customer_profiles(estate_id);
        RAISE NOTICE 'Created idx_customer_profiles_estate_demographics index';
    ELSE
        RAISE WARNING 'Skipping idx_customer_profiles_estate_demographics - table not found';
    END IF;

    -- Usage patterns service time index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_patterns') THEN
        CREATE INDEX IF NOT EXISTS idx_usage_patterns_service_time ON usage_patterns(customer_id, service_type);
        RAISE NOTICE 'Created idx_usage_patterns_service_time index';
    ELSE
        RAISE WARNING 'Skipping idx_usage_patterns_service_time - table not found';
    END IF;

    -- Customer feedback rating service index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_feedback') THEN
        CREATE INDEX IF NOT EXISTS idx_customer_feedback_rating_service ON customer_feedback(customer_id, rating);
        RAISE NOTICE 'Created idx_customer_feedback_rating_service index';
    ELSE
        RAISE WARNING 'Skipping idx_customer_feedback_rating_service - table not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating customer intelligence indexes: %', SQLERRM;
END $$;

-- Indexes for infrastructure intelligence (defensive creation)
DO $$ 
BEGIN
    -- Network infrastructure location capacity index
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'network_infrastructure') THEN
        CREATE INDEX IF NOT EXISTS idx_network_infrastructure_location_capacity ON network_infrastructure(estate_id, infrastructure_type);
        RAISE NOTICE 'Created idx_network_infrastructure_location_capacity index';
    ELSE
        RAISE WARNING 'Skipping idx_network_infrastructure_location_capacity - table not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating infrastructure intelligence indexes: %', SQLERRM;
END $$;
-- Capacity metrics period index (defensive creation)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'capacity_metrics')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'capacity_metrics' AND column_name = 'measurement_period') THEN
        CREATE INDEX IF NOT EXISTS idx_capacity_metrics_period_type ON capacity_metrics(infrastructure_id, utilization_rate, measurement_period);
        RAISE NOTICE 'Created idx_capacity_metrics_period_type index';
    ELSE
        RAISE WARNING 'Skipping idx_capacity_metrics_period_type - table or columns not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating capacity metrics period index: %', SQLERRM;
END $$;

-- Function-based indexes for calculated fields
CREATE INDEX IF NOT EXISTS idx_estates_market_score_calculated ON estates((market_potential_score * competitive_intensity));
-- Revenue metrics ARPU index (defensive creation)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'revenue_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_revenue_metrics_arpu ON revenue_metrics((revenue_amount / NULLIF(customer_count, 0)));
        RAISE NOTICE 'Created idx_revenue_metrics_arpu index';
    ELSE
        RAISE WARNING 'Skipping idx_revenue_metrics_arpu - table not found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating revenue metrics ARPU index: %', SQLERRM;
END $$;

-- Concurrent index creation for production safety (commented out for development)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estates_concurrent ON estates(area_id, estate_type);
-- Note: Concurrent revenue_metrics index requires table existence check in production

-- Analyze tables to update statistics
ANALYZE estates;
ANALYZE areas;
ANALYZE products;
ANALYZE demographics;
ANALYZE revenue_metrics;
ANALYZE cost_metrics;
ANALYZE profitability_analysis;
ANALYZE service_providers;
ANALYZE local_businesses;
ANALYZE customer_profiles;
ANALYZE network_infrastructure;
ANALYZE dynamic_metadata;
ANALYZE system_configurations;
