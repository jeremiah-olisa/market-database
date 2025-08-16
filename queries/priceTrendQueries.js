import { pool } from '../utils/index.js';

/**
 * Price Trend Queries Module
 * Provides price trend analysis and insights
 */
export async function runPriceTrendQueries() {
    console.log("📈 Running Price Trend Queries...");
    
    try {
        // Get price trend overview by area and unit type
        const priceTrendOverview = await pool.query(`
            SELECT 
                a.name as area_name,
                a.state,
                pt.unit_type,
                pt.price_type,
                COUNT(pt.id) as data_points,
                AVG(pt.price) as avg_price,
                MIN(pt.price) as min_price,
                MAX(pt.price) as max_price,
                MIN(pt.period) as earliest_date,
                MAX(pt.period) as latest_date
            FROM price_trends pt
            JOIN areas a ON pt.area_id = a.id
            GROUP BY a.name, a.state, pt.unit_type, pt.price_type
            ORDER BY a.name, pt.unit_type, pt.price_type
        `);
        
        console.log(`✅ Price Trend Overview: ${priceTrendOverview.rows.length} trend records found`);
        
        // Get price trend analysis by area
        const priceTrendByArea = await pool.query(`
            SELECT 
                a.name as area_name,
                a.state,
                pt.unit_type,
                pt.price_type,
                COUNT(pt.id) as data_points,
                AVG(pt.price) as avg_price,
                MIN(pt.price) as min_price,
                MAX(pt.price) as max_price,
                ROUND(
                    (MAX(pt.price) - MIN(pt.price)) / MIN(pt.price) * 100, 2
                ) as price_variation_percentage
            FROM price_trends pt
            JOIN areas a ON pt.area_id = a.id
            GROUP BY a.name, a.state, pt.unit_type, pt.price_type
            ORDER BY a.name, pt.unit_type, pt.price_type
        `);
        
        console.log(`✅ Price Trend by Area: ${priceTrendByArea.rows.length} area-based trend records found`);
        
        // Get monthly price trends
        const monthlyPriceTrends = await pool.query(`
            SELECT 
                DATE_TRUNC('month', pt.period) as month,
                pt.unit_type,
                pt.price_type,
                COUNT(pt.id) as data_points,
                AVG(pt.price) as avg_price,
                ROUND(
                    (AVG(pt.price) - LAG(AVG(pt.price)) OVER (
                        PARTITION BY pt.unit_type, pt.price_type 
                        ORDER BY DATE_TRUNC('month', pt.period)
                    )) / LAG(AVG(pt.price)) OVER (
                        PARTITION BY pt.unit_type, pt.price_type 
                        ORDER BY DATE_TRUNC('month', pt.period)
                    ) * 100, 2
                ) as month_over_month_change
            FROM price_trends pt
            GROUP BY DATE_TRUNC('month', pt.period), pt.unit_type, pt.price_type
            ORDER BY month, pt.unit_type, pt.price_type
        `);
        
        console.log(`✅ Monthly Price Trends: ${monthlyPriceTrends.rows.length} monthly trend records found`);
        
        return {
            overview: priceTrendOverview.rows,
            byArea: priceTrendByArea.rows,
            monthlyTrends: monthlyPriceTrends.rows
        };
        
    } catch (error) {
        console.error("❌ Error running price trend queries:", error.message);
        throw error;
    }
}
