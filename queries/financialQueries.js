import { pool } from '../utils/index.js';

/**
 * Financial Queries Module
 * Provides investment tracking and financial performance analysis
 * Note: Extended intelligence tables not yet implemented - using core schema data
 */
export const financialQueries = {
    /**
     * Get estate investment analysis by classification
     */
    async getInvestmentPlansAnalysis() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                e.name as estate_name,
                e.unit_count,
                e.gated,
                e.has_security,
                e.occupancy_status,
                ROUND(
                    COUNT(CASE WHEN eu.rent_price IS NOT NULL THEN 1 END)::decimal / 
                    COUNT(eu.id)::decimal * 100, 2
                ) as rental_availability_rate
            FROM estates e
            LEFT JOIN estate_units eu ON e.id = eu.estate_id
            GROUP BY e.id, e.classification, e.estate_type, e.name, e.unit_count, e.gated, e.has_security, e.occupancy_status
            ORDER BY e.unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate expenditure analysis by classification
     */
    async getCapitalExpenditureAnalysis() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                ROUND(
                    COUNT(CASE WHEN e.gated = true THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as gated_percentage
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate ROI analysis by classification
     */
    async getROITrackingAnalysis() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as occupancy_rate,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as vacancy_rate
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY occupancy_rate DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate performance metrics by classification
     */
    async getInvestmentPerformanceMetrics() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as performance_score
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY performance_score DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get financial performance by area
     */
    async getFinancialPerformanceByArea() {
        const query = `
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
                ) as premium_percentage
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
};
