-- Create new analytical views and materialized views for business intelligence
-- This migration implements comprehensive analytical capabilities for market intelligence

-- Market Performance Dashboard View
CREATE OR REPLACE VIEW market_performance_dashboard AS
SELECT 
    a.id as area_id,
    a.name as area_name,
    a.state,
    a.population_density,
    a.economic_activity_score,
    COUNT(DISTINCT e.id) as total_estates,
    COUNT(DISTINCT CASE WHEN e.occupancy_status = 'fully_occupied' THEN e.id END) as occupied_estates,
    COUNT(DISTINCT CASE WHEN e.tier_classification = 'platinum' THEN e.id END) as platinum_estates,
    AVG(e.market_potential_score) as avg_market_potential,
    AVG(e.competitive_intensity) as avg_competitive_intensity,
    SUM(CASE WHEN rm.revenue_amount IS NOT NULL THEN rm.revenue_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN rm.revenue_amount IS NOT NULL THEN rm.revenue_amount / NULLIF(rm.customer_count, 0) ELSE 0 END) as avg_revenue_per_customer
FROM areas a
LEFT JOIN estates e ON a.id = e.area_id
LEFT JOIN revenue_metrics rm ON e.id = rm.estate_id
GROUP BY a.id, a.name, a.state, a.population_density, a.economic_activity_score;

-- Customer Demographics Analysis View
CREATE OR REPLACE VIEW customer_demographics_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    d.population,
    d.household_size,
    d.employment_rate,
    d.age_groups->>'18-25' as age_18_25,
    d.age_groups->>'26-35' as age_26_35,
    d.age_groups->>'36-50' as age_36_50,
    d.age_groups->>'50+' as age_50_plus,
    d.income_levels->>'low' as income_low,
    d.income_levels->>'middle' as income_middle,
    d.income_levels->>'high' as income_high,
    d.education_levels->>'tertiary' as education_tertiary,
    COUNT(DISTINCT cp.id) as total_customers,
    cp.demographics->>'age_group' as customer_age_group,
    cp.demographics->>'income_level' as customer_income_level
FROM estates e
LEFT JOIN demographics d ON e.id = d.estate_id
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
GROUP BY e.id, e.name, e.tier_classification, d.population, d.household_size, d.employment_rate,
         d.age_groups, d.income_levels, d.education_levels, cp.demographics;

-- Competitive Intelligence View
CREATE OR REPLACE VIEW competitive_intelligence_summary AS
SELECT 
    sp.id as provider_id,
    sp.name as provider_name,
    sp.service_type,
    sp.coverage_area,
    COUNT(DISTINCT pc.estate_id) as estates_covered,
    AVG((pc.quality_metrics->>'reliability')::DECIMAL) as avg_coverage_quality,
    AVG(msd.market_share) as avg_market_share,
    COUNT(DISTINCT so.id) as service_offerings_count,
    AVG(CASE WHEN so.service_tier = 'premium' THEN 3 WHEN so.service_tier = 'standard' THEN 2 ELSE 1 END) as avg_pricing_tier,
    sp.technology_stack->>'fiber' as has_fiber,
    sp.technology_stack->>'5g' as has_5g
FROM service_providers sp
LEFT JOIN provider_coverage pc ON sp.id = pc.provider_id
LEFT JOIN market_share_data msd ON sp.id = msd.provider_id
LEFT JOIN service_offerings so ON sp.id = so.provider_id
GROUP BY sp.id, sp.name, sp.service_type, sp.coverage_area, sp.technology_stack;

-- Infrastructure Capacity Analysis View
CREATE OR REPLACE VIEW infrastructure_capacity_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    ni.infrastructure_type,
    ni.capacity as capacity_mbps,
    cm.utilization_rate as current_utilization_percentage,
    ni.coverage_quality as reliability_score,
    'utilization' as metric_type,
    cm.utilization_rate as current_utilization,
    cm.utilization_rate as peak_utilization,
    100 - cm.utilization_rate as availability_percentage,
    CASE 
        WHEN cm.utilization_rate > 80 THEN 'High'
        WHEN cm.utilization_rate > 60 THEN 'Medium'
        ELSE 'Low'
    END as utilization_level,
    ni.last_maintenance_date as last_maintenance,
    CASE WHEN ni.status = 'upgrade' THEN 'Yes' ELSE 'No' END as upgrade_planned
FROM estates e
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id
LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
WHERE ni.infrastructure_type IS NOT NULL;

-- Financial Performance Analysis View
CREATE OR REPLACE VIEW financial_performance_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    pa.analysis_period,
    pa.period_start,
    pa.period_end,
    pa.total_revenue,
    pa.total_costs,
    pa.gross_profit,
    pa.net_profit,
    pa.profit_margin_percentage,
    pa.roi_percentage,
    pa.breakeven_point,
    AVG(rm.revenue_amount) as avg_monthly_revenue,
    SUM(cm.amount) as total_operational_costs,
    CASE 
        WHEN pa.profit_margin_percentage > 30 THEN 'Excellent'
        WHEN pa.profit_margin_percentage > 20 THEN 'Good'
        WHEN pa.profit_margin_percentage > 10 THEN 'Fair'
        ELSE 'Poor'
    END as profitability_rating
FROM estates e
LEFT JOIN profitability_analysis pa ON e.id = pa.estate_id
LEFT JOIN revenue_metrics rm ON e.id = rm.estate_id
LEFT JOIN cost_metrics cm ON e.id = cm.estate_id AND cm.cost_type = 'operational'
GROUP BY e.id, e.name, e.tier_classification, pa.analysis_period, pa.period_start, pa.period_end,
         pa.total_revenue, pa.total_costs, pa.gross_profit, pa.net_profit, pa.profit_margin_percentage,
         pa.roi_percentage, pa.breakeven_point;

-- Materialized Views for Performance Optimization

-- Market Intelligence Materialized View (refreshed daily)
CREATE MATERIALIZED VIEW market_intelligence_summary AS
SELECT 
    a.id as area_id,
    a.name as area_name,
    a.state,
    a.population_density,
    a.economic_activity_score,
    COUNT(DISTINCT e.id) as total_estates,
    COUNT(DISTINCT CASE WHEN e.tier_classification = 'platinum' THEN e.id END) as platinum_estates,
    COUNT(DISTINCT CASE WHEN e.tier_classification = 'gold' THEN e.id END) as gold_estates,
    AVG(e.market_potential_score) as avg_market_potential,
    AVG(e.competitive_intensity) as avg_competitive_intensity,
    COUNT(DISTINCT sp.id) as service_providers_count,
    COUNT(DISTINCT lb.id) as local_businesses_count,
    AVG(d.population) as avg_population_per_estate,
    AVG(d.employment_rate) as avg_employment_rate
FROM areas a
LEFT JOIN estates e ON a.id = e.area_id
LEFT JOIN demographics d ON e.id = d.estate_id
LEFT JOIN service_providers sp ON ST_Within(a.geometry, sp.coverage_area)
LEFT JOIN local_businesses lb ON lb.estate_id IN (SELECT id FROM estates WHERE area_id = a.id)
GROUP BY a.id, a.name, a.state, a.population_density, a.economic_activity_score
WITH DATA;

-- Customer Intelligence Materialized View (refreshed weekly)
CREATE MATERIALIZED VIEW customer_intelligence_summary AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    e.area_id,
    d.population,
    d.household_size,
    d.employment_rate,
    COUNT(DISTINCT cp.id) as total_customers,
    COUNT(DISTINCT up.id) as usage_patterns_count,
    COUNT(DISTINCT cf.id) as feedback_count,
    AVG(cf.rating) as avg_rating,
    COUNT(DISTINCT csa.id) as cross_service_adoptions
FROM estates e
LEFT JOIN demographics d ON e.id = d.estate_id
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
LEFT JOIN usage_patterns up ON cp.id = up.customer_id
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id
LEFT JOIN cross_service_adoption csa ON cp.id = csa.customer_id
GROUP BY e.id, e.name, e.tier_classification, e.area_id, d.population, d.household_size, d.employment_rate
WITH DATA;

-- Infrastructure Intelligence Materialized View (refreshed daily)
CREATE MATERIALIZED VIEW infrastructure_intelligence_summary AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    ni.infrastructure_type,
    ni.capacity as capacity_mbps,
    cm.utilization_rate as current_utilization_percentage,
    ni.coverage_quality as reliability_score,
    AVG(cm.utilization_rate) as avg_current_utilization,
    MAX(cm.utilization_rate) as max_peak_utilization,
    AVG(100 - cm.utilization_rate) as avg_availability,
    COUNT(DISTINCT ii.id) as infrastructure_investments_count,
    SUM(ii.amount) as total_investment_amount,
    ni.last_maintenance_date as last_maintenance,
    CASE WHEN ni.status = 'upgrade' THEN 'Yes' ELSE 'No' END as upgrade_planned
FROM estates e
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id
LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
LEFT JOIN infrastructure_investments ii ON e.id = ii.estate_id
GROUP BY e.id, e.name, e.tier_classification, ni.infrastructure_type, ni.capacity,
         cm.utilization_rate, ni.coverage_quality, ni.last_maintenance_date, ni.status
WITH DATA;

-- Create indexes on materialized views for better performance
CREATE INDEX idx_market_intelligence_area ON market_intelligence_summary(area_id);
CREATE INDEX idx_market_intelligence_state ON market_intelligence_summary(state);
CREATE INDEX idx_customer_intelligence_estate ON customer_intelligence_summary(estate_id);
CREATE INDEX idx_customer_intelligence_tier ON customer_intelligence_summary(tier_classification);
CREATE INDEX idx_infrastructure_intelligence_estate ON infrastructure_intelligence_summary(estate_id);
CREATE INDEX idx_infrastructure_intelligence_type ON infrastructure_intelligence_summary(infrastructure_type);

-- Create refresh functions for materialized views
CREATE OR REPLACE FUNCTION refresh_market_intelligence()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY market_intelligence_summary;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_customer_intelligence()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_intelligence_summary;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_infrastructure_intelligence()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY infrastructure_intelligence_summary;
END;
$$ LANGUAGE plpgsql;
