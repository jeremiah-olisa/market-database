import { pool } from '../utils/index.js';

/**
 * Market Intelligence Queries Module
 * Provides competitive analysis and market insights
 * Note: Extended intelligence tables not yet implemented - using core schema data
 */
export const marketIntelligenceQueries = {
    /**
     * Get competitive landscape analysis by area (using core estate data)
     */
    async getCompetitiveLandscape() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as total_estates,
                COUNT(CASE WHEN e.classification = 'luxury' THEN 1 END) as luxury_estates,
                COUNT(CASE WHEN e.classification = 'middle_income' THEN 1 END) as middle_income_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as low_income_estates,
                AVG(e.unit_count) as avg_unit_count,
                ROUND(
                    COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END)::decimal / 
                    COUNT(DISTINCT e.id)::decimal * 100, 2
                ) as premium_estate_percentage
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get market share analysis by estate classification
     */
    async getMarketShareAnalysis() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                COUNT(DISTINCT a.id) as areas_covered,
                AVG(e.unit_count) as avg_unit_count,
                ROUND(
                    COUNT(e.id)::decimal / 
                    (SELECT COUNT(*) FROM estates)::decimal * 100, 2
                ) as market_share_percentage
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            GROUP BY e.classification, e.estate_type
            ORDER BY market_share_percentage DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate coverage analysis by classification
     */
    async getServiceProviderCoverage() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END) as premium_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as standard_estates,
                ROUND(
                    COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as premium_coverage_rate
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY total_estates DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get market penetration metrics by area
     */
    async getMarketPenetrationMetrics() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END) as premium_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as standard_estates,
                ROUND(
                    COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END)::decimal / 
                    COUNT(DISTINCT e.id)::decimal * 100, 2
                ) as premium_estate_percentage
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate offerings comparison by classification
     */
    async getServiceOfferingsComparison() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as occupancy_rate
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
};
