// queries/competitiveQueries.js
import { pool } from '../utils/index.js';

export async function getProvidersCount() {
    const result = await pool.query("SELECT COUNT(*) FROM service_providers");
    return parseInt(result.rows[0].count);
}

export async function getMarketShareByProvider() {
    const result = await pool.query(`
        SELECT sp.name as provider,
               AVG(ms.market_share_percentage) as avg_market_share,
               SUM(ms.total_customers) as total_customers,
               SUM(ms.revenue) as total_revenue
        FROM market_share_data ms
        JOIN service_providers sp ON ms.provider_id = sp.id
        WHERE ms.period = (SELECT MAX(period) FROM market_share_data)
        GROUP BY sp.name
        ORDER BY avg_market_share DESC
        LIMIT 10
    `);
    return result.rows;
}

export async function getServiceQualityComparison() {
    const result = await pool.query(`
        SELECT sqm.service_type,
               AVG(sqm.uptime_percentage) as avg_uptime,
               AVG(sqm.avg_response_time) as avg_response_time,
               AVG(sqm.customer_satisfaction_score) as avg_satisfaction
        FROM service_quality_metrics sqm
        WHERE sqm.period = (SELECT MAX(period) FROM service_quality_metrics)
        GROUP BY sqm.service_type
        ORDER BY avg_uptime DESC
    `);
    return result.rows;
}

export async function getCompetitiveBenchmarks() {
    const result = await pool.query(`
        SELECT cb.comparison_date,
               AVG(cb.price_difference) as avg_price_difference,
               AVG(cb.market_positioning_score) as avg_positioning_score
        FROM competitive_benchmarking cb
        GROUP BY cb.comparison_date
        ORDER BY cb.comparison_date DESC
        LIMIT 6
    `);
    return result.rows;
}

export async function runCompetitiveAnalysis() {
    const [marketShare, serviceQuality, benchmarks] = await Promise.all([
        getMarketShareByProvider(),
        getServiceQualityComparison(),
        getCompetitiveBenchmarks()
    ]);

    return {
        marketShare,
        serviceQuality,
        benchmarks
    };
}