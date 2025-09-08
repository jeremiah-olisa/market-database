// QueryOrchestrator.js
import { pool } from '../utils/index.js';

// Import query modules
import * as estateQueries from './estateQueries.js';
import * as competitiveQueries from './competitiveQueries.js';
import * as customerQueries from './customerQueries.js';
import * as infrastructureQueries from './infrastructureQueries.js';
import * as financialQueries from './financialQueries.js';
import * as businessQueries from './businessQueries.js';

class QueryOrchestrator {
    constructor() {
        this.modules = {
            estates: estateQueries,
            competitive: competitiveQueries,
            customer: customerQueries,
            infrastructure: infrastructureQueries,
            financial: financialQueries,
            business: businessQueries
        };
    }

    async testConnection() {
        try {
            const result = await pool.query("SELECT NOW()");
            return {
                success: true,
                timestamp: result.rows[0].now
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getSystemOverview() {
        try {
            const [
                estatesCount,
                areasCount,
                customersCount,
                businessesCount,
                providersCount,
                tierDistribution
            ] = await Promise.all([
                this.modules.estates.getEstatesCount(),
                this.modules.estates.getAreasCount(),
                this.modules.customer.getCustomersCount(),
                this.modules.business.getBusinessesCount(),
                this.modules.competitive.getProvidersCount(),
                this.modules.estates.getTierDistribution()
            ]);

            return {
                totalEstates: estatesCount,
                totalAreas: areasCount,
                totalCustomers: customersCount,
                totalBusinesses: businessesCount,
                totalProviders: providersCount,
                tierDistribution: tierDistribution
            };
        } catch (error) {
            throw new Error(`Error getting system overview: ${error.message}`);
        }
    }

    async runComprehensiveAnalysis() {
        const analysis = {
            systemOverview: await this.getSystemOverview(),
            estateAnalysis: await this.modules.estates.runEstateAnalysis(),
            competitiveAnalysis: await this.modules.competitive.runCompetitiveAnalysis(),
            customerAnalysis: await this.modules.customer.runCustomerAnalysis(),
            infrastructureAnalysis: await this.modules.infrastructure.runInfrastructureAnalysis(),
            financialAnalysis: await this.modules.financial.runFinancialAnalysis(),
            businessAnalysis: await this.modules.business.runBusinessAnalysis()
        };

        return analysis;
    }
}

export default new QueryOrchestrator();