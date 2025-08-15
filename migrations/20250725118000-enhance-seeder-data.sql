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
INSERT INTO service_providers (name, service_type, coverage_area, technology_stack, metadata) VALUES
('TechConnect NG', 'internet', ST_GeomFromText('POLYGON((6.5244 3.3792, 6.5344 3.3792, 6.5344 3.3892, 6.5244 3.3892, 6.5244 3.3792))', 4326), 
    jsonb_build_object('fiber', true, '5g', false, 'lte', true), 
    jsonb_build_object('established_year', 2015, 'network_capacity', '10 Gbps')),
('NetStream Plus', 'cable_tv', ST_GeomFromText('POLYGON((6.6018 3.3515, 6.6118 3.3515, 6.6118 3.3615, 6.6018 3.3615, 6.6018 3.3515))', 4326),
    jsonb_build_object('fiber', false, '5g', false, 'lte', true),
    jsonb_build_object('established_year', 2018, 'network_capacity', '5 Gbps')),
('Wireless Solutions', 'internet', ST_GeomFromText('POLYGON((6.4531 3.3958, 6.4631 3.3958, 6.4631 3.4058, 6.4531 3.4058, 6.4531 3.3958))', 4326),
    jsonb_build_object('fiber', false, '5g', true, 'lte', true),
    jsonb_build_object('established_year', 2020, 'network_capacity', '2 Gbps'));

-- Insert provider coverage data
INSERT INTO provider_coverage (provider_id, estate_id, coverage_status, quality_metrics, coverage_start_date, metadata) VALUES
(1, 1, 'active', jsonb_build_object('reliability', 95, 'speed', '100mbps', 'uptime', 99.9), '2023-01-15', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'excellent')),
(1, 2, 'active', jsonb_build_object('reliability', 88, 'speed', '100mbps', 'uptime', 99.5), '2023-02-20', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'good')),
(2, 1, 'active', jsonb_build_object('reliability', 92, 'speed', '500mbps', 'uptime', 99.8), '2023-01-10', jsonb_build_object('coverage_type', 'full', 'signal_strength', 'excellent')),
(3, 3, 'active', jsonb_build_object('reliability', 85, 'speed', '200mbps', 'uptime', 99.2), '2023-03-05', jsonb_build_object('coverage_type', 'partial', 'signal_strength', 'good'));

-- Insert service offerings data
INSERT INTO service_offerings (provider_id, plan_name, pricing, features, service_tier, metadata) VALUES
(1, 'FiberMax 1000', 25000, 
    jsonb_build_object('speed', '1000mbps', 'data_cap', 'unlimited', 'contract', '12_months'),
    'premium',
    jsonb_build_object('features', jsonb_build_array('unlimited_data', '24_7_support', 'free_installation'))),
(1, 'FiberMax 500', 18000,
    jsonb_build_object('speed', '500mbps', 'data_cap', 'unlimited', 'contract', '12_months'),
    'standard',
    jsonb_build_object('features', jsonb_build_array('unlimited_data', 'business_support', 'free_router'))),
(2, 'CableTV Premium', 8000,
    jsonb_build_object('channels', '200+', 'quality', 'HD', 'contract', '6_months'),
    'premium',
    jsonb_build_object('features', jsonb_build_array('hd_channels', 'dvr_service', 'on_demand')));

-- Insert market share data
INSERT INTO market_share_data (provider_id, estate_id, period, market_share, customer_count, data_source, metadata) VALUES
(1, 1, '2024-01-01', 65.5, 120, 'internal', jsonb_build_object('verification_status', 'verified')),
(1, 2, '2024-01-01', 58.2, 85, 'internal', jsonb_build_object('verification_status', 'verified')),
(2, 1, '2024-01-01', 34.5, 63, 'internal', jsonb_build_object('verification_status', 'verified')),
(3, 3, '2024-01-01', 42.8, 45, 'internal', jsonb_build_object('verification_status', 'verified'));

-- Insert business categories
INSERT INTO business_categories (name, description, business_type, target_demographic, metadata) VALUES
('Retail & Shopping', 'Retail stores, supermarkets, and shopping centers', 'retail', 'general', 
    jsonb_build_object('subcategories', jsonb_build_array('supermarkets', 'clothing', 'electronics', 'pharmacies'))),
('Food & Dining', 'Restaurants, cafes, and food delivery services', 'food_service', 'general',
    jsonb_build_object('subcategories', jsonb_build_array('restaurants', 'cafes', 'fast_food', 'delivery'))),
('Healthcare', 'Medical clinics, pharmacies, and wellness centers', 'healthcare', 'general',
    jsonb_build_object('subcategories', jsonb_build_array('clinics', 'pharmacies', 'laboratories', 'wellness'))),
('Education', 'Schools, training centers, and educational services', 'education', 'families',
    jsonb_build_object('subcategories', jsonb_build_array('primary_schools', 'secondary_schools', 'universities', 'training_centers')));

-- Insert local businesses
INSERT INTO local_businesses (estate_id, category_id, name, business_type, price_range, rating, geometry, metadata) VALUES
(1, 1, 'Victoria Mall', 'retail', 'expensive', 4.5, ST_GeomFromText('POINT(6.5245 3.3793)', 4326),
    jsonb_build_object('established_year', 2018, 'operating_hours', '8AM-10PM', 'parking_spaces', 200)),
(1, 2, 'Lagos Bistro', 'food_service', 'moderate', 4.3, ST_GeomFromText('POINT(6.5246 3.3791)', 4326),
    jsonb_build_object('cuisine_type', 'international', 'seating_capacity', 80, 'delivery_available', true)),
(2, 3, 'Lekki Medical Center', 'healthcare', 'expensive', 4.7, ST_GeomFromText('POINT(6.6019 3.3516)', 4326),
    jsonb_build_object('specialties', jsonb_build_array('general_practice', 'pediatrics', 'gynecology'), 'insurance_accepted', true)),
(3, 4, 'Ikoyi International School', 'education', 'luxury', 4.6, ST_GeomFromText('POINT(6.4532 3.3959)', 4326),
    jsonb_build_object('curriculum', 'international', 'student_capacity', 800, 'boarding_available', false));

-- Insert business metadata
INSERT INTO business_metadata (business_id, metadata_type, metadata_key, metadata_value) VALUES
(1, 'business_info', 'revenue_range', jsonb_build_object('range', '10M-50M', 'customer_count', 5000, 'market_position', 'market_leader')),
(1, 'competitive_advantages', 'advantages', jsonb_build_array('prime_location', 'diverse_offerings', 'quality_service')),
(1, 'performance_metrics', 'metrics', jsonb_build_object('market_share', 35.5, 'customer_satisfaction', 4.2, 'growth_rate', 12.5)),
(2, 'business_info', 'revenue_range', jsonb_build_object('range', '1M-10M', 'customer_count', 1200, 'market_position', 'strong_contender')),
(2, 'competitive_advantages', 'advantages', jsonb_build_array('unique_cuisine', 'excellent_service', 'ambiance')),
(2, 'performance_metrics', 'metrics', jsonb_build_object('market_share', 18.2, 'customer_satisfaction', 4.5, 'growth_rate', 8.3)),
(3, 'business_info', 'revenue_range', jsonb_build_object('range', '5M-25M', 'customer_count', 2800, 'market_position', 'established_provider')),
(3, 'competitive_advantages', 'advantages', jsonb_build_array('qualified_staff', 'modern_equipment', 'comprehensive_care')),
(3, 'performance_metrics', 'metrics', jsonb_build_object('market_share', 22.8, 'customer_satisfaction', 4.3, 'growth_rate', 6.7));

-- Insert customer profiles
INSERT INTO customer_profiles (estate_id, customer_type, demographics, lifestyle_indicators, contact_preferences, service_preferences, metadata) VALUES
(1, 'residential', 
    jsonb_build_object('age_group', '26-35', 'income_level', 'middle', 'occupation', 'software_engineer'), 
    jsonb_build_object('internet_usage', 'high', 'tech_savvy', true, 'entertainment', 'streaming'),
    jsonb_build_object('email', true, 'sms', false, 'phone', true),
    jsonb_build_object('internet_speed', '100mbps', 'data_usage', 'unlimited'),
    jsonb_build_object('preferred_contact', 'email', 'billing_preference', 'monthly', 'loyalty_program', true)),
(1, 'residential', 
    jsonb_build_object('age_group', '36-50', 'income_level', 'high', 'occupation', 'business_executive'), 
    jsonb_build_object('internet_usage', 'moderate', 'tech_savvy', true, 'entertainment', 'news'),
    jsonb_build_object('email', true, 'sms', true, 'phone', true),
    jsonb_build_object('internet_speed', '500mbps', 'data_usage', 'unlimited'),
    jsonb_build_object('preferred_contact', 'phone', 'billing_preference', 'quarterly', 'loyalty_program', true)),
(2, 'residential', 
    jsonb_build_object('age_group', '18-25', 'income_level', 'middle', 'occupation', 'student'), 
    jsonb_build_object('internet_usage', 'light', 'tech_savvy', true, 'entertainment', 'gaming'),
    jsonb_build_object('email', false, 'sms', true, 'phone', false),
    jsonb_build_object('internet_speed', '100mbps', 'data_usage', '50gb'),
    jsonb_build_object('preferred_contact', 'sms', 'billing_preference', 'monthly', 'loyalty_program', false)),
(3, 'residential', 
    jsonb_build_object('age_group', '50+', 'income_level', 'high', 'occupation', 'retired_professional'), 
    jsonb_build_object('internet_usage', 'moderate', 'tech_savvy', false, 'entertainment', 'news'),
    jsonb_build_object('email', true, 'sms', false, 'phone', true),
    jsonb_build_object('internet_speed', '200mbps', 'data_usage', '100gb'),
    jsonb_build_object('preferred_contact', 'phone', 'billing_preference', 'monthly', 'loyalty_program', true));

-- Insert usage patterns
INSERT INTO usage_patterns (customer_id, service_type, usage_metrics, period, billing_amount, metadata) VALUES
(1, 'internet', 
    jsonb_build_object('data_consumption', '45.5GB', 'peak_hours', '7-9PM', 'devices', 8, 'usage_type', 'streaming'), 
    '2024-01-15', 25000,
    jsonb_build_object('device_count', 8, 'peak_hours', '7PM-11PM', 'usage_type', 'streaming')),
(1, 'cable_tv', 
    jsonb_build_object('channels_watched', 15, 'peak_hours', '7-10PM', 'devices', 2, 'viewing_preferences', 'news_sports'), 
    '2024-01-15', 8000,
    jsonb_build_object('channel_count', 15, 'peak_hours', '7PM-10PM', 'viewing_preferences', 'news_sports')),
(2, 'internet', 
    jsonb_build_object('data_consumption', '28.3GB', 'peak_hours', '2-6PM', 'devices', 4, 'usage_type', 'gaming'), 
    '2024-01-15', 18000,
    jsonb_build_object('device_count', 4, 'peak_hours', '2PM-6PM', 'usage_type', 'gaming')),
(3, 'internet', 
    jsonb_build_object('data_consumption', '32.1GB', 'peak_hours', '9-12PM', 'devices', 6, 'usage_type', 'work_communication'), 
    '2024-01-15', 16000,
    jsonb_build_object('device_count', 6, 'peak_hours', '9AM-12PM', 'usage_type', 'work_communication'));

-- Insert customer feedback
INSERT INTO customer_feedback (customer_id, service_type, rating, feedback_text, feedback_category, sentiment_score, metadata) VALUES
(1, 'internet', 5, 'Excellent service, very fast and reliable', 'service_quality', 0.9,
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'low', 'escalation_required', false)),
(1, 'cable_tv', 4, 'Good picture quality, but could use more channels', 'service_quality', 0.6,
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'medium', 'escalation_required', false)),
(2, 'internet', 5, 'Amazing speed, perfect for gaming', 'service_quality', 0.9,
    jsonb_build_object('feedback_source', 'online_review', 'priority_level', 'low', 'escalation_required', false)),
(3, 'internet', 4, 'Reliable service, good customer support', 'service_quality', 0.7,
    jsonb_build_object('feedback_source', 'customer_survey', 'priority_level', 'low', 'escalation_required', false));

-- Insert cross-service adoption data
INSERT INTO cross_service_adoption (customer_id, service_type, adoption_status, adoption_date, usage_frequency, metadata) VALUES
(1, 'cable_tv', 'adopted', '2024-01-01', 'daily',
    jsonb_build_object('bundle_discount', 15.0, 'promotional_period', '6_months', 'retention_rate', 85.2)),
(2, 'telephony', 'adopted', '2024-01-01', 'weekly',
    jsonb_build_object('bundle_discount', 10.0, 'promotional_period', '3_months', 'retention_rate', 72.8)),
(3, 'cable_tv', 'adopted', '2024-01-01', 'daily',
    jsonb_build_object('bundle_discount', 12.5, 'promotional_period', '6_months', 'retention_rate', 78.9));

-- Insert network infrastructure data
INSERT INTO network_infrastructure (estate_id, infrastructure_type, capacity, coverage_quality, technology, last_maintenance_date) VALUES
(1, 'fiber', 1000, 4.9, 'GPON', '2023-12-15'),
(1, 'hybrid', 500, 4.8, 'DOCSIS 3.1', '2023-11-20'),
(2, 'fiber', 500, 4.9, 'GPON', '2023-12-10'),
(3, 'wireless', 200, 4.7, '5G', '2023-10-25');

-- Insert capacity metrics
INSERT INTO capacity_metrics (infrastructure_id, utilization_rate, performance_metrics, peak_hours, measurement_period) VALUES
(1, 65.5, jsonb_build_object('latency', 15, 'packet_loss', 0.1, 'jitter', 5), 
    jsonb_build_object('morning', '7-9AM', 'evening', '6-9PM'), '2024-01-15 12:00:00'),
(2, 45.8, jsonb_build_object('latency', 20, 'packet_loss', 0.2, 'jitter', 8), 
    jsonb_build_object('morning', '8-10AM', 'evening', '7-10PM'), '2024-01-15 12:00:00'),
(3, 72.3, jsonb_build_object('latency', 12, 'packet_loss', 0.05, 'jitter', 3), 
    jsonb_build_object('morning', '7-9AM', 'evening', '6-9PM'), '2024-01-15 12:00:00'),
(4, 58.7, jsonb_build_object('latency', 25, 'packet_loss', 0.3, 'jitter', 10), 
    jsonb_build_object('morning', '9-11AM', 'evening', '5-8PM'), '2024-01-15 12:00:00');

-- Insert infrastructure investments
INSERT INTO infrastructure_investments (estate_id, investment_type, amount, investment_date, expected_completion_date, roi_metrics, description) VALUES
(1, 'fiber_upgrade', 25000000, '2024-01-15', '2024-06-30', 
    jsonb_build_object('expected_roi', 18.5, 'payback_period', '18_months', 'irr', 15.2),
    'Fiber network expansion project by TechBuild NG'),
(2, 'equipment_replacement', 15000000, '2024-02-01', '2024-04-30', 
    jsonb_build_object('expected_roi', 22.3, 'payback_period', '12_months', 'irr', 18.5),
    'Router and switch upgrade by NetEquip Solutions'),
(3, 'wireless_expansion', 8000000, '2024-01-20', '2024-03-31', 
    jsonb_build_object('expected_roi', 15.8, 'payback_period', '24_months', 'irr', 12.8),
    '5G tower installation by Wireless Tech NG');

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
