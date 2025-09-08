// queries/businessQueries.js
import { pool } from '../utils/index.js';

export async function getBusinessesCount() {
    const result = await pool.query("SELECT COUNT(*) FROM local_businesses");
    return parseInt(result.rows[0].count);
}

export async function getBusinessesByType() {
    const result = await pool.query(`
        SELECT business_type,
               COUNT(*) as count,
               AVG((business_metrics->>'monthly_revenue')::numeric) as avg_revenue
        FROM local_businesses
        GROUP BY business_type
        ORDER BY count DESC
    `);
    return result.rows;
}

export async function getBusinessesByTier() {
    const result = await pool.query(`
        SELECT e.tier,
               COUNT(lb.id) as business_count,
               AVG((lb.business_metrics->>'monthly_revenue')::numeric) as avg_revenue
        FROM local_businesses lb
        JOIN estates e ON lb.estate_id = e.id
        GROUP BY e.tier
        ORDER BY 
            CASE e.tier 
                WHEN 'platinum' THEN 1 
                WHEN 'gold' THEN 2 
                WHEN 'silver' THEN 3 
                WHEN 'bronze' THEN 4 
            END
    `);
    return result.rows;
}

export async function runBusinessAnalysis() {
    const [businessesByType, businessesByTier] = await Promise.all([
        getBusinessesByType(),
        getBusinessesByTier()
    ]);

    return {
        businessesByType,
        businessesByTier
    };
}