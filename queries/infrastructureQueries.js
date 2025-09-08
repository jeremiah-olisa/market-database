// queries/infrastructureQueries.js
import { pool } from '../utils/index.js';

export async function getInfrastructureSummary() {
    const result = await pool.query(`
        SELECT infrastructure_type,
               COUNT(*) as count,
               AVG((capacity_specs->>'users_supported')::numeric) as avg_users_supported
        FROM network_infrastructure
        GROUP BY infrastructure_type
        ORDER BY count DESC
    `);
    return result.rows;
}

export async function getServiceQualityMetrics() {
    const result = await pool.query(`
        SELECT estate_id, service_type,
               AVG(uptime_percentage) as avg_uptime,
               AVG(avg_response_time) as avg_response_time,
               AVG(bandwidth_usage) as avg_bandwidth_usage
        FROM service_quality_metrics
        WHERE period >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY estate_id, service_type
        ORDER BY avg_uptime DESC
        LIMIT 10
    `);
    return result.rows;
}

export async function getInfrastructureByTier() {
    const result = await pool.query(`
        SELECT e.tier,
               COUNT(ni.id) as infrastructure_count,
               AVG((ni.capacity_specs->>'users_supported')::numeric) as avg_capacity
        FROM network_infrastructure ni
        JOIN estates e ON ni.estate_id = e.id
        GROUP BY e.tier
        ORDER BY 
            CASE e.tier 
                WHEN 'platinum' THEN 1 
                WHEN 'gold' THEN 2 
                WHEN 'silver' THEN 3 
                WHEN 'bronze' THEN 4 
            END
    `);
    return result.rows;
}

export async function runInfrastructureAnalysis() {
    const [summary, qualityMetrics, tierAnalysis] = await Promise.all([
        getInfrastructureSummary(),
        getServiceQualityMetrics(),
        getInfrastructureByTier()
    ]);

    return {
        summary,
        qualityMetrics,
        tierAnalysis
    };
}