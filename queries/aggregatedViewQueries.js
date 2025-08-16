import { pool } from '../utils/index.js';

/**
 * Aggregated View Queries Module
 * Provides comprehensive aggregated analytical views
 */
export async function runAggregatedViewQueries() {
    console.log("📊 Running Aggregated View Queries...");
    
    try {
        // Get comprehensive market overview
        const marketOverview = await pool.query(`
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.classification = 'luxury' THEN 1 END) as luxury_estates,
                COUNT(CASE WHEN e.classification = 'middle_income' THEN 1 END) as middle_income_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as low_income_estates,
                ROUND(
                    COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END)::decimal / 
                    COUNT(DISTINCT e.id)::decimal * 100, 2
                ) as premium_estate_percentage
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state
            ORDER BY avg_unit_count DESC
        `);
        
        console.log(`✅ Market Overview: ${marketOverview.rows.length} market overview records found`);
        
        // Get business expansion opportunities
        const businessExpansionOpportunities = await pool.query(`
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(DISTINCT e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(DISTINCT e.id)::decimal * 100, 2
                ) as occupancy_rate
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY avg_unit_count DESC
        `);
        
        console.log(`✅ Business Expansion Opportunities: ${businessExpansionOpportunities.rows.length} opportunity records found`);
        
        // Get operational intelligence summary
        const operationalIntelligence = await pool.query(`
            SELECT 
                e.classification,
                COUNT(DISTINCT e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(DISTINCT e.id)::decimal * 100, 2
                ) as occupancy_rate,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates
            FROM estates e
            GROUP BY e.classification
            ORDER BY 
                CASE e.classification 
                    WHEN 'luxury' THEN 1 
                    WHEN 'middle_income' THEN 2 
                    WHEN 'low_income' THEN 3 
                END
        `);
        
        console.log(`✅ Operational Intelligence: ${operationalIntelligence.rows.length} operational records found`);
        
        return {
            marketOverview: marketOverview.rows,
            businessExpansionOpportunities: businessExpansionOpportunities.rows,
            operationalIntelligence: operationalIntelligence.rows
        };
        
    } catch (error) {
        console.error("❌ Error running aggregated view queries:", error.message);
        throw error;
    }
}
