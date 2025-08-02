-- Create comprehensive business intelligence views
-- This migration implements all analytical views for market intelligence and decision support

-- MARKET INTELLIGENCE VIEWS

-- Market Intelligence Summary View
CREATE VIEW market_intelligence_summary AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    e.market_potential_score,
    e.competitive_intensity,
    e.infrastructure_readiness_score,
    e.business_density_score,
    
    -- Competitive metrics
    COUNT(DISTINCT sp.id) as competitor_count,
    AVG(msd.market_share) as avg_competitor_market_share,
    MAX(msd.market_share) as leading_competitor_share,
    
    -- Business ecosystem metrics
    COUNT(DISTINCT lb.id) as local_business_count,
    AVG(lb.reputation_score) as avg_business_reputation,
    
    -- Demographics and market size
    d.population,
    d.average_income,
    d.internet_penetration_rate,
    
    -- Infrastructure presence
    COUNT(DISTINCT ni.id) as infrastructure_count,
    AVG(ni.coverage_quality) as avg_infrastructure_quality,
    
    -- Financial indicators
    SUM(ra.amount) as total_revenue_last_period,
    COUNT(DISTINCT cp.id) as customer_count
    
FROM estates e
LEFT JOIN market_share_data msd ON e.id = msd.estate_id AND msd.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN service_providers sp ON msd.provider_id = sp.id
LEFT JOIN local_businesses lb ON e.id = lb.estate_id AND lb.operational_status = 'active'
LEFT JOIN demographics d ON e.id = d.estate_id
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id AND ni.operational_status = 'active'
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '1 month'
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score, e.competitive_intensity,
         e.infrastructure_readiness_score, e.business_density_score, 
         d.population, d.average_income, d.internet_penetration_rate;

-- Competitive Landscape Analysis View
CREATE VIEW competitive_landscape_analysis AS
SELECT 
    a.id as area_id,
    a.name as area_name,
    a.state,
    a.market_maturity,
    a.competition_level,
    
    -- Provider metrics
    COUNT(DISTINCT sp.id) as total_providers,
    COUNT(DISTINCT CASE WHEN sp.threat_level IN ('high', 'critical') THEN sp.id END) as high_threat_providers,
    
    -- Estate coverage
    COUNT(DISTINCT e.id) as total_estates,
    COUNT(DISTINCT CASE WHEN e.tier_classification = 'platinum' THEN e.id END) as platinum_estates,
    COUNT(DISTINCT CASE WHEN e.tier_classification = 'gold' THEN e.id END) as gold_estates,
    
    -- Market penetration
    AVG(e.market_potential_score) as avg_market_potential,
    AVG(pc.market_share_percentage) as avg_market_share,
    SUM(msd.market_share) as total_market_share_tracked,
    
    -- Infrastructure readiness
    AVG(e.infrastructure_readiness_score) as avg_infrastructure_readiness,
    COUNT(DISTINCT ni.id) as infrastructure_assets,
    
    -- Financial opportunity
    SUM(ra.amount) as total_area_revenue,
    AVG(ra.amount) as avg_estate_revenue
    
FROM areas a
LEFT JOIN estates e ON a.id = e.area_id
LEFT JOIN provider_coverage pc ON e.id = pc.estate_id
LEFT JOIN market_share_data msd ON e.id = msd.estate_id AND msd.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN service_providers sp ON msd.provider_id = sp.id AND sp.operational_status = 'active'
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id AND ni.operational_status = 'active'
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY a.id, a.name, a.state, a.market_maturity, a.competition_level;

-- Market Penetration Analysis View
CREATE VIEW market_penetration_analysis AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    
    -- Market penetration metrics
    COUNT(DISTINCT cp.id) as our_customers,
    d.population as total_population,
    CASE 
        WHEN d.population > 0 THEN (COUNT(DISTINCT cp.id)::decimal / d.population * 100)
        ELSE 0 
    END as penetration_rate,
    
    -- Competitive positioning
    COUNT(DISTINCT sp.id) as competitors,
    AVG(msd.market_share) as avg_competitor_share,
    MAX(msd.market_share) as leading_competitor_share,
    
    -- Revenue and customer value
    SUM(ra.amount) as total_revenue,
    AVG(cp.monthly_spend_average) as avg_customer_value,
    AVG(cp.customer_lifetime_value) as avg_lifetime_value,
    
    -- Growth potential indicators
    e.market_potential_score,
    COUNT(DISTINCT mo.id) as identified_opportunities,
    SUM(mo.potential_value) as total_opportunity_value
    
FROM estates e
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
LEFT JOIN demographics d ON e.id = d.estate_id
LEFT JOIN market_share_data msd ON e.id = msd.estate_id AND msd.period >= CURRENT_DATE - INTERVAL '6 months'
LEFT JOIN service_providers sp ON msd.provider_id = sp.id AND sp.operational_status = 'active'
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN market_opportunities mo ON e.id = mo.estate_id AND mo.opportunity_status IN ('identified', 'evaluated', 'approved')
GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score, d.population;

-- Estate Tier Comparison View
CREATE VIEW estate_tier_comparison AS
SELECT 
    tier_classification,
    COUNT(*) as estate_count,
    
    -- Market metrics
    AVG(market_potential_score) as avg_market_potential,
    AVG(competitive_intensity) as avg_competitive_intensity,
    AVG(infrastructure_readiness_score) as avg_infrastructure_readiness,
    AVG(business_density_score) as avg_business_density,
    
    -- Customer metrics
    COUNT(DISTINCT cp.id) as total_customers,
    AVG(cp.monthly_spend_average) as avg_monthly_spend,
    AVG(cp.customer_lifetime_value) as avg_lifetime_value,
    AVG(cp.churn_risk_score) as avg_churn_risk,
    
    -- Revenue metrics
    SUM(ra.amount) as total_revenue,
    AVG(ra.amount) as avg_revenue_per_estate,
    
    -- Infrastructure metrics
    COUNT(DISTINCT ni.id) as total_infrastructure,
    AVG(ni.coverage_quality) as avg_coverage_quality,
    
    -- Business ecosystem
    COUNT(DISTINCT lb.id) as total_businesses,
    AVG(lb.reputation_score) as avg_business_reputation
    
FROM estates e
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id AND ra.period >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id AND ni.operational_status = 'active'
LEFT JOIN local_businesses lb ON e.id = lb.estate_id AND lb.operational_status = 'active'
WHERE tier_classification IS NOT NULL
GROUP BY tier_classification;

-- CUSTOMER INTELLIGENCE VIEWS

-- Customer Segmentation Analysis View
CREATE VIEW customer_segmentation_analysis AS
SELECT 
    e.tier_classification as estate_tier,
    cp.customer_segment,
    cp.usage_profile,
    
    -- Customer counts and demographics
    COUNT(*) as customer_count,
    AVG(cp.service_tenure_months) as avg_tenure_months,
    
    -- Financial metrics
    AVG(cp.monthly_spend_average) as avg_monthly_spend,
    SUM(cp.monthly_spend_average) as total_monthly_revenue,
    AVG(cp.customer_lifetime_value) as avg_lifetime_value,
    
    -- Usage patterns
    AVG(CAST(up.usage_metrics->>'data_consumed_gb' AS DECIMAL)) as avg_data_consumption,
    AVG(up.service_quality_experienced) as avg_service_quality,
    
    -- Satisfaction and loyalty
    AVG(cf.rating) as avg_satisfaction_rating,
    AVG(cp.churn_risk_score) as avg_churn_risk,
    COUNT(DISTINCT csa.service_type) as avg_services_adopted,
    
    -- Engagement metrics
    AVG(cp.digital_engagement_score) as avg_digital_engagement,
    AVG(cp.referral_count) as avg_referrals
    
FROM customer_profiles cp
JOIN estates e ON cp.estate_id = e.id
LEFT JOIN usage_patterns up ON cp.id = up.customer_id AND up.period >= CURRENT_DATE - INTERVAL '3 months'
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id AND cf.feedback_date >= CURRENT_DATE - INTERVAL '12 months'
LEFT JOIN cross_service_adoption csa ON cp.id = csa.customer_id AND csa.adoption_status = 'active'
WHERE cp.customer_status = 'active'
GROUP BY e.tier_classification, cp.customer_segment, cp.usage_profile;

-- Usage Pattern Analysis View
CREATE VIEW usage_pattern_analysis AS
SELECT 
    up.service_type,
    cp.customer_segment,
    e.tier_classification as estate_tier,
    
    -- Usage metrics
    COUNT(DISTINCT up.customer_id) as active_users,
    AVG(CAST(up.usage_metrics->>'data_consumed_gb' AS DECIMAL)) as avg_data_consumption,
    AVG(up.service_quality_experienced) as avg_quality_experienced,
    AVG(up.usage_efficiency_score) as avg_efficiency_score,
    
    -- Temporal patterns
    AVG(array_length(CAST(up.peak_usage_hours AS TEXT[]), 1)) as avg_peak_hours,
    
    -- Trends and performance
    COUNT(CASE WHEN up.usage_trend = 'increasing' THEN 1 END) as increasing_usage_count,
    COUNT(CASE WHEN up.usage_trend = 'decreasing' THEN 1 END) as decreasing_usage_count,
    AVG(up.feature_adoption_rate) as avg_feature_adoption,
    
    -- Issues and satisfaction
    AVG(up.performance_issues_count) as avg_issues_per_period,
    COUNT(DISTINCT cf.id) as feedback_count,
    AVG(cf.rating) as avg_satisfaction_rating
    
FROM usage_patterns up
JOIN customer_profiles cp ON up.customer_id = cp.id
JOIN estates e ON cp.estate_id = e.id
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id AND cf.service_type = up.service_type
WHERE up.period >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY up.service_type, cp.customer_segment, e.tier_classification;

-- Customer Satisfaction Metrics View
CREATE VIEW customer_satisfaction_metrics AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    cf.service_type,
    
    -- Satisfaction metrics
    COUNT(*) as feedback_count,
    AVG(cf.rating) as avg_rating,
    AVG(cf.sentiment_score) as avg_sentiment,
    
    -- Feedback distribution
    COUNT(CASE WHEN cf.rating >= 4 THEN 1 END) as positive_feedback,
    COUNT(CASE WHEN cf.rating <= 2 THEN 1 END) as negative_feedback,
    COUNT(CASE WHEN cf.feedback_type = 'complaint' THEN 1 END) as complaints,
    COUNT(CASE WHEN cf.feedback_type = 'compliment' THEN 1 END) as compliments,
    
    -- Resolution metrics
    COUNT(CASE WHEN cf.resolution_status = 'resolved' THEN 1 END) as resolved_issues,
    AVG(cf.resolution_time_hours) as avg_resolution_time,
    
    -- Trending analysis
    AVG(CASE WHEN cf.feedback_date >= CURRENT_DATE - INTERVAL '30 days' THEN cf.rating END) as recent_avg_rating,
    COUNT(CASE WHEN cf.feedback_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_feedback_count
    
FROM customer_feedback cf
JOIN customer_profiles cp ON cf.customer_id = cp.id
JOIN estates e ON cp.estate_id = e.id
WHERE cf.feedback_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY e.id, e.name, e.tier_classification, cf.service_type;

-- Cross Service Adoption Analysis View
CREATE VIEW cross_service_adoption_analysis AS
SELECT 
    e.tier_classification as estate_tier,
    csa.service_type,
    csa.adoption_status,
    
    -- Adoption metrics
    COUNT(*) as adoption_count,
    AVG(csa.monthly_transactions) as avg_monthly_transactions,
    AVG(csa.monthly_value) as avg_monthly_value,
    SUM(csa.monthly_revenue_contribution) as total_monthly_revenue,
    
    -- Engagement metrics
    AVG(csa.feature_adoption_score) as avg_feature_adoption,
    AVG(csa.service_satisfaction_rating) as avg_satisfaction,
    AVG(csa.retention_probability) as avg_retention_probability,
    
    -- Customer profile correlation
    AVG(cp.monthly_spend_average) as avg_base_spend,
    AVG(cp.customer_lifetime_value) as avg_lifetime_value,
    
    -- Cross-selling opportunities
    COUNT(CASE WHEN csa.upsell_potential IN ('medium', 'high') THEN 1 END) as upsell_opportunities,
    AVG(array_length(CAST(csa.related_services_interest AS TEXT[]), 1)) as avg_interest_count
    
FROM cross_service_adoption csa
JOIN customer_profiles cp ON csa.customer_id = cp.id
JOIN estates e ON cp.estate_id = e.id
GROUP BY e.tier_classification, csa.service_type, csa.adoption_status;

-- INFRASTRUCTURE INTELLIGENCE VIEWS

-- Infrastructure Performance Metrics View
CREATE VIEW infrastructure_performance_metrics AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    e.tier_classification,
    ni.infrastructure_type,
    ni.technology_standard,
    
    -- Performance metrics
    COUNT(*) as infrastructure_count,
    AVG(ni.coverage_quality) as avg_coverage_quality,
    AVG(ni.reliability_score) as avg_reliability,
    AVG(ni.uptime_percentage) as avg_uptime,
    
    -- Capacity and utilization
    AVG(cm.utilization_rate) as avg_utilization_rate,
    AVG(cm.peak_utilization_rate) as avg_peak_utilization,
    AVG(CAST(cm.performance_metrics->>'throughput_mbps' AS DECIMAL)) as avg_throughput,
    AVG(CAST(cm.performance_metrics->>'latency_ms' AS DECIMAL)) as avg_latency,
    
    -- Infrastructure age and condition
    AVG(ni.infrastructure_age_years) as avg_age_years,
    AVG(ni.physical_condition) as avg_physical_condition,
    COUNT(CASE WHEN ni.last_upgrade_date >= CURRENT_DATE - INTERVAL '2 years' THEN 1 END) as recently_upgraded,
    
    -- Investment and strategic importance
    SUM(ni.original_investment_amount) as total_investment,
    AVG(ni.strategic_importance) as avg_strategic_importance,
    
    -- Customer impact
    COUNT(DISTINCT cp.id) as customers_served,
    AVG(cf.rating) as avg_customer_satisfaction
    
FROM network_infrastructure ni
JOIN estates e ON ni.estate_id = e.id
LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id AND cm.measurement_period >= CURRENT_DATE - INTERVAL '3 months'
LEFT JOIN customer_profiles cp ON e.id = cp.estate_id AND cp.customer_status = 'active'
LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id AND cf.service_type = 'internet' AND cf.feedback_date >= CURRENT_DATE - INTERVAL '6 months'
WHERE ni.operational_status = 'active'
GROUP BY e.id, e.name, e.tier_classification, ni.infrastructure_type, ni.technology_standard;

-- Network Coverage Analysis View
CREATE VIEW network_coverage_analysis AS
SELECT 
    a.id as area_id,
    a.name as area_name,
    a.state,
    
    -- Coverage metrics
    COUNT(DISTINCT ni.id) as infrastructure_assets,
    COUNT(DISTINCT e.id) as estates_in_area,
    COUNT(DISTINCT CASE WHEN ni.operational_status = 'active' THEN e.id END) as estates_with_infrastructure,
    
    -- Coverage percentage
    CASE 
        WHEN COUNT(DISTINCT e.id) > 0 THEN 
            (COUNT(DISTINCT CASE WHEN ni.operational_status = 'active' THEN e.id END)::decimal / COUNT(DISTINCT e.id) * 100)
        ELSE 0 
    END as coverage_percentage,
    
    -- Quality metrics
    AVG(ni.coverage_quality) as avg_coverage_quality,
    AVG(ni.signal_strength_average) as avg_signal_strength,
    SUM(ni.coverage_area_sqkm) as total_coverage_area,
    
    -- Infrastructure types
    COUNT(CASE WHEN ni.infrastructure_type = 'fiber_optic' THEN 1 END) as fiber_assets,
    COUNT(CASE WHEN ni.infrastructure_type = 'wireless_tower' THEN 1 END) as wireless_assets,
    
    -- Investment and capacity
    SUM(ni.original_investment_amount) as total_infrastructure_investment,
    AVG(cm.utilization_rate) as avg_utilization_rate
    
FROM areas a
LEFT JOIN estates e ON a.id = e.area_id
LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id
LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id AND cm.measurement_period >= CURRENT_DATE - INTERVAL '1 month'
GROUP BY a.id, a.name, a.state;

-- Capacity Utilization Metrics View
CREATE VIEW capacity_utilization_metrics AS
SELECT 
    ni.infrastructure_type,
    ni.technology_standard,
    e.tier_classification as estate_tier,
    
    -- Utilization metrics
    COUNT(*) as infrastructure_count,
    AVG(cm.utilization_rate) as avg_utilization_rate,
    AVG(cm.peak_utilization_rate) as avg_peak_utilization,
    COUNT(CASE WHEN cm.utilization_rate > 80 THEN 1 END) as high_utilization_count,
    COUNT(CASE WHEN cm.utilization_rate > 95 THEN 1 END) as critical_utilization_count,
    
    -- Capacity planning
    AVG(cm.available_capacity) as avg_available_capacity,
    COUNT(CASE WHEN cm.capacity_trend = 'increasing' THEN 1 END) as increasing_trend_count,
    AVG(EXTRACT(DAYS FROM cm.projected_exhaustion_date - CURRENT_DATE)) as avg_days_to_exhaustion,
    
    -- Performance metrics
    AVG(CAST(cm.performance_metrics->>'throughput_mbps' AS DECIMAL)) as avg_throughput,
    AVG(CAST(cm.performance_metrics->>'latency_ms' AS DECIMAL)) as avg_latency,
    AVG(CAST(cm.performance_metrics->>'packet_loss_percent' AS DECIMAL)) as avg_packet_loss,
    
    -- Service quality
    AVG(cm.sla_compliance_percentage) as avg_sla_compliance,
    COUNT(CASE WHEN cm.service_level_met = false THEN 1 END) as sla_violations
    
FROM capacity_metrics cm
JOIN network_infrastructure ni ON cm.infrastructure_id = ni.id
JOIN estates e ON ni.estate_id = e.id
WHERE cm.measurement_period >= CURRENT_DATE - INTERVAL '3 months'
AND ni.operational_status = 'active'
GROUP BY ni.infrastructure_type, ni.technology_standard, e.tier_classification;

-- Investment ROI Analysis View
CREATE VIEW investment_roi_analysis AS
SELECT 
    e.tier_classification as estate_tier,
    ii.investment_type,
    ii.investment_category,
    
    -- Investment metrics
    COUNT(*) as investment_count,
    SUM(ii.amount) as total_investment,
    AVG(ii.amount) as avg_investment_amount,
    
    -- ROI metrics
    AVG(ii.expected_roi_percentage) as avg_expected_roi,
    AVG(ii.actual_roi_percentage) as avg_actual_roi,
    AVG(ii.payback_period_months) as avg_payback_months,
    
    -- Performance tracking
    COUNT(CASE WHEN ii.investment_status = 'completed' THEN 1 END) as completed_investments,
    COUNT(CASE WHEN ii.actual_roi_percentage > ii.expected_roi_percentage THEN 1 END) as outperforming_investments,
    
    -- Impact assessment
    AVG(ii.business_impact_score) as avg_business_impact,
    AVG(ii.strategic_alignment_score) as avg_strategic_alignment,
    
    -- Risk assessment
    COUNT(CASE WHEN ii.risk_level IN ('high', 'critical') THEN 1 END) as high_risk_investments,
    AVG(EXTRACT(DAYS FROM ii.actual_completion_date - ii.planned_completion_date)) as avg_delay_days
    
FROM infrastructure_investments ii
JOIN estates e ON ii.estate_id = e.id
WHERE ii.investment_status IN ('completed', 'in_progress')
GROUP BY e.tier_classification, ii.investment_type, ii.investment_category;