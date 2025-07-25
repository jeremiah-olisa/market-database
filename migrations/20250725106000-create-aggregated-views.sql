-- Creating aggregated views for market analysis
-- These views demonstrate how the schema supports data aggregation

-- View 1: Estate Summary by Area
CREATE VIEW estate_summary_by_area AS
SELECT 
    a.name as area_name,
    a.state,
    COUNT(e.id) as total_estates,
    SUM(e.unit_count) as total_units,
    AVG(e.unit_count) as avg_units_per_estate,
    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as occupied_estates,
    COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
    COUNT(CASE WHEN e.classification = 'luxury' THEN 1 END) as luxury_estates,
    COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates
FROM estates e
JOIN areas a ON e.area_id = a.id
GROUP BY a.id, a.name, a.state;

-- View 2: Price Trends Summary
CREATE VIEW price_trends_summary AS
SELECT 
    pt.unit_type,
    pt.price_type,
    a.name as area_name,
    COUNT(*) as data_points,
    AVG(pt.price) as avg_price,
    MIN(pt.price) as min_price,
    MAX(pt.price) as max_price,
    DATE_TRUNC('month', pt.period) as month
FROM price_trends pt
JOIN areas a ON pt.area_id = a.id
GROUP BY pt.unit_type, pt.price_type, a.name, DATE_TRUNC('month', pt.period);

-- View 3: Market Performance by Product
CREATE VIEW market_performance_by_product AS
SELECT 
    p.name as product_name,
    COUNT(DISTINCT e.id) as estates_count,
    COUNT(DISTINCT eu.id) as units_count,
    AVG(eu.rent_price) as avg_rent_price,
    AVG(eu.sale_price) as avg_sale_price,
    COUNT(CASE WHEN eu.status = 'vacant' THEN 1 END) as vacant_units,
    COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_units
FROM products p
LEFT JOIN estates e ON p.id = e.product_id
LEFT JOIN estate_units eu ON e.id = eu.estate_id
GROUP BY p.id, p.name;

-- View 4: Monthly Price Trends
CREATE VIEW monthly_price_trends AS
SELECT 
    DATE_TRUNC('month', pt.period) as month,
    pt.price_type,
    pt.unit_type,
    a.name as area_name,
    AVG(pt.price) as avg_price,
    COUNT(*) as data_points,
    LAG(AVG(pt.price)) OVER (
        PARTITION BY pt.price_type, pt.unit_type, a.name 
        ORDER BY DATE_TRUNC('month', pt.period)
    ) as prev_month_avg,
    ((AVG(pt.price) - LAG(AVG(pt.price)) OVER (
        PARTITION BY pt.price_type, pt.unit_type, a.name 
        ORDER BY DATE_TRUNC('month', pt.period)
    )) / LAG(AVG(pt.price)) OVER (
        PARTITION BY pt.price_type, pt.unit_type, a.name 
        ORDER BY DATE_TRUNC('month', pt.period)
    ) * 100) as price_change_percent
FROM price_trends pt
JOIN areas a ON pt.area_id = a.id
GROUP BY DATE_TRUNC('month', pt.period), pt.price_type, pt.unit_type, a.name;

-- View 5: Occupancy Analysis
CREATE VIEW occupancy_analysis AS
SELECT 
    e.classification,
    e.estate_type,
    a.name as area_name,
    COUNT(e.id) as total_estates,
    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied,
    COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant,
    COUNT(CASE WHEN e.occupancy_status = 'under_construction' THEN 1 END) as under_construction,
    ROUND(
        (COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::DECIMAL / COUNT(e.id) * 100), 2
    ) as occupancy_rate_percent
FROM estates e
JOIN areas a ON e.area_id = a.id
GROUP BY e.classification, e.estate_type, a.name;

-- Add indexes to improve view performance
CREATE INDEX idx_price_trends_period_price_type ON price_trends(period, price_type, unit_type);
CREATE INDEX idx_estates_classification_type ON estates(classification, estate_type, occupancy_status); 