import { pool } from '../utils/index.js';

/**
 * Enhanced Estate Queries with Tier Classification Support
 * Provides comprehensive estate analysis including tier classification, market potential, and competitive intelligence
 */

class EstateQueries {
    /**
     * Get all estates with enhanced information including tier classification
     */
    async getAllEstates() {
        const query = `
            SELECT 
                e.id, e.name, e.estate_type, e.unit_count, e.occupancy_status, 
                e.classification, e.gated, e.has_security, e.tier_classification,
                e.market_potential_score, e.competitive_intensity,
                p.name as product_name, p.service_category, p.pricing_tier,
                a.name as area_name, a.state, a.population_density,
                COUNT(eu.id) as total_units,
                COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_units,
                COUNT(CASE WHEN eu.status = 'vacant' THEN 1 END) as vacant_units
            FROM estates e
            JOIN products p ON e.product_id = p.id
            JOIN areas a ON e.area_id = a.id
            LEFT JOIN estate_units eu ON e.id = eu.estate_id
            GROUP BY e.id, e.name, e.estate_type, e.unit_count, e.occupancy_status, 
                     e.classification, e.gated, e.has_security, e.tier_classification,
                     e.market_potential_score, e.competitive_intensity,
                     p.name, p.service_category, p.pricing_tier,
                     a.name, a.state, a.population_density
            ORDER BY e.tier_classification DESC, e.market_potential_score DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching all estates: ${error.message}`);
        }
    }

    /**
     * Get estates analysis by type with tier classification
     */
    async getEstatesByType() {
        const query = `
            SELECT 
                e.estate_type,
                e.tier_classification,
                COUNT(*) as count,
                AVG(e.unit_count) as avg_units,
                SUM(e.unit_count) as total_units,
                AVG(e.market_potential_score) as avg_market_potential,
                AVG(e.competitive_intensity) as avg_competitive_intensity
            FROM estates e
            GROUP BY e.estate_type, e.tier_classification
            ORDER BY e.estate_type, e.tier_classification DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estates by type: ${error.message}`);
        }
    }

    /**
     * Get estates analysis by tier classification
     */
    async getEstatesByTierClassification() {
        const query = `
            SELECT 
                e.tier_classification,
                COUNT(*) as count,
                AVG(e.unit_count) as avg_units,
                SUM(e.unit_count) as total_units,
                AVG(e.market_potential_score) as avg_market_potential,
                AVG(e.competitive_intensity) as avg_competitive_intensity,
                COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_count,
                COUNT(CASE WHEN e.has_security = true THEN 1 END) as security_count,
                COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as fully_occupied_count
            FROM estates e
            GROUP BY e.tier_classification
            ORDER BY 
                CASE e.tier_classification 
                    WHEN 'platinum' THEN 1 
                    WHEN 'gold' THEN 2 
                    WHEN 'silver' THEN 3 
                    WHEN 'bronze' THEN 4 
                END
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estates by tier classification: ${error.message}`);
        }
    }

    /**
     * Get estates analysis by occupancy status with tier classification
     */
    async getEstatesByOccupancyStatus() {
        const query = `
            SELECT 
                e.occupancy_status,
                e.tier_classification,
                COUNT(*) as count,
                AVG(e.unit_count) as avg_units,
                SUM(e.unit_count) as total_units,
                AVG(e.market_potential_score) as avg_market_potential
            FROM estates e
            GROUP BY e.occupancy_status, e.tier_classification
            ORDER BY e.occupancy_status, e.tier_classification DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estates by occupancy status: ${error.message}`);
        }
    }

    /**
     * Get estates with security features and tier classification
     */
    async getEstatesWithSecurityFeatures() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                e.classification,
                e.estate_type,
                e.unit_count,
                e.gated,
                e.has_security,
                e.market_potential_score,
                a.name as area_name,
                p.name as product_name
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            JOIN products p ON e.product_id = p.id
            WHERE e.gated = true OR e.has_security = true
            ORDER BY e.tier_classification DESC, e.gated DESC, e.has_security DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estates with security features: ${error.message}`);
        }
    }

    /**
     * Get high-potential estates analysis by tier
     */
    async getHighPotentialEstates() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                e.estate_type,
                e.unit_count,
                e.occupancy_status,
                e.market_potential_score,
                e.competitive_intensity,
                e.gated,
                e.has_security,
                a.name as area_name,
                a.population_density,
                p.name as product_name,
                p.service_category
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            JOIN products p ON e.product_id = p.id
            WHERE e.market_potential_score >= 7.0
            ORDER BY e.market_potential_score DESC, e.tier_classification DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching high-potential estates: ${error.message}`);
        }
    }

    /**
     * Get estates by market potential score range
     */
    async getEstatesByMarketPotential() {
        const query = `
            SELECT 
                CASE 
                    WHEN e.market_potential_score >= 8.0 THEN 'Very High (8.0-10.0)'
                    WHEN e.market_potential_score >= 6.0 THEN 'High (6.0-7.9)'
                    WHEN e.market_potential_score >= 4.0 THEN 'Medium (4.0-5.9)'
                    ELSE 'Low (0.0-3.9)'
                END as potential_category,
                COUNT(*) as estate_count,
                AVG(e.market_potential_score) as avg_score,
                AVG(e.competitive_intensity) as avg_competitive_intensity,
                COUNT(CASE WHEN e.tier_classification IN ('platinum', 'gold') THEN 1 END) as premium_estates
            FROM estates e
            GROUP BY 
                CASE 
                    WHEN e.market_potential_score >= 8.0 THEN 'Very High (8.0-10.0)'
                    WHEN e.market_potential_score >= 6.0 THEN 'High (6.0-7.9)'
                    WHEN e.market_potential_score >= 4.0 THEN 'Medium (4.0-5.9)'
                    ELSE 'Low (0.0-3.9)'
                END
            ORDER BY avg_score DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estates by market potential: ${error.message}`);
        }
    }

    /**
     * Get competitive analysis by estate tier
     */
    async getCompetitiveAnalysisByTier() {
        const query = `
            SELECT 
                e.tier_classification,
                COUNT(*) as estate_count,
                AVG(e.competitive_intensity) as avg_competitive_intensity,
                COUNT(CASE WHEN e.competitive_intensity >= 7 THEN 1 END) as high_competition_count,
                COUNT(CASE WHEN e.competitive_intensity <= 3 THEN 1 END) as low_competition_count,
                AVG(e.market_potential_score) as avg_market_potential,
                COUNT(DISTINCT a.id) as area_count
            FROM estates e
            JOIN areas a ON e.area_id = a.id
            GROUP BY e.tier_classification
            ORDER BY 
                CASE e.tier_classification 
                    WHEN 'platinum' THEN 1 
                    WHEN 'gold' THEN 2 
                    WHEN 'silver' THEN 3 
                    WHEN 'bronze' THEN 4 
                END
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching competitive analysis by tier: ${error.message}`);
        }
    }
}

export default new EstateQueries(); 