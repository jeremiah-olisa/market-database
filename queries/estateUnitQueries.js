import { pool } from '../utils/index.js';

/**
 * Estate Unit Queries Module
 * Provides estate unit analysis and insights
 */
export async function runEstateUnitQueries() {
    console.log("🏠 Running Estate Unit Queries...");
    
    try {
        // Get estate unit overview
        const unitOverview = await pool.query(`
            SELECT 
                e.name as estate_name,
                e.classification,
                e.estate_type,
                COUNT(eu.id) as total_units,
                COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_units,
                COUNT(CASE WHEN eu.status = 'vacant' THEN 1 END) as vacant_units,
                COUNT(CASE WHEN eu.status = 'under_construction' THEN 1 END) as under_construction_units,
                ROUND(
                    COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END)::decimal / 
                    COUNT(eu.id)::decimal * 100, 2
                ) as occupancy_rate
            FROM estates e
            LEFT JOIN estate_units eu ON e.id = eu.estate_id
            GROUP BY e.id, e.name, e.classification, e.estate_type
            ORDER BY occupancy_rate DESC
        `);
        
        console.log(`✅ Estate Unit Overview: ${unitOverview.rows.length} estate unit records found`);
        
        // Get unit type analysis
        const unitTypeAnalysis = await pool.query(`
            SELECT 
                eu.unit_type,
                COUNT(eu.id) as total_units,
                AVG(eu.rent_price) as avg_rent_price,
                AVG(eu.sale_price) as avg_sale_price,
                COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_count,
                COUNT(CASE WHEN eu.status = 'vacant' THEN 1 END) as vacant_count,
                ROUND(
                    COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END)::decimal / 
                    COUNT(eu.id)::decimal * 100, 2
                ) as occupancy_rate
            FROM estate_units eu
            GROUP BY eu.unit_type
            ORDER BY total_units DESC
        `);
        
        console.log(`✅ Unit Type Analysis: ${unitTypeAnalysis.rows.length} unit type records found`);
        
        // Get pricing analysis by estate classification
        const pricingAnalysis = await pool.query(`
            SELECT 
                e.classification,
                eu.unit_type,
                COUNT(eu.id) as total_units,
                AVG(eu.rent_price) as avg_rent_price,
                AVG(eu.sale_price) as avg_sale_price,
                MIN(eu.rent_price) as min_rent_price,
                MAX(eu.rent_price) as max_rent_price,
                MIN(eu.sale_price) as min_sale_price,
                MAX(eu.sale_price) as max_sale_price
            FROM estate_units eu
            JOIN estates e ON eu.estate_id = e.id
            WHERE eu.rent_price IS NOT NULL OR eu.sale_price IS NOT NULL
            GROUP BY e.classification, eu.unit_type
            ORDER BY e.classification, eu.unit_type
        `);
        
        console.log(`✅ Pricing Analysis: ${pricingAnalysis.rows.length} pricing records found`);
        
        return {
            overview: unitOverview.rows,
            unitTypeAnalysis: unitTypeAnalysis.rows,
            pricingAnalysis: pricingAnalysis.rows
        };
        
    } catch (error) {
        console.error("❌ Error running estate unit queries:", error.message);
        throw error;
    }
}
