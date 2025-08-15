-- Enhance seeder data for all new tables and relationships
-- This migration populates the database with comprehensive mock data for testing and development

-- Update existing areas with geospatial data and enhanced information
UPDATE areas SET 
    geometry = ST_GeomFromText('POINT(' || (6.5244 + (random() * 0.1)) || ' ' || (3.3792 + (random() * 0.1)) || ')', 4326),
    population_density = 5000 + (random() * 15000),
    economic_activity_score = 1 + (random() * 10)::integer
WHERE id = 1;

UPDATE areas SET 
    geometry = ST_GeomFromText('POINT(' || (6.6018 + (random() * 0.1)) || ' ' || (3.3515 + (random() * 0.1)) || ')', 4326),
    population_density = 8000 + (random() * 12000),
    economic_activity_score = 1 + (random() * 10)::integer
WHERE id = 2;

UPDATE areas SET 
    geometry = ST_GeomFromText('POINT(' || (6.4531 + (random() * 0.1)) || ' ' || (3.3958 + (random() * 0.1)) || ')', 4326),
    population_density = 3000 + (random() * 10000),
    economic_activity_score = 1 + (random() * 10)::integer
WHERE id = 3;

-- Update existing estates with enhanced metadata and tier classification
UPDATE estates SET 
    tier_classification = CASE 
        WHEN random() < 0.2 THEN 'platinum'
        WHEN random() < 0.4 THEN 'gold'
        WHEN random() < 0.7 THEN 'silver'
        ELSE 'bronze'
    END,
    metadata = jsonb_build_object(
        'features', jsonb_build_array('swimming_pool', 'gym', 'security', 'parking'),
        'amenities', jsonb_build_array('shopping_center', 'schools', 'hospitals', 'banks'),
        'construction_year', 2010 + (random() * 15)::integer,
        'total_floor_area', 5000 + (random() * 15000)
    ),
    market_potential_score = 50 + (random() * 50),
    competitive_intensity = 1 + (random() * 10)::integer
WHERE id IN (1, 2, 3);

-- Update existing products with enhanced features
UPDATE products SET 
    service_category = CASE 
        WHEN random() < 0.33 THEN 'internet'
        WHEN random() < 0.66 THEN 'cable_tv'
        ELSE 'telephony'
    END,
    pricing_tier = CASE 
        WHEN random() < 0.25 THEN 'premium'
        WHEN random() < 0.5 THEN 'standard'
        WHEN random() < 0.75 THEN 'basic'
        ELSE 'economy'
    END,
    features = jsonb_build_object(
        'category', CASE 
            WHEN random() < 0.33 THEN 'fiber'
            WHEN random() < 0.66 THEN 'copper'
            ELSE 'wireless'
        END,
        'bandwidth', CASE 
            WHEN random() < 0.25 THEN '1000'
            WHEN random() < 0.5 THEN '500'
            WHEN random() < 0.75 THEN '100'
            ELSE '50'
        END,
        'technology', CASE 
            WHEN random() < 0.5 THEN '4G'
            ELSE '5G'
        END
    )
WHERE id IN (1, 2, 3);

-- Insert demographics data for existing estates
INSERT INTO demographics (estate_id, population, age_groups, income_levels, education_levels, household_size, employment_rate, geometry) VALUES
(1, 2500, 
    jsonb_build_object('18-25', 15, '26-35', 30, '36-50', 35, '50+', 20),
    jsonb_build_object('low', 20, 'middle', 50, 'high', 30),
    jsonb_build_object('primary', 10, 'secondary', 40, 'tertiary', 50),
    3.5, 85.5,
    ST_GeomFromText('POINT(6.5244 3.3792)', 4326)
),
(2, 1800,
    jsonb_build_object('18-25', 20, '26-35', 35, '36-50', 30, '50+', 15),
    jsonb_build_object('low', 15, 'middle', 45, 'high', 40),
    jsonb_build_object('primary', 5, 'secondary', 35, 'tertiary', 60),
    3.2, 90.2,
    ST_GeomFromText('POINT(6.6018 3.3515)', 4326)
),
(3, 1200,
    jsonb_build_object('18-25', 25, '26-35', 40, '36-50', 25, '50+', 10),
    jsonb_build_object('low', 10, 'middle', 40, 'high', 50),
    jsonb_build_object('primary', 3, 'secondary', 30, 'tertiary', 67),
    2.8, 92.8,
    ST_GeomFromText('POINT(6.4531 3.3958)', 4326)
);

-- Insert service providers data
INSERT INTO service_providers (name, service_type, coverage_area, technology_stack, network_capacity, metadata) VALUES
('TechConnect NG', 'internet', 'Victoria Island', 'Fiber Optic', '10 Gbps', 
    jsonb_build_object('technology_stack', 'Fiber Optic', 'network_capacity', '10 Gbps', 'established_year', 2015)),
('NetStream Plus', 'cable_tv', 'Lekki', 'Hybrid Fiber Coaxial', '5 Gbps',
    jsonb_build_object('technology_stack', 'Hybrid Fiber Coaxial', 'network_capacity', '5 Gbps', 'established_year', 2018)),
('Wireless Solutions', 'internet', 'Ikoyi', '5G Wireless', '2 Gbps',
    jsonb_build_object('technology_stack', '5G Wireless', 'network_capacity', '2 Gbps', 'established_year', 2020));

-- Insert provider coverage data
INSERT INTO provider_coverage (provider_id, estate_id, coverage_status, coverage_quality_score, installation_date, metadata) VALUES
(1, 1, 'active', 95, '2023-01-15', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'excellent')),
(1, 2, 'active', 88, '2023-02-20', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'good')),
(2, 1, 'active', 92, '2023-01-10', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'excellent')),
(3, 3, 'active', 85, '2023-03-05', jsonb_build_object('coverage_type', 'partial', 'signal_strength', 'good'));

-- Insert service offerings data
INSERT INTO service_offerings (provider_id, service_name, service_description, pricing_tier_score, bandwidth_speed, pricing_structure, metadata) VALUES
(1, 'FiberMax 1000', 'Ultra-fast fiber internet with 1000 Mbps speed', 95, 1000, 
    jsonb_build_object('monthly_fee', 25000, 'setup_fee', 5000, 'contract_length', 12),
    jsonb_build_object('features', jsonb_build_array('unlimited_data', '24_7_support', 'free_installation'))),
(1, 'FiberMax 500', 'High-speed fiber internet with 500 Mbps speed', 85, 500,
    jsonb_build_object('monthly_fee', 18000, 'setup_fee', 3000, 'contract_length', 12),
    jsonb_build_object('features', jsonb_build_array('unlimited_data', 'business_support', 'free_router'))),
(2, 'CableTV Premium', 'Premium cable television with 200+ channels', 90, NULL,
    jsonb_build_object('monthly_fee', 8000, 'setup_fee', 2000, 'contract_length', 6),
    jsonb_build_object('features', jsonb_build_array('hd_channels', 'dvr_service', 'on_demand')));

-- Insert market share data
INSERT INTO market_share_data (provider_id, estate_id, period_start, period_end, market_share_percentage, customer_count, revenue_amount, metadata) VALUES
(1, 1, '2024-01-01', '2024-01-31', 65.5, 120, 3000000, jsonb_build_object('data_source', 'internal', 'verification_status', 'verified')),
(1, 2, '2024-01-01', '2024-01-31', 58.2, 85, 1530000, jsonb_build_object('data_source', 'internal', 'verification_status', 'verified')),
(2, 1, '2024-01-01', '2024-01-31', 34.5, 63, 504000, jsonb_build_object('data_source', 'internal', 'verification_status', 'verified')),
(3, 3, '2024-01-01', '2024-01-31', 42.8, 45, 720000, jsonb_build_object('data_source', 'internal', 'verification_status', 'verified'));

-- Insert business categories
INSERT INTO business_categories (category_name, description, business_type, target_demographic, metadata) VALUES
('Retail & Shopping', 'Retail stores, supermarkets, and shopping centers', 'retail', 'general', 
    jsonb_build_object('subcategories', jsonb_build_array('supermarkets', 'clothing', 'electronics', 'pharmacies'))),
('Food & Dining', 'Restaurants, cafes, and food delivery services', 'food_service', 'general',
    jsonb_build_object('subcategories', jsonb_build_array('restaurants', 'cafes', 'fast_food', 'delivery'))),
('Healthcare', 'Medical clinics, pharmacies, and wellness centers', 'healthcare', 'general',
    jsonb_build_object('subcategories', jsonb_build_array('clinics', 'pharmacies', 'laboratories', 'wellness'))),
('Education', 'Schools, training centers, and educational services', 'education', 'families',
    jsonb_build_object('subcategories', jsonb_build_array('primary_schools', 'secondary_schools', 'universities', 'training_centers')));

-- Insert local businesses
INSERT INTO local_businesses (estate_id, business_category, business_name, business_type, revenue_range, employee_count, geometry, metadata) VALUES
(1, 1, 'Victoria Mall', 'retail', '10M-50M', 150, ST_GeomFromText('POINT(6.5245 3.3793)', 4326),
    jsonb_build_object('established_year', 2018, 'operating_hours', '8AM-10PM', 'parking_spaces', 200)),
(1, 2, 'Lagos Bistro', 'food_service', '1M-10M', 25, ST_GeomFromText('POINT(6.5246 3.3791)', 4326),
    jsonb_build_object('cuisine_type', 'international', 'seating_capacity', 80, 'delivery_available', true)),
(2, 3, 'Lekki Medical Center', 'healthcare', '5M-25M', 45, ST_GeomFromText('POINT(6.6019 3.3516)', 4326),
    jsonb_build_object('specialties', jsonb_build_array('general_practice', 'pediatrics', 'gynecology'), 'insurance_accepted', true)),
(3, 4, 'Ikoyi International School', 'education', '25M-100M', 120, ST_GeomFromText('POINT(6.4532 3.3959)', 4326),
    jsonb_build_object('curriculum', 'international', 'student_capacity', 800, 'boarding_available', false));

-- Insert business metadata
INSERT INTO business_metadata (estate_id, business_type, revenue_range, customer_count, market_position, competitive_advantages, metadata) VALUES
(1, 'retail', '10M-50M', 5000, 'market_leader', 
    jsonb_build_array('prime_location', 'diverse_offerings', 'quality_service'),
    jsonb_build_object('market_share', 35.5, 'customer_satisfaction', 4.2, 'growth_rate', 12.5)),
(2, 'food_service', '1M-10M', 1200, 'strong_contender',
    jsonb_build_array('unique_cuisine', 'excellent_service', 'ambiance'),
    jsonb_build_object('market_share', 18.2, 'customer_satisfaction', 4.5, 'growth_rate', 8.3)),
(3, 'healthcare', '5M-25M', 2800, 'established_provider',
    jsonb_build_array('qualified_staff', 'modern_equipment', 'comprehensive_care'),
    jsonb_build_object('market_share', 22.8, 'customer_satisfaction', 4.3, 'growth_rate', 6.7));

-- Insert customer profiles
INSERT INTO customer_profiles (estate_id, age_group, income_level, occupation, family_size, tenure_months, service_usage_pattern, satisfaction_score, metadata) VALUES
(1, '26-35', 'middle', 'software_engineer', 3, 24, 'heavy', 4.5, 
    jsonb_build_object('preferred_contact', 'email', 'billing_preference', 'monthly', 'loyalty_program', true)),
(1, '36-50', 'high', 'business_executive', 4, 36, 'moderate', 4.8,
    jsonb_build_object('preferred_contact', 'phone', 'billing_preference', 'quarterly', 'loyalty_program', true)),
(2, '18-25', 'middle', 'student', 2, 12, 'light', 4.2,
    jsonb_build_object('preferred_contact', 'sms', 'billing_preference', 'monthly', 'loyalty_program', false)),
(3, '50+', 'high', 'retired_professional', 2, 48, 'moderate', 4.6,
    jsonb_build_object('preferred_contact', 'phone', 'billing_preference', 'monthly', 'loyalty_program', true));

-- Insert usage patterns
INSERT INTO usage_patterns (estate_id, service_type, usage_date, peak_usage_time, data_consumption_gb, service_quality_rating, metadata) VALUES
(1, 'internet', '2024-01-15', 'evening', 45.5, 4.5, 
    jsonb_build_object('device_count', 8, 'peak_hours', '7PM-11PM', 'usage_type', 'streaming')),
(1, 'cable_tv', '2024-01-15', 'evening', NULL, 4.3,
    jsonb_build_object('channel_count', 15, 'peak_hours', '7PM-10PM', 'viewing_preferences', 'news_sports')),
(2, 'internet', '2024-01-15', 'afternoon', 28.3, 4.7,
    jsonb_build_object('device_count', 4, 'peak_hours', '2PM-6PM', 'usage_type', 'gaming')),
(3, 'internet', '2024-01-15', 'morning', 32.1, 4.4,
    jsonb_build_object('device_count', 6, 'peak_hours', '9AM-12PM', 'usage_type', 'work_communication'));

-- Insert customer feedback
INSERT INTO customer_feedback (estate_id, service_type, rating, feedback_text, feedback_category, response_status, metadata) VALUES
(1, 'internet', 5, 'Excellent service, very fast and reliable', 'positive', 'resolved',
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'low', 'escalation_required', false)),
(1, 'cable_tv', 4, 'Good picture quality, but could use more channels', 'suggestion', 'pending',
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'medium', 'escalation_required', false)),
(2, 'internet', 5, 'Amazing speed, perfect for gaming', 'positive', 'resolved',
    jsonb_build_object('feedback_source', 'online_review', 'priority_level', 'low', 'escalation_required', false)),
(3, 'internet', 4, 'Reliable service, good customer support', 'positive', 'resolved',
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'low', 'escalation_required', false));

-- Insert cross-service adoption data
INSERT INTO cross_service_adoption (estate_id, primary_service, secondary_service, adoption_rate, customer_satisfaction, metadata) VALUES
(1, 'internet', 'cable_tv', 78.5, 4.6, 
    jsonb_build_object('bundle_discount', 15.0, 'promotional_period', '6_months', 'retention_rate', 85.2)),
(2, 'internet', 'telephony', 45.2, 4.3,
    jsonb_build_object('bundle_discount', 10.0, 'promotional_period', '3_months', 'retention_rate', 72.8)),
(3, 'internet', 'cable_tv', 62.8, 4.5,
    jsonb_build_object('bundle_discount', 12.5, 'promotional_period', '6_months', 'retention_rate', 78.9));

-- Insert network infrastructure data
INSERT INTO network_infrastructure (estate_id, infrastructure_type, capacity_mbps, current_utilization_percentage, reliability_score, last_maintenance_date, metadata) VALUES
(1, 'fiber_optic', 1000, 65.5, 98.5, '2023-12-15', 
    jsonb_build_object('technology', 'GPON', 'fiber_length_km', 2.5, 'nodes_count', 8)),
(1, 'coaxial_cable', 500, 45.2, 95.8, '2023-11-20',
    jsonb_build_object('technology', 'DOCSIS 3.1', 'cable_length_km', 1.8, 'amplifiers_count', 3)),
(2, 'fiber_optic', 500, 72.3, 97.2, '2023-12-10',
    jsonb_build_object('technology', 'GPON', 'fiber_length_km', 1.8, 'nodes_count', 5)),
(3, 'wireless', 200, 58.7, 93.5, '2023-10-25',
    jsonb_build_object('technology', '5G', 'tower_height_m', 25, 'coverage_radius_km', 0.8));

-- Insert capacity metrics
INSERT INTO capacity_metrics (estate_id, metric_type, period_start, period_end, current_utilization, peak_utilization, availability_percentage, metadata) VALUES
(1, 'bandwidth', '2024-01-01', '2024-01-31', 65.5, 89.2, 99.8,
    jsonb_build_object('measurement_interval', 'hourly', 'data_source', 'network_monitoring', 'alert_threshold', 80.0)),
(1, 'storage', '2024-01-01', '2024-01-31', 45.8, 67.3, 99.9,
    jsonb_build_object('measurement_interval', 'daily', 'data_source', 'storage_monitoring', 'alert_threshold', 85.0)),
(2, 'bandwidth', '2024-01-01', '2024-01-31', 72.3, 91.5, 99.7,
    jsonb_build_object('measurement_interval', 'hourly', 'data_source', 'network_monitoring', 'alert_threshold', 80.0)),
(3, 'bandwidth', '2024-01-01', '2024-01-31', 58.7, 78.9, 99.5,
    jsonb_build_object('measurement_interval', 'hourly', 'data_source', 'network_monitoring', 'alert_threshold', 80.0));

-- Insert infrastructure investments
INSERT INTO infrastructure_investments (estate_id, investment_type, investment_amount, investment_date, expected_completion, roi_percentage, metadata) VALUES
(1, 'fiber_upgrade', 25000000, '2024-01-15', '2024-06-30', 18.5,
    jsonb_build_object('contractor', 'TechBuild NG', 'scope', 'fiber_network_expansion', 'funding_source', 'internal')),
(2, 'equipment_replacement', 15000000, '2024-02-01', '2024-04-30', 22.3,
    jsonb_build_object('contractor', 'NetEquip Solutions', 'scope', 'router_switch_upgrade', 'funding_source', 'loan')),
(3, 'wireless_expansion', 8000000, '2024-01-20', '2024-03-31', 15.8,
    jsonb_build_object('contractor', 'Wireless Tech NG', 'scope', '5G_tower_installation', 'funding_source', 'internal'));

-- Insert revenue metrics
INSERT INTO revenue_metrics (estate_id, product_id, period_start, period_end, revenue_amount, revenue_type, customer_count, average_revenue_per_customer, metadata) VALUES
(1, 1, '2024-01-01', '2024-01-31', 3000000, 'subscription', 120, 25000,
    jsonb_build_object('payment_method', 'bank_transfer', 'collection_rate', 98.5, 'late_payments', 2)),
(1, 2, '2024-01-01', '2024-01-31', 504000, 'subscription', 63, 8000,
    jsonb_build_object('payment_method', 'credit_card', 'collection_rate', 97.2, 'late_payments', 2)),
(2, 1, '2024-01-01', '2024-01-31', 1530000, 'subscription', 85, 18000,
    jsonb_build_object('payment_method', 'bank_transfer', 'collection_rate', 99.1, 'late_payments', 1)),
(3, 1, '2024-01-01', '2024-01-31', 720000, 'subscription', 45, 16000,
    jsonb_build_object('payment_method', 'cash', 'collection_rate', 95.8, 'late_payments', 2));

-- Insert cost metrics
INSERT INTO cost_metrics (estate_id, cost_category, cost_type, amount, period_start, period_end, cost_allocation_method, metadata) VALUES
(1, 'network_maintenance', 'operational', 450000, '2024-01-01', '2024-01-31', 'direct_allocation',
    jsonb_build_object('vendor', 'NetMaintain NG', 'service_type', 'preventive_maintenance', 'contract_reference', 'NM-2024-001')),
(1, 'personnel_salaries', 'personnel', 1200000, '2024-01-01', '2024-01-31', 'headcount_based',
    jsonb_build_object('employee_count', 8, 'average_salary', 150000, 'benefits_percentage', 25.0)),
(2, 'equipment_rental', 'operational', 280000, '2024-01-01', '2024-01-31', 'usage_based',
    jsonb_build_object('vendor', 'EquipRent NG', 'equipment_type', 'network_switches', 'rental_period', 'monthly')),
(3, 'marketing_campaigns', 'marketing', 180000, '2024-01-01', '2024-01-31', 'revenue_based',
    jsonb_build_object('campaign_type', 'digital_advertising', 'channels', jsonb_build_array('social_media', 'google_ads'), 'roi', 3.2));

-- Insert profitability analysis
INSERT INTO profitability_analysis (estate_id, analysis_period, period_start, period_end, total_revenue, total_costs, gross_profit, net_profit, profit_margin_percentage, roi_percentage, breakeven_point, metadata) VALUES
(1, 'monthly', '2024-01-01', '2024-01-31', 3504000, 1650000, 1854000, 1654000, 47.2, 18.5, 1200000,
    jsonb_build_object('analysis_date', '2024-02-01', 'analyst', 'finance_team', 'verification_status', 'verified')),
(2, 'monthly', '2024-01-01', '2024-01-31', 1530000, 880000, 650000, 580000, 37.9, 15.8, 950000,
    jsonb_build_object('analysis_date', '2024-02-01', 'analyst', 'finance_team', 'verification_status', 'verified')),
(3, 'monthly', '2024-01-01', '2024-01-31', 720000, 480000, 240000, 200000, 27.8, 12.3, 600000,
    jsonb_build_object('analysis_date', '2024-02-01', 'analyst', 'finance_team', 'verification_status', 'verified'));

-- Insert dynamic metadata examples
INSERT INTO dynamic_metadata (entity_type, entity_id, metadata_key, metadata_value, metadata_type, is_required, validation_rules) VALUES
('estate', 1, 'amenities_rating', '4.5', 'number', false, jsonb_build_object('min_value', 1, 'max_value', 5)),
('estate', 1, 'security_features', jsonb_build_array('cctv', 'guards', 'access_control'), 'array', true, NULL),
('area', 1, 'transportation_links', jsonb_build_array('bus_stop', 'taxi_stand', 'ferry_terminal'), 'array', false, NULL),
('product', 1, 'service_level_agreement', jsonb_build_object('uptime', '99.9%', 'response_time', '4_hours'), 'object', true, NULL);

-- Insert validation rules
INSERT INTO validation_rules (table_name, column_name, rule_type, rule_definition, error_message, is_active) VALUES
('estates', 'market_potential_score', 'range', jsonb_build_object('min', 0, 'max', 100), 'Market potential score must be between 0 and 100', true),
('revenue_metrics', 'revenue_amount', 'range', jsonb_build_object('min', 0), 'Revenue amount cannot be negative', true),
('demographics', 'population', 'range', jsonb_build_object('min', 0), 'Population cannot be negative', true),
('customer_profiles', 'satisfaction_score', 'range', jsonb_build_object('min', 1, 'max', 5), 'Satisfaction score must be between 1 and 5', true);

-- Refresh materialized views after data insertion
SELECT refresh_market_intelligence();
SELECT refresh_customer_intelligence();
SELECT refresh_infrastructure_intelligence();
