-- Create Financial Intelligence Views and Materialized Views
-- This migration completes the business intelligence views and adds materialized views for performance

-- FINANCIAL INTELLIGENCE VIEWS

-- Financial Performance Dashboard View
CREATE VIEW financial_performance_dashboard AS
SELECT 
    e.tier_classification,
    
    -- Revenue metrics
    SUM(ra.amount) as total_revenue,
    AVG(ra.amount) as avg_revenue_per_estate,
    COUNT(DISTINCT ra.estate_id) as revenue_generating_estates,
    
    -- Investment metrics
    SUM(it.amount) as total_investment,
    AVG(it.expected_roi) as avg_expected_roi,
    AVG(it.actual_roi) as avg_actual_roi,
    
    -- Profitability analysis
    (SUM(ra.amount) - SUM(it.amount)) as net_profit,
    CASE 
        WHEN SUM(it.amount) > 0 THEN ((SUM(ra.amount) - SUM(it.amount)) / SUM(it.amount) * 100)
        ELSE 0 
    END as profit_margin_percentage,
    
    -- Market opportunities
    COUNT(DISTINCT mo.id) as opportunity_count,
    SUM(mo.potential_value) as total_opportunity_value,
    AVG(mo.confidence_level) as avg_opportunity_confidence,
    
    -- Customer value metrics
    COUNT(DISTINCT cp.id) as total_customers,
    AVG(cp.monthly_spend_average) as avg_customer_spend,
    SUM(cp.customer_lifetime_value) as total_customer_lifetime_value,
    
    -- Performance indicators
    AVG(ra.growth_rate_period_over_period) as avg_growth_rate,
    COUNT(CASE WHEN ra.revenue_trend = 'growing' THEN 1 END) as growing_revenue_estates,
    COUNT(CASE WHEN ra.revenue_trend = 'declining' THEN 1 END) as declining_revenue_estates
    
FROM estates e
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN investment_tracking it ON e.id = it.estate_id AND it.investment_date >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN market_opportunities mo ON e.id = mo.estate_id AND mo.opportunity_status IN ('identified', 'evaluated', 'approved')
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
WHERE e.tier_classification IS NOT NULL
GROUP BY e.tier_classification;

-- Revenue Analysis by Tier View
CREATE VIEW revenue_analysis_by_tier AS
SELECT 
    e.tier_classification,
    ra.service_category,
    ra.revenue_type,
    
    -- Revenue metrics
    COUNT(*) as revenue_records,
    SUM(ra.amount) as total_revenue,
    AVG(ra.amount) as avg_revenue,
    MAX(ra.amount) as max_revenue,
    MIN(ra.amount) as min_revenue,
    
    -- Customer and market metrics
    SUM(ra.customer_count) as total_customers,
    AVG(ra.average_revenue_per_customer) as avg_arpu,
    AVG(ra.market_share_contribution) as avg_market_share,
    
    -- Growth and trend analysis
    AVG(ra.growth_rate_period_over_period) as avg_growth_rate,
    COUNT(CASE WHEN ra.revenue_trend = 'growing' THEN 1 END) as growing_count,
    COUNT(CASE WHEN ra.revenue_trend = 'stable' THEN 1 END) as stable_count,
    COUNT(CASE WHEN ra.revenue_trend = 'declining' THEN 1 END) as declining_count,
    
    -- Profitability metrics
    AVG(ra.gross_margin_percentage) as avg_gross_margin,
    SUM(ra.net_revenue) as total_net_revenue,
    
    -- Data quality
    AVG(ra.data_quality_score) as avg_data_quality
    
FROM revenue_analytics ra
JOIN estates e ON ra.estate_id = e.id
WHERE ra.period >= CURRENT_DATE - INTERVAL '12 months'
AND e.tier_classification IS NOT NULL
GROUP BY e.tier_classification, ra.service_category, ra.revenue_type;

-- Investment Tracking Summary View
CREATE VIEW investment_tracking_summary AS
SELECT 
    e.tier_classification,
    it.investment_type,
    
    -- Investment volumes
    COUNT(*) as investment_count,
    SUM(it.amount) as total_invested,
    AVG(it.amount) as avg_investment_size,
    
    -- ROI performance
    AVG(it.expected_roi) as avg_expected_roi,
    AVG(it.actual_roi) as avg_actual_roi,
    COUNT(CASE WHEN it.actual_roi > it.expected_roi THEN 1 END) as outperforming_count,
    COUNT(CASE WHEN it.actual_roi < it.expected_roi THEN 1 END) as underperforming_count,
    
    -- Status distribution
    COUNT(CASE WHEN it.investment_status = 'completed' THEN 1 END) as completed_investments,
    COUNT(CASE WHEN it.investment_status = 'active' THEN 1 END) as active_investments,
    COUNT(CASE WHEN it.investment_status = 'failed' THEN 1 END) as failed_investments,
    
    -- Performance indicators
    AVG(EXTRACT(DAYS FROM it.actual_return_start_date - it.investment_date)) as avg_time_to_return_days,
    
    -- Recent activity
    COUNT(CASE WHEN it.investment_date >= CURRENT_DATE - INTERVAL '6 months' THEN 1 END) as recent_investments,
    SUM(CASE WHEN it.investment_date >= CURRENT_DATE - INTERVAL '6 months' THEN it.amount ELSE 0 END) as recent_investment_amount
    
FROM investment_tracking it
JOIN estates e ON it.estate_id = e.id
WHERE e.tier_classification IS NOT NULL
GROUP BY e.tier_classification, it.investment_type;

-- Market Opportunities Analysis View
CREATE VIEW market_opportunities_analysis AS
SELECT 
    e.tier_classification,
    mo.opportunity_type,
    mo.opportunity_status,
    
    -- Opportunity metrics
    COUNT(*) as opportunity_count,
    SUM(mo.potential_value) as total_potential_value,
    AVG(mo.potential_value) as avg_potential_value,
    AVG(mo.confidence_level) as avg_confidence_level,
    AVG(mo.probability_of_success) as avg_success_probability,
    
    -- Priority and urgency
    AVG(mo.opportunity_priority) as avg_priority,
    COUNT(CASE WHEN mo.urgency_level = 'immediate' THEN 1 END) as immediate_opportunities,
    COUNT(CASE WHEN mo.urgency_level = 'short_term' THEN 1 END) as short_term_opportunities,
    
    -- Investment requirements
    SUM(mo.required_investment) as total_required_investment,
    AVG(mo.required_investment) as avg_required_investment,
    AVG(mo.implementation_complexity) as avg_complexity,
    
    -- Strategic alignment
    AVG(mo.strategic_fit_score) as avg_strategic_fit,
    
    -- Risk assessment
    COUNT(CASE WHEN mo.risk_level = 'low' THEN 1 END) as low_risk_count,
    COUNT(CASE WHEN mo.risk_level = 'medium' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN mo.risk_level = 'high' THEN 1 END) as high_risk_count,
    
    -- Timeline analysis
    AVG(mo.estimated_time_to_market_months) as avg_time_to_market,
    COUNT(CASE WHEN mo.estimated_time_to_market_months <= 6 THEN 1 END) as quick_wins
    
FROM market_opportunities mo
JOIN estates e ON mo.estate_id = e.id
WHERE e.tier_classification IS NOT NULL
GROUP BY e.tier_classification, mo.opportunity_type, mo.opportunity_status;

-- MATERIALIZED VIEWS FOR PERFORMANCE OPTIMIZATION

-- Market Analysis Summary Materialized View
CREATE MATERIALIZED VIEW market_analysis_summary AS
SELECT 
    a.id as area_id,
    a.name as area_name,
    a.state,
    e.tier_classification,
    
    -- Estate metrics
    COUNT(DISTINCT e.id) as estate_count,
    AVG(e.market_potential_score) as avg_market_potential,
    AVG(e.competitive_intensity) as avg_competitive_intensity,
    
    -- Market intelligence
    COUNT(DISTINCT sp.id) as competitor_count,
    AVG(msd.market_share) as avg_market_share,
    COUNT(DISTINCT lb.id) as business_count,
    
    -- Financial performance
    SUM(ra.amount) as total_revenue,
    AVG(ra.amount) as avg_revenue_per_estate,
    
    -- Customer metrics
    COUNT(DISTINCT cp.id) as customer_count,
    AVG(cp.monthly_spend_average) as avg_customer_spend,
    
    -- Infrastructure presence
    COUNT(DISTINCT ni.id) as infrastructure_count,
    AVG(ni.coverage_quality) as avg_infrastructure_quality,
    
    -- Last updated timestamp
    CURRENT_TIMESTAMP as last_updated
    
FROM areas a
LEFT JOIN estates e ON a.id = e.area_id
LEFT JOIN market_share_data msd ON e.id = msd.estate_id AND msd.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN service_providers sp ON msd.provider_id = sp.id AND sp.operational_status = 'active'
LEFT JOIN local_businesses lb ON e.id = lb.estate_id AND lb.operational_status = 'active'
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id AND ni.operational_status = 'active'
GROUP BY a.id, a.name, a.state, e.tier_classification;

-- Customer Behavior Summary Materialized View
CREATE MATERIALIZED VIEW customer_behavior_summary AS
SELECT 
    e.tier_classification,
    cp.customer_segment,
    cp.usage_profile,
    
    -- Customer metrics
    COUNT(*) as customer_count,
    AVG(cp.service_tenure_months) as avg_tenure,
    AVG(cp.monthly_spend_average) as avg_monthly_spend,
    AVG(cp.customer_lifetime_value) as avg_lifetime_value,
    
    -- Behavioral indicators
    AVG(cp.churn_risk_score) as avg_churn_risk,
    AVG(cp.digital_engagement_score) as avg_digital_engagement,
    AVG(cp.referral_count) as avg_referrals,
    
    -- Usage patterns
    AVG(CAST(up.usage_metrics->>'data_consumed_gb' AS DECIMAL)) as avg_data_consumption,
    AVG(up.service_quality_experienced) as avg_service_quality,
    
    -- Satisfaction metrics
    AVG(cf.rating) as avg_satisfaction_rating,
    COUNT(DISTINCT cf.id) as feedback_count,
    
    -- Cross-service adoption
    AVG(csa.monthly_revenue_contribution) as avg_cross_service_revenue,
    COUNT(DISTINCT csa.service_type) as services_adopted,
    
    -- Last updated timestamp
    CURRENT_TIMESTAMP as last_updated
    
FROM customer_profiles cp
JOIN estates e ON cp.estate_id = e.id
LEFT JOIN usage_patterns up ON cp.id = up.customer_id AND up.period >= CURRENT_DATE - INTERVAL '3 months'
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id AND cf.feedback_date >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN cross_service_adoption csa ON cp.id = csa.customer_id AND csa.adoption_status = 'active'
WHERE cp.customer_status = 'active'
GROUP BY e.tier_classification, cp.customer_segment, cp.usage_profile;

-- Infrastructure Performance Summary Materialized View
CREATE MATERIALIZED VIEW infrastructure_performance_summary AS
SELECT 
    e.tier_classification,
    ni.infrastructure_type,
    ni.technology_standard,
    
    -- Infrastructure metrics
    COUNT(*) as infrastructure_count,
    AVG(ni.coverage_quality) as avg_coverage_quality,
    AVG(ni.reliability_score) as avg_reliability,
    AVG(ni.uptime_percentage) as avg_uptime,
    
    -- Capacity metrics
    AVG(cm.utilization_rate) as avg_utilization_rate,
    AVG(cm.peak_utilization_rate) as avg_peak_utilization,
    COUNT(CASE WHEN cm.utilization_rate > 80 THEN 1 END) as high_utilization_count,
    
    -- Performance metrics
    AVG(CAST(cm.performance_metrics->>'throughput_mbps' AS DECIMAL)) as avg_throughput,
    AVG(CAST(cm.performance_metrics->>'latency_ms' AS DECIMAL)) as avg_latency,
    AVG(cm.sla_compliance_percentage) as avg_sla_compliance,
    
    -- Investment metrics
    SUM(ni.original_investment_amount) as total_investment,
    AVG(ni.strategic_importance) as avg_strategic_importance,
    
    -- Customer impact
    COUNT(DISTINCT cp.id) as customers_served,
    AVG(cf.rating) as avg_customer_satisfaction,
    
    -- Last updated timestamp
    CURRENT_TIMESTAMP as last_updated
    
FROM network_infrastructure ni
JOIN estates e ON ni.estate_id = e.id
LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id AND cm.measurement_period >= CURRENT_DATE - INTERVAL '3 months'
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id AND cf.service_type = 'internet' AND cf.feedback_date >= CURRENT_DATE - INTERVAL '6 months'
WHERE ni.operational_status = 'active'
GROUP BY e.tier_classification, ni.infrastructure_type, ni.technology_standard;

-- Financial Performance Summary Materialized View
CREATE MATERIALIZED VIEW financial_performance_summary AS
SELECT 
    e.tier_classification,
    ra.service_category,
    
    -- Revenue metrics
    SUM(ra.amount) as total_revenue,
    AVG(ra.amount) as avg_revenue,
    COUNT(DISTINCT ra.estate_id) as revenue_estates,
    
    -- Customer metrics
    SUM(ra.customer_count) as total_customers,
    AVG(ra.average_revenue_per_customer) as avg_arpu,
    
    -- Growth metrics
    AVG(ra.growth_rate_period_over_period) as avg_growth_rate,
    COUNT(CASE WHEN ra.revenue_trend = 'growing' THEN 1 END) as growing_estates,
    
    -- Profitability metrics
    AVG(ra.gross_margin_percentage) as avg_gross_margin,
    SUM(ra.net_revenue) as total_net_revenue,
    
    -- Investment correlation
    SUM(it.amount) as total_investment,
    AVG(it.expected_roi) as avg_expected_roi,
    
    -- Market opportunities
    COUNT(DISTINCT mo.id) as opportunity_count,
    SUM(mo.potential_value) as total_opportunity_value,
    
    -- Last updated timestamp
    CURRENT_TIMESTAMP as last_updated
    
FROM revenue_analytics ra
JOIN estates e ON ra.estate_id = e.id
LEFT JOIN investment_tracking it ON e.id = it.estate_id AND it.investment_date >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN market_opportunities mo ON e.id = mo.estate_id AND mo.opportunity_status IN ('identified', 'evaluated', 'approved')
WHERE ra.period >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY e.tier_classification, ra.service_category;

-- Create indexes on materialized views
CREATE INDEX idx_market_analysis_summary_area_tier ON market_analysis_summary(area_name, tier_classification);
CREATE INDEX idx_market_analysis_summary_state ON market_analysis_summary(state);
CREATE INDEX idx_market_analysis_summary_revenue ON market_analysis_summary(total_revenue);

CREATE INDEX idx_customer_behavior_summary_tier_segment ON customer_behavior_summary(tier_classification, customer_segment);
CREATE INDEX idx_customer_behavior_summary_churn ON customer_behavior_summary(avg_churn_risk);
CREATE INDEX idx_customer_behavior_summary_spend ON customer_behavior_summary(avg_monthly_spend);

CREATE INDEX idx_infrastructure_performance_type ON infrastructure_performance_summary(infrastructure_type);
CREATE INDEX idx_infrastructure_performance_utilization ON infrastructure_performance_summary(avg_utilization_rate);

CREATE INDEX idx_financial_performance_tier_category ON financial_performance_summary(tier_classification, service_category);
CREATE INDEX idx_financial_performance_revenue ON financial_performance_summary(total_revenue);

-- Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_business_intelligence_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW market_analysis_summary;
    REFRESH MATERIALIZED VIEW customer_behavior_summary;
    REFRESH MATERIALIZED VIEW infrastructure_performance_summary;
    REFRESH MATERIALIZED VIEW financial_performance_summary;
    
    -- Log the refresh
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_by)
    VALUES ('materialized_views', 0, 'REFRESH', NULL, 
            jsonb_build_object('refresh_time', CURRENT_TIMESTAMP, 'views_refreshed', 4), 
            CURRENT_USER);
END;
$$ LANGUAGE plpgsql;

-- Create function to check materialized view freshness
CREATE OR REPLACE FUNCTION check_materialized_view_freshness()
RETURNS TABLE (
    view_name TEXT,
    last_updated TIMESTAMP,
    hours_since_update NUMERIC,
    needs_refresh BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'market_analysis_summary'::TEXT,
        mas.last_updated,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mas.last_updated)) / 3600,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mas.last_updated)) / 3600) > 24
    FROM (SELECT last_updated FROM market_analysis_summary LIMIT 1) mas
    
    UNION ALL
    
    SELECT 
        'customer_behavior_summary'::TEXT,
        cbs.last_updated,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cbs.last_updated)) / 3600,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cbs.last_updated)) / 3600) > 24
    FROM (SELECT last_updated FROM customer_behavior_summary LIMIT 1) cbs
    
    UNION ALL
    
    SELECT 
        'infrastructure_performance_summary'::TEXT,
        ips.last_updated,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ips.last_updated)) / 3600,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ips.last_updated)) / 3600) > 24
    FROM (SELECT last_updated FROM infrastructure_performance_summary LIMIT 1) ips
    
    UNION ALL
    
    SELECT 
        'financial_performance_summary'::TEXT,
        fps.last_updated,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fps.last_updated)) / 3600,
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fps.last_updated)) / 3600) > 24
    FROM (SELECT last_updated FROM financial_performance_summary LIMIT 1) fps;
END;
$$ LANGUAGE plpgsql;