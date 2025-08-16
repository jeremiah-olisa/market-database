import { pool } from '../utils/index.js';

/**
 * Area Queries Module
 * Provides area analysis and geographic insights
 */
export async function runAreaQueries() {
    console.log("🗺️  Running Area Queries...");
    
    try {
        // Get area overview with estate distribution
        const areaOverview = await pool.query(`
            SELECT 
                a.name,
                a.state,
                a.geo_code,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.classification = 'luxury' THEN 1 END) as luxury_estates,
                COUNT(CASE WHEN e.classification = 'middle_income' THEN 1 END) as middle_income_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as low_income_estates,
                AVG(e.unit_count) as avg_unit_count
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.id, a.name, a.state, a.geo_code
            ORDER BY avg_unit_count DESC
        `);
        
        console.log(`✅ Area Overview: ${areaOverview.rows.length} areas found`);
        
        // Get area classification distribution
        const areaClassificationDistribution = await pool.query(`
            SELECT 
                a.name as area_name,
                a.state,
                e.classification,
                COUNT(e.id) as estate_count,
                ROUND(
                    COUNT(e.id)::decimal / SUM(COUNT(e.id)) OVER (PARTITION BY a.name) * 100, 2
                ) as percentage_in_area
            FROM areas a
            JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state, e.classification
            ORDER BY a.name, 
                CASE e.classification 
                    WHEN 'luxury' THEN 1 
                    WHEN 'middle_income' THEN 2 
                    WHEN 'low_income' THEN 3 
                END
        `);
        
        console.log(`✅ Area Classification Distribution: ${areaClassificationDistribution.rows.length} distribution records found`);
        
        return {
            overview: areaOverview.rows,
            classificationDistribution: areaClassificationDistribution.rows
        };
        
    } catch (error) {
        console.error("❌ Error running area queries:", error.message);
        throw error;
    }
}
