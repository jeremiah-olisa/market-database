import { pool } from '../utils/index.js';

/**
 * Product Queries Module
 * Provides product analysis and insights
 */
export async function runProductQueries() {
    console.log("📦 Running Product Queries...");
    
    try {
        // Get product overview
        const productOverview = await pool.query(`
            SELECT 
                p.name,
                p.status,
                COUNT(e.id) as estates_using,
                AVG(e.unit_count) as avg_unit_count
            FROM products p
            LEFT JOIN estates e ON p.id = e.product_id
            GROUP BY p.id, p.name, p.status
            ORDER BY estates_using DESC
        `);
        
        console.log(`✅ Product Overview: ${productOverview.rows.length} products found`);
        
        // Get product performance by classification
        const productPerformance = await pool.query(`
            SELECT 
                p.name as product_name,
                e.classification,
                COUNT(e.id) as estate_count,
                AVG(e.unit_count) as avg_unit_count
            FROM products p
            JOIN estates e ON p.id = e.product_id
            GROUP BY p.name, e.classification
            ORDER BY p.name, 
                CASE e.classification 
                    WHEN 'luxury' THEN 1 
                    WHEN 'middle_income' THEN 2 
                    WHEN 'low_income' THEN 3 
                END
        `);
        
        console.log(`✅ Product Performance: ${productPerformance.rows.length} performance records found`);
        
        return {
            overview: productOverview.rows,
            performance: productPerformance.rows
        };
        
    } catch (error) {
        console.error("❌ Error running product queries:", error.message);
        throw error;
    }
}
