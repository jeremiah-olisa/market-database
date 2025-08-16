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

-- Note: All data insertions have been moved to seeders to ensure proper foreign key relationships
-- This migration now only updates existing data and lets seeders handle new data insertion
