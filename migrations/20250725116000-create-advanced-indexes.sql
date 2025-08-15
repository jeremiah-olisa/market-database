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
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_high_value ON revenue_metrics(estate_id, revenue_amount, period_start) 
    WHERE revenue_amount > 100000;
CREATE INDEX IF NOT EXISTS idx_cost_metrics_operational ON cost_metrics(estate_id, cost_type, amount) 
    WHERE cost_type = 'operational';
CREATE INDEX IF NOT EXISTS idx_profitability_analysis_profitable ON profitability_analysis(estate_id, profit_margin_percentage) 
    WHERE profit_margin_percentage > 20;

-- Indexes for time-series analysis
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_time_series ON revenue_metrics(estate_id, period_start, revenue_amount);
CREATE INDEX IF NOT EXISTS idx_cost_metrics_time_series ON cost_metrics(estate_id, period_start, amount);
CREATE INDEX IF NOT EXISTS idx_profitability_analysis_time_series ON profitability_analysis(estate_id, period_start, net_profit);

-- Indexes for demographic analysis
CREATE INDEX IF NOT EXISTS idx_demographics_population_income ON demographics(estate_id, population, income_levels);
CREATE INDEX IF NOT EXISTS idx_demographics_age_employment ON demographics(estate_id, age_groups, employment_rate);

-- Indexes for market intelligence queries
CREATE INDEX IF NOT EXISTS idx_service_providers_coverage ON service_providers(service_type, coverage_area);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_estate ON provider_coverage(provider_id, estate_id, coverage_status);
CREATE INDEX IF NOT EXISTS idx_market_share_data_period ON market_share_data(provider_id, period_start, market_share_percentage);

-- Indexes for business ecosystem analysis
CREATE INDEX IF NOT EXISTS idx_local_businesses_category_location ON local_businesses(business_category, geometry);
CREATE INDEX IF NOT EXISTS idx_business_metadata_estate ON business_metadata(estate_id, business_type, revenue_range);

-- Indexes for customer intelligence
CREATE INDEX IF NOT EXISTS idx_customer_profiles_estate_demographics ON customer_profiles(estate_id, age_group, income_level);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_service_time ON usage_patterns(estate_id, service_type, usage_date);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_rating_service ON customer_feedback(estate_id, rating, service_type);

-- Indexes for infrastructure intelligence
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_location_capacity ON network_infrastructure(estate_id, infrastructure_type, capacity_mbps);
CREATE INDEX IF NOT EXISTS idx_capacity_metrics_period_type ON capacity_metrics(estate_id, metric_type, period_start, current_utilization);

-- Function-based indexes for calculated fields
CREATE INDEX IF NOT EXISTS idx_estates_market_score_calculated ON estates((market_potential_score * competitive_intensity));
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_arpu ON revenue_metrics((revenue_amount / NULLIF(customer_count, 0)));

-- Concurrent index creation for production safety (commented out for development)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estates_concurrent ON estates(area_id, estate_type);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revenue_metrics_concurrent ON revenue_metrics(estate_id, period_start);

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
