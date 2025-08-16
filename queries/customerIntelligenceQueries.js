import { pool } from '../utils/index.js';

/**
 * Customer Intelligence Queries Module
 * Provides customer analytics and behavior insights
 * Note: Extended intelligence tables not yet implemented - using core schema data
 */
export const customerIntelligenceQueries = {
    /**
     * Get estate unit usage patterns analysis
     */
    async getCustomerUsagePatterns() {
        const query = `
            SELECT 
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
            GROUP BY e.classification, e.estate_type
            ORDER BY e.classification, e.estate_type
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate performance metrics by classification
     */
    async getCustomerSatisfactionMetrics() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.classification,
                COUNT(eu.id) as total_units,
                COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_units,
                COUNT(CASE WHEN eu.status = 'vacant' THEN 1 END) as vacant_units,
                ROUND(
                    COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END)::decimal / 
                    COUNT(eu.id)::decimal * 100, 2
                ) as satisfaction_rate
            FROM estates e
            LEFT JOIN estate_units eu ON e.id = eu.estate_id
            GROUP BY e.id, e.name, e.classification
            ORDER BY satisfaction_rate DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate lifestyle analysis by classification
     */
    async getCustomerLifestyleAnalysis() {
        const query = `
            SELECT 
                e.classification,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                COUNT(CASE WHEN e.estate_type = 'bungalow' THEN 1 END) as bungalow_estates,
                COUNT(CASE WHEN e.estate_type = 'duplex' THEN 1 END) as duplex_estates,
                COUNT(CASE WHEN e.estate_type = 'block_of_flats' THEN 1 END) as block_estates,
                ROUND(
                    COUNT(CASE WHEN e.gated = true THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as gated_percentage
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
     * Get cross-service adoption analysis (using estate features)
     */
    async getCrossServiceAdoption() {
        const query = `
            SELECT 
                e.classification,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                ROUND(
                    COUNT(CASE WHEN e.gated = true THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as gated_adoption_rate,
                ROUND(
                    COUNT(CASE WHEN e.has_security = true THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as security_adoption_rate
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
     * Get estate demographic analysis by classification
     */
    async getCustomerDemographicAnalysis() {
        const query = `
            SELECT 
                e.classification,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.unit_count BETWEEN 1 AND 10 THEN 1 END) as small_estates,
                COUNT(CASE WHEN e.unit_count BETWEEN 11 AND 50 THEN 1 END) as medium_estates,
                COUNT(CASE WHEN e.unit_count > 50 THEN 1 END) as large_estates,
                COUNT(CASE WHEN e.estate_type = 'bungalow' THEN 1 END) as bungalow_count,
                COUNT(CASE WHEN e.estate_type = 'duplex' THEN 1 END) as duplex_count,
                COUNT(CASE WHEN e.estate_type = 'block_of_flats' THEN 1 END) as block_count
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
    }
};
