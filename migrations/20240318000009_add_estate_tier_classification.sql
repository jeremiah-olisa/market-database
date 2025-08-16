-- Estate tier enum
DO $$ BEGIN
    CREATE TYPE estate_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add tier column to estates table
ALTER TABLE estates
ADD COLUMN tier estate_tier NOT NULL DEFAULT 'bronze';

-- Create index for tier column
CREATE INDEX IF NOT EXISTS idx_estates_tier ON estates(tier);

-- Create materialized view for tier-based analytics
CREATE MATERIALIZED VIEW estate_tier_analytics AS
SELECT 
    e.tier,
    COUNT(DISTINCT e.id) as estate_count,
    COUNT(DISTINCT eu.id) as total_units,
    COUNT(DISTINCT CASE WHEN eu.status = 'occupied' THEN eu.id END) as occupied_units,
    ROUND(AVG(CASE WHEN eu.rent_price IS NOT NULL THEN eu.rent_price END), 2) as avg_rent_price,
    ROUND(AVG(CASE WHEN eu.sale_price IS NOT NULL THEN eu.sale_price END), 2) as avg_sale_price,
    COUNT(DISTINCT cp.id) as total_customers,
    json_build_object(
        'fully_occupied', COUNT(DISTINCT CASE WHEN e.occupancy_status = 'fully_occupied' THEN e.id END),
        'vacant', COUNT(DISTINCT CASE WHEN e.occupancy_status = 'vacant' THEN e.id END),
        'under_construction', COUNT(DISTINCT CASE WHEN e.occupancy_status = 'under_construction' THEN e.id END)
    ) as occupancy_distribution
FROM 
    estates e
    LEFT JOIN estate_units eu ON e.id = eu.estate_id
    LEFT JOIN customer_profiles cp ON eu.id = cp.estate_unit_id
GROUP BY 
    e.tier;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON estate_tier_analytics (tier);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_estate_tier_analytics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY estate_tier_analytics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the materialized view
CREATE TRIGGER refresh_estate_tier_analytics_on_estate_change
    AFTER INSERT OR UPDATE OR DELETE ON estates
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_estate_tier_analytics();

CREATE TRIGGER refresh_estate_tier_analytics_on_unit_change
    AFTER INSERT OR UPDATE OR DELETE ON estate_units
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_estate_tier_analytics();

CREATE TRIGGER refresh_estate_tier_analytics_on_customer_change
    AFTER INSERT OR UPDATE OR DELETE ON customer_profiles
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_estate_tier_analytics();
