import { pool } from '../utils/index.js';

/**
 * Estate Queries Module
 * Provides comprehensive estate analysis and insights
 */
export const estateQueries = {
    /**
     * Get estate occupancy analysis by area and classification
     */
    async getEstateOccupancyAnalysis() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant,
                COUNT(CASE WHEN e.occupancy_status = 'under_construction' THEN 1 END) as under_construction,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as occupancy_rate
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            GROUP BY a.name, a.state, e.classification, e.estate_type
            ORDER BY a.name, e.classification, e.estate_type
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate classification distribution
     */
    async getEstateClassificationDistribution() {
        const query = `
            SELECT 
                classification,
                estate_type,
                COUNT(*) as count,
                ROUND(COUNT(*)::decimal / SUM(COUNT(*)) OVER() * 100, 2) as percentage
            FROM estates
            GROUP BY classification, estate_type
            ORDER BY classification, estate_type
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get vacancy rate analysis by area
     */
    async getVacancyRateAnalysis() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as vacancy_rate,
                AVG(e.unit_count) as avg_unit_count
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            GROUP BY a.name, a.state
            ORDER BY vacancy_rate DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate performance metrics by classification
     */
    async getEstatePerformanceMetrics() {
        const query = `
            SELECT 
                e.classification,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as overall_occupancy_rate
            FROM estates e
            GROUP BY e.classification
            ORDER BY 
                CASE e.classification 
                    WHEN 'luxury' THEN 1 
                    WHEN 'middle_income' THEN 2 
                    WHEN 'low_income' THEN 3 
                END
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate type performance analysis
     */
    async getEstateTypePerformance() {
        const query = `
            SELECT 
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as occupancy_rate,
                COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END) as premium_count
            FROM estates e
            GROUP BY e.estate_type
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
};
