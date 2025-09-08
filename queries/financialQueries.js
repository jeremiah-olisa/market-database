// queries/financialQueries.js
import { pool } from '../utils/index.js';

export async function getRevenueByService() {
    const result = await pool.query(`
        SELECT service_category,
               SUM(revenue) as total_revenue,
               SUM(customer_count) as total_customers,
               AVG(growth_rate) as avg_growth_rate
        FROM cross_platform_revenue
        WHERE period = (SELECT MAX(period) FROM cross_platform_revenue)
        GROUP BY service_category
        ORDER BY total_revenue DESC
    `);
    return result.rows;
}

export async function getRevenueByTier() {
    const result = await pool.query(`
        SELECT e.tier,
               SUM(cpr.revenue) as total_revenue,
               AVG(cpr.growth_rate) as avg_growth_rate
        FROM cross_platform_revenue cpr
        JOIN estates e ON cpr.estate_id = e.id
        WHERE cpr.period = (SELECT MAX(period) FROM cross_platform_revenue)
        GROUP BY e.tier
        ORDER BY total_revenue DESC
    `);
    return result.rows;
}

export async function getMarketOpportunities() {
    const result = await pool.query(`
        SELECT opportunity_type,
               COUNT(*) as opportunity_count,
               AVG(potential_revenue) as avg_potential_revenue,
               AVG(probability) as avg_probability
        FROM market_opportunities
        WHERE probability > 0.5
        GROUP BY opportunity_type
        ORDER BY avg_potential_revenue DESC
        LIMIT 10
    `);
    return result.rows;
}

export async function runFinancialAnalysis() {
    const [revenueByService, revenueByTier, opportunities] = await Promise.all([
        getRevenueByService(),
        getRevenueByTier(),
        getMarketOpportunities()
    ]);

    return {
        revenueByService,
        revenueByTier,
        opportunities
    };
}