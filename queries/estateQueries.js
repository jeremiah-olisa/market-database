// queries/estateQueries.js
import { pool } from '../utils/index.js';

export async function getEstatesCount() {
    const result = await pool.query("SELECT COUNT(*) FROM estates");
    return parseInt(result.rows[0].count);
}

export async function getAreasCount() {
    const result = await pool.query("SELECT COUNT(*) FROM areas");
    return parseInt(result.rows[0].count);
}

export async function getTierDistribution() {
    const result = await pool.query(`
        SELECT tier, COUNT(*) as count
        FROM estates 
        GROUP BY tier 
        ORDER BY 
            CASE tier 
                WHEN 'platinum' THEN 1 
                WHEN 'gold' THEN 2 
                WHEN 'silver' THEN 3 
                WHEN 'bronze' THEN 4 
            END
    `);
    return result.rows;
}

export async function getTopEstatesByPropertyValue(limit = 5) {
    const result = await pool.query(`
        SELECT name, tier, unit_count, 
               (economic_indicators->>'property_value')::numeric as property_value
        FROM estates 
        ORDER BY (economic_indicators->>'property_value')::numeric DESC 
        LIMIT $1
    `, [limit]);
    return result.rows;
}

export async function getTierDemographics() {
    const result = await pool.query(`
        SELECT e.tier, 
               AVG(d.total_population) as avg_population,
               AVG(d.avg_household_income) as avg_income,
               COUNT(e.id) as estate_count
        FROM estates e
        JOIN demographics d ON e.id = d.estate_id
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

export async function runEstateAnalysis() {
    const [topEstates, tierDemographics] = await Promise.all([
        getTopEstatesByPropertyValue(5),
        getTierDemographics()
    ]);

    return {
        topEstates,
        tierDemographics
    };
}