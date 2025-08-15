const { pool } = require('../utils');

/**
 * Infrastructure Intelligence Queries
 * Provides queries for network infrastructure analysis, capacity planning, and investment tracking
 */

class InfrastructureQueries {
    /**
     * Get network infrastructure overview for all estates
     */
    async getInfrastructureOverview() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                ni.infrastructure_type,
                ni.coverage_quality,
                ni.capacity,
                ni.status,
                cm.utilization_rate,
                cm.performance_metrics,
                ni.created_at
            FROM network_infrastructure ni
            JOIN estates e ON ni.estate_id = e.id
            LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
            ORDER BY e.tier_classification, e.name
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching infrastructure overview: ${error.message}`);
        }
    }

    /**
     * Get capacity utilization analysis by estate tier
     */
    async getCapacityUtilizationByTier() {
        const query = `
            SELECT 
                e.tier_classification,
                COUNT(ni.id) as infrastructure_count,
                AVG(cm.utilization_rate) as avg_utilization_rate,
                MAX(cm.utilization_rate) as max_utilization_rate,
                MIN(cm.utilization_rate) as min_utilization_rate,
                AVG(ni.capacity) as avg_capacity,
                SUM(ni.capacity) as total_capacity
            FROM estates e
            JOIN network_infrastructure ni ON e.id = ni.estate_id
            LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
            GROUP BY e.tier_classification
            ORDER BY e.tier_classification
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching capacity utilization by tier: ${error.message}`);
        }
    }

    /**
     * Get network performance metrics for specific estate
     */
    async getNetworkPerformanceByEstate(estateId) {
        const query = `
            SELECT 
                ni.infrastructure_type,
                ni.coverage_quality,
                ni.capacity,
                cm.utilization_rate,
                cm.performance_metrics,
                cm.last_updated,
                AVG(cf.rating) as customer_satisfaction_rating
            FROM network_infrastructure ni
            LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
            LEFT JOIN customer_feedback cf ON ni.estate_id = cf.estate_id
            WHERE ni.estate_id = $1
            GROUP BY ni.id, ni.infrastructure_type, ni.coverage_quality, ni.capacity, 
                     cm.utilization_rate, cm.performance_metrics, cm.last_updated
        `;
        
        try {
            const result = await pool.query(query, [estateId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching network performance for estate ${estateId}: ${error.message}`);
        }
    }

    /**
     * Get infrastructure investment ROI analysis
     */
    async getInvestmentROIAnalysis() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                ii.investment_type,
                ii.amount,
                ii.expected_roi,
                ii.actual_roi,
                ii.investment_date,
                ra.amount as revenue_generated,
                (ra.amount - ii.amount) as net_profit,
                CASE 
                    WHEN ra.amount > 0 THEN ((ra.amount - ii.amount) / ii.amount * 100)
                    ELSE 0 
                END as roi_percentage
            FROM infrastructure_investments ii
            JOIN estates e ON ii.estate_id = e.id
            LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id 
                AND ra.period >= ii.investment_date
            ORDER BY ii.investment_date DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching investment ROI analysis: ${error.message}`);
        }
    }

    /**
     * Get capacity planning recommendations
     */
    async getCapacityPlanningRecommendations() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                ni.infrastructure_type,
                ni.capacity,
                cm.utilization_rate,
                CASE 
                    WHEN cm.utilization_rate > 80 THEN 'High - Consider expansion'
                    WHEN cm.utilization_rate > 60 THEN 'Medium - Monitor closely'
                    ELSE 'Low - Adequate capacity'
                END as capacity_status,
                CASE 
                    WHEN cm.utilization_rate > 80 THEN ni.capacity * 1.5
                    WHEN cm.utilization_rate > 60 THEN ni.capacity * 1.2
                    ELSE ni.capacity
                END as recommended_capacity
            FROM estates e
            JOIN network_infrastructure ni ON e.id = ni.estate_id
            LEFT JOIN capacity_metrics cm ON ni.id = cm.infrastructure_id
            WHERE cm.utilization_rate > 50
            ORDER BY cm.utilization_rate DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching capacity planning recommendations: ${error.message}`);
        }
    }

    /**
     * Get infrastructure coverage gaps analysis
     */
    async getCoverageGapsAnalysis() {
        const query = `
            SELECT 
                a.name as area_name,
                COUNT(e.id) as total_estates,
                COUNT(ni.id) as estates_with_infrastructure,
                (COUNT(e.id) - COUNT(ni.id)) as estates_without_infrastructure,
                ROUND((COUNT(ni.id)::DECIMAL / COUNT(e.id) * 100), 2) as coverage_percentage,
                AVG(e.market_potential_score) as avg_market_potential
            FROM areas a
            JOIN estates e ON a.id = e.area_id
            LEFT JOIN network_infrastructure ni ON e.id = ni.estate_id
            GROUP BY a.id, a.name
            HAVING COUNT(ni.id) < COUNT(e.id)
            ORDER BY coverage_percentage ASC, avg_market_potential DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching coverage gaps analysis: ${error.message}`);
        }
    }

    /**
     * Get infrastructure performance trends over time
     */
    async getInfrastructurePerformanceTrends(estateId, months = 12) {
        const query = `
            SELECT 
                DATE_TRUNC('month', cm.last_updated) as month,
                AVG(cm.utilization_rate) as avg_utilization,
                AVG(CAST(cm.performance_metrics->>'latency' AS DECIMAL)) as avg_latency,
                AVG(CAST(cm.performance_metrics->>'throughput' AS DECIMAL)) as avg_throughput,
                COUNT(DISTINCT ni.id) as infrastructure_count
            FROM capacity_metrics cm
            JOIN network_infrastructure ni ON cm.infrastructure_id = ni.id
            WHERE ni.estate_id = $1 
                AND cm.last_updated >= CURRENT_DATE - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', cm.last_updated)
            ORDER BY month DESC
        `;
        
        try {
            const result = await pool.query(query, [estateId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching infrastructure performance trends: ${error.message}`);
        }
    }

    /**
     * Get infrastructure investment summary by area
     */
    async getInfrastructureInvestmentByArea() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as estate_count,
                COUNT(DISTINCT ii.id) as investment_count,
                SUM(ii.amount) as total_investment,
                AVG(ii.expected_roi) as avg_expected_roi,
                AVG(ii.actual_roi) as avg_actual_roi,
                AVG(e.market_potential_score) as avg_market_potential
            FROM areas a
            JOIN estates e ON a.id = e.area_id
            LEFT JOIN infrastructure_investments ii ON e.id = ii.estate_id
            GROUP BY a.id, a.name, a.state
            ORDER BY total_investment DESC NULLS LAST
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching infrastructure investment by area: ${error.message}`);
        }
    }
}

module.exports = new InfrastructureQueries();
