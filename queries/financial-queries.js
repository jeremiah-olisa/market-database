const { pool } = require('../utils');

/**
 * Financial Intelligence Queries
 * Provides queries for revenue analysis, investment tracking, and financial performance metrics
 */

class FinancialQueries {
    /**
     * Get comprehensive financial performance dashboard
     */
    async getFinancialPerformanceDashboard() {
        const query = `
            SELECT 
                e.tier_classification,
                COUNT(DISTINCT e.id) as estate_count,
                SUM(ra.amount) as total_revenue,
                SUM(it.amount) as total_investment,
                (SUM(ra.amount) - SUM(it.amount)) as net_profit,
                AVG(it.expected_roi) as avg_expected_roi,
                AVG(it.actual_roi) as avg_actual_roi,
                COUNT(mo.id) as opportunity_count,
                SUM(mo.potential_value) as total_opportunity_value
            FROM estates e
            LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id
            LEFT JOIN investment_tracking it ON e.id = it.estate_id
            LEFT JOIN market_opportunities mo ON e.id = mo.estate_id
            GROUP BY e.tier_classification
            ORDER BY total_revenue DESC NULLS LAST
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching financial performance dashboard: ${error.message}`);
        }
    }

    /**
     * Get revenue analysis by estate tier and period
     */
    async getRevenueAnalysisByTier(period = 'monthly') {
        const dateFormat = period === 'monthly' ? 'month' : 'quarter';
        const query = `
            SELECT 
                e.tier_classification,
                DATE_TRUNC('${dateFormat}', ra.period) as period,
                SUM(ra.amount) as total_revenue,
                COUNT(DISTINCT ra.id) as transaction_count,
                AVG(ra.amount) as avg_transaction_value,
                ra.revenue_type
            FROM estates e
            JOIN revenue_analytics ra ON e.id = ra.estate_id
            WHERE ra.period >= CURRENT_DATE - INTERVAL '1 year'
            GROUP BY e.tier_classification, DATE_TRUNC('${dateFormat}', ra.period), ra.revenue_type
            ORDER BY period DESC, total_revenue DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching revenue analysis by tier: ${error.message}`);
        }
    }

    /**
     * Get investment tracking and ROI analysis
     */
    async getInvestmentTrackingAnalysis() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                it.investment_type,
                it.amount,
                it.investment_date,
                it.expected_roi,
                it.actual_roi,
                it.status,
                CASE 
                    WHEN it.actual_roi > 0 THEN ((it.actual_roi - it.expected_roi) / it.expected_roi * 100)
                    ELSE 0 
                END as roi_variance_percentage,
                ra.amount as revenue_generated,
                (ra.amount - it.amount) as net_return
            FROM investment_tracking it
            JOIN estates e ON it.estate_id = e.id
            LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id 
                AND ra.period >= it.investment_date
            ORDER BY it.investment_date DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching investment tracking analysis: ${error.message}`);
        }
    }

    /**
     * Get market opportunities analysis by estate
     */
    async getMarketOpportunitiesAnalysis() {
        const query = `
            SELECT 
                e.name as estate_name,
                e.tier_classification,
                e.market_potential_score,
                mo.opportunity_type,
                mo.potential_value,
                mo.risk_assessment,
                mo.implementation_timeline,
                mo.priority_level,
                COUNT(lb.id) as business_count,
                AVG(d.population) as population,
                AVG(d.income_levels->>'high') as high_income_percentage
            FROM market_opportunities mo
            JOIN estates e ON mo.estate_id = e.id
            LEFT JOIN local_businesses lb ON e.id = lb.estate_id
            LEFT JOIN demographics d ON e.id = d.estate_id
            GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score,
                     mo.opportunity_type, mo.potential_value, mo.risk_assessment,
                     mo.implementation_timeline, mo.priority_level
            ORDER BY mo.priority_level DESC, mo.potential_value DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching market opportunities analysis: ${error.message}`);
        }
    }

    /**
     * Get financial performance comparison by area
     */
    async getFinancialPerformanceByArea() {
        const query = `
            SELECT 
                a.name as area_name,
                a.state,
                COUNT(DISTINCT e.id) as estate_count,
                SUM(ra.amount) as total_revenue,
                SUM(it.amount) as total_investment,
                (SUM(ra.amount) - SUM(it.amount)) as net_profit,
                AVG(e.market_potential_score) as avg_market_potential,
                COUNT(mo.id) as opportunity_count,
                SUM(mo.potential_value) as total_opportunity_value,
                ROUND((SUM(ra.amount) / COUNT(DISTINCT e.id)), 2) as revenue_per_estate
            FROM areas a
            JOIN estates e ON a.id = e.area_id
            LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id
            LEFT JOIN investment_tracking it ON e.id = it.estate_id
            LEFT JOIN market_opportunities mo ON e.id = mo.estate_id
            GROUP BY a.id, a.name, a.state
            ORDER BY total_revenue DESC NULLS LAST
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching financial performance by area: ${error.message}`);
        }
    }

    /**
     * Get revenue trends over time for specific estate
     */
    async getRevenueTrendsByEstate(estateId, months = 12) {
        const query = `
            SELECT 
                DATE_TRUNC('month', ra.period) as month,
                ra.revenue_type,
                SUM(ra.amount) as total_revenue,
                COUNT(ra.id) as transaction_count,
                AVG(ra.amount) as avg_transaction_value
            FROM revenue_analytics ra
            WHERE ra.estate_id = $1 
                AND ra.period >= CURRENT_DATE - INTERVAL '${months} months'
            GROUP BY DATE_TRUNC('month', ra.period), ra.revenue_type
            ORDER BY month DESC, total_revenue DESC
        `;
        
        try {
            const result = await pool.query(query, [estateId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching revenue trends for estate ${estateId}: ${error.message}`);
        }
    }

    /**
     * Get investment ROI performance by investment type
     */
    async getInvestmentROIByType() {
        const query = `
            SELECT 
                it.investment_type,
                COUNT(it.id) as investment_count,
                SUM(it.amount) as total_invested,
                AVG(it.expected_roi) as avg_expected_roi,
                AVG(it.actual_roi) as avg_actual_roi,
                SUM(ra.amount) as total_revenue_generated,
                CASE 
                    WHEN SUM(it.amount) > 0 THEN (SUM(ra.amount) - SUM(it.amount)) / SUM(it.amount) * 100
                    ELSE 0 
                END as overall_roi_percentage,
                COUNT(CASE WHEN it.actual_roi >= it.expected_roi THEN 1 END) as successful_investments,
                ROUND((COUNT(CASE WHEN it.actual_roi >= it.expected_roi THEN 1 END)::DECIMAL / COUNT(it.id) * 100), 2) as success_rate
            FROM investment_tracking it
            LEFT JOIN revenue_analytics ra ON it.estate_id = ra.estate_id 
                AND ra.period >= it.investment_date
            GROUP BY it.investment_type
            ORDER BY overall_roi_percentage DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching investment ROI by type: ${error.message}`);
        }
    }

    /**
     * Get financial health score for estates
     */
    async getEstateFinancialHealthScore() {
        const query = `
            SELECT 
                e.id,
                e.name as estate_name,
                e.tier_classification,
                e.market_potential_score,
                COALESCE(SUM(ra.amount), 0) as total_revenue,
                COALESCE(SUM(it.amount), 0) as total_investment,
                COALESCE(SUM(ra.amount), 0) - COALESCE(SUM(it.amount), 0) as net_profit,
                CASE 
                    WHEN COALESCE(SUM(it.amount), 0) > 0 THEN 
                        (COALESCE(SUM(ra.amount), 0) - COALESCE(SUM(it.amount), 0)) / COALESCE(SUM(it.amount), 0) * 100
                    ELSE 0 
                END as roi_percentage,
                COUNT(mo.id) as opportunity_count,
                COALESCE(SUM(mo.potential_value), 0) as opportunity_value,
                -- Financial Health Score Calculation
                (
                    CASE WHEN COALESCE(SUM(ra.amount), 0) > 0 THEN 25 ELSE 0 END +
                    CASE WHEN COALESCE(SUM(ra.amount), 0) - COALESCE(SUM(it.amount), 0) > 0 THEN 25 ELSE 0 END +
                    CASE WHEN e.market_potential_score > 7 THEN 25 ELSE e.market_potential_score * 3.57 END +
                    CASE WHEN COUNT(mo.id) > 0 THEN 25 ELSE 0 END
                ) as financial_health_score
            FROM estates e
            LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id
            LEFT JOIN investment_tracking it ON e.id = it.estate_id
            LEFT JOIN market_opportunities mo ON e.id = mo.estate_id
            GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score
            ORDER BY financial_health_score DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching estate financial health scores: ${error.message}`);
        }
    }

    /**
     * Get cash flow analysis by period
     */
    async getCashFlowAnalysis(period = 'monthly') {
        const dateFormat = period === 'monthly' ? 'month' : 'quarter';
        const query = `
            SELECT 
                DATE_TRUNC('${dateFormat}', COALESCE(ra.period, it.investment_date)) as period,
                COALESCE(SUM(ra.amount), 0) as cash_inflow,
                COALESCE(SUM(it.amount), 0) as cash_outflow,
                COALESCE(SUM(ra.amount), 0) - COALESCE(SUM(it.amount), 0) as net_cash_flow,
                COUNT(DISTINCT ra.estate_id) as revenue_estates,
                COUNT(DISTINCT it.estate_id) as investment_estates
            FROM (
                SELECT estate_id, period, amount FROM revenue_analytics
                UNION ALL
                SELECT estate_id, investment_date as period, -amount as amount FROM investment_tracking
            ) combined
            LEFT JOIN revenue_analytics ra ON combined.estate_id = ra.estate_id AND combined.period = ra.period
            LEFT JOIN investment_tracking it ON combined.estate_id = it.estate_id AND combined.period = it.investment_date
            WHERE COALESCE(ra.period, it.investment_date) >= CURRENT_DATE - INTERVAL '1 year'
            GROUP BY DATE_TRUNC('${dateFormat}', COALESCE(ra.period, it.investment_date))
            ORDER BY period DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching cash flow analysis: ${error.message}`);
        }
    }
}

module.exports = new FinancialQueries();
