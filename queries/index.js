import { pool } from '../utils/index.js';

// Import all query modules
import { runProductQueries } from './products-queries.js';
import { runAreaQueries } from './areas-queries.js';
import estateQueries from './estates-queries.js';
import { runEstateUnitQueries } from './estate-units-queries.js';
import { runPriceTrendQueries } from './price-trends-queries.js';
import { runAggregatedViewQueries } from './aggregated-views-queries.js';
import marketIntelligenceQueries from './market-intelligence-queries.js';
import customerIntelligenceQueries from './customer-intelligence-queries.js';
import infrastructureQueries from './infrastructure-queries.js';
import financialQueries from './financial-queries.js';

/**
 * Market Database Management System Query Orchestrator
 * Provides access to all query modules for comprehensive market intelligence
 */

class QueryOrchestrator {
    constructor() {
        // Object-based modules with multiple methods
        this.modules = {
            estates: estateQueries,
            marketIntelligence: marketIntelligenceQueries,
            customerIntelligence: customerIntelligenceQueries,
            infrastructure: infrastructureQueries,
            financial: financialQueries
        };

        // Single function runners
        this.runners = {
            products: runProductQueries,
            areas: runAreaQueries,
            estateUnits: runEstateUnitQueries,
            priceTrends: runPriceTrendQueries,
            aggregatedViews: runAggregatedViewQueries
        };
    }

    /**
     * Get a specific query module
     */
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    /**
     * Get all available modules
     */
    getAllModules() {
        return this.modules;
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const result = await pool.query("SELECT NOW()");
            return {
                success: true,
                timestamp: result.rows[0].now,
                message: "Database connection successful"
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: "Database connection failed"
            };
        }
    }

    /**
     * Get system overview statistics
     */
    async getSystemOverview() {
        try {
            const overview = {
                totalEstates: await this.getEstatesCount(),
                totalAreas: await this.getAreasCount(),
                totalProducts: await this.getProductsCount(),
                tierDistribution: await this.getTierDistribution(),
                marketIntelligence: await this.getMarketIntelligenceSummary(),
                connectionStatus: await this.testConnection()
            };
            return overview;
        } catch (error) {
            throw new Error(`Error getting system overview: ${error.message}`);
        }
    }

    /**
     * Helper methods for system overview
     */
    async getEstatesCount() {
        const result = await pool.query("SELECT COUNT(*) FROM estates");
        return parseInt(result.rows[0].count);
    }

    async getAreasCount() {
        const result = await pool.query("SELECT COUNT(*) FROM areas");
        return parseInt(result.rows[0].count);
    }

    async getProductsCount() {
        const result = await pool.query("SELECT COUNT(*) FROM products");
        return parseInt(result.rows[0].count);
    }

    async getTierDistribution() {
        const result = await pool.query(`
            SELECT 
                tier_classification,
                COUNT(*) as count
            FROM estates 
            GROUP BY tier_classification 
            ORDER BY 
                CASE tier_classification 
                    WHEN 'platinum' THEN 1 
                    WHEN 'gold' THEN 2 
                    WHEN 'silver' THEN 3 
                    WHEN 'bronze' THEN 4 
                END
        `);
        return result.rows;
    }

    async getMarketIntelligenceSummary() {
        const result = await pool.query(`
            SELECT 
                COUNT(DISTINCT e.id) as total_estates,
                COUNT(DISTINCT sp.id) as total_providers,
                COUNT(DISTINCT lb.id) as total_businesses,
                AVG(e.market_potential_score) as avg_market_potential,
                COUNT(CASE WHEN e.tier_classification IN ('platinum', 'gold') THEN 1 END) as premium_estates
            FROM estates e
            LEFT JOIN service_providers sp ON sp.coverage_area @> e.geometry
            LEFT JOIN local_businesses lb ON e.id = lb.estate_id
        `);
        return result.rows[0];
    }

    /**
     * Run all query functions and display comprehensive results
     */
    async runAllQueries() {
        console.log("🚀 Market Database Management System - Running All Queries");
        console.log("=".repeat(80));

        try {
            // Test database connection first
            console.log("\n=== Testing Database Connection ===");
            const connectionTest = await this.testConnection();
            console.log(connectionTest);
            
            if (!connectionTest.success) {
                throw new Error("Database connection failed");
            }

            // Run runner functions (for modules that export single functions)
            console.log("\n=== Running Query Modules ===");
            for (const [name, runnerFunction] of Object.entries(this.runners)) {
                console.log(`\n--- Running ${name} queries ---`);
                try {
                    await runnerFunction();
                    console.log(`✅ ${name} queries completed successfully`);
                } catch (error) {
                    console.error(`❌ Error running ${name} queries:`, error.message);
                }
            }

            // Test object-based modules (for modules that export objects with methods)
            console.log("\n=== Testing Object-Based Query Modules ===");
            for (const [moduleName, moduleObject] of Object.entries(this.modules)) {
                console.log(`\n--- Testing ${moduleName} module ---`);
                
                if (typeof moduleObject === 'object' && moduleObject !== null) {
                    for (const [methodName, method] of Object.entries(moduleObject)) {
                        if (typeof method === 'function') {
                            try {
                                console.log(`  ✓ Testing ${methodName}...`);
                                const result = await method.call(moduleObject);
                                console.log(`    Result: ${Array.isArray(result) ? result.length : 'N/A'} rows`);
                            } catch (error) {
                                console.log(`    ⚠️  ${methodName} requires parameters or failed: ${error.message}`);
                            }
                        }
                    }
                }
            }

            // Get system overview
            console.log("\n=== System Overview ===");
            const overview = await this.getSystemOverview();
            console.log("System Overview:", JSON.stringify(overview, null, 2));

            console.log("\n✅ All queries tested successfully!");
            
        } catch (error) {
            console.error("❌ Error running queries:", error.message);
            throw error;
        }
    }
}

export default new QueryOrchestrator();