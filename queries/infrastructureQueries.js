import { pool } from '../utils/index.js';

/**
 * Infrastructure Queries Module
 * Provides network infrastructure and capacity analysis
 * Note: Extended intelligence tables not yet implemented - using core schema data
 */
export const infrastructureQueries = {
    /**
     * Get estate infrastructure coverage analysis by area
     */
    async getNetworkInfrastructureCoverage() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as total_estates,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.classification = 'luxury' THEN 1 END) as luxury_estates,
                COUNT(CASE WHEN e.classification = 'middle_income' THEN 1 END) as middle_income_estates,
                COUNT(CASE WHEN e.classification = 'low_income' THEN 1 END) as low_income_estates
            FROM areas a
            LEFT JOIN estates e ON a.id = e.area_id
            GROUP BY a.name, a.state
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate capacity metrics analysis
     */
    async getCapacityMetricsAnalysis() {
        const query = `
            SELECT 
                e.classification as estate_classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.unit_count > 50 THEN 1 END) as high_capacity_estates,
                COUNT(CASE WHEN e.unit_count BETWEEN 11 AND 50 THEN 1 END) as medium_capacity_estates,
                COUNT(CASE WHEN e.unit_count <= 10 THEN 1 END) as low_capacity_estates,
                ROUND(
                    COUNT(CASE WHEN e.unit_count > 50 THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as high_capacity_percentage
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate investment analysis by classification
     */
    async getInfrastructureInvestmentROI() {
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
                ) as occupancy_rate
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY avg_unit_count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate maintenance analysis by classification
     */
    async getMaintenanceScheduleAnalysis() {
        const query = `
            SELECT 
                e.classification,
                e.estate_type,
                COUNT(e.id) as total_estates,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_estates,
                COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
                COUNT(CASE WHEN e.occupancy_status = 'under_construction' THEN 1 END) as under_construction_estates,
                ROUND(
                    COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                    COUNT(e.id)::decimal * 100, 2
                ) as maintenance_ready_percentage
            FROM estates e
            GROUP BY e.classification, e.estate_type
            ORDER BY maintenance_ready_percentage DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Get estate quality metrics by area
     */
    async getInfrastructureQualityByArea() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as total_estates,
                AVG(e.unit_count) as avg_unit_count,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_estates,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as secured_estates,
                COUNT(CASE WHEN e.classification IN ('luxury', 'middle_income') THEN 1 END) as premium_estates,
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
