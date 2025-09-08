// queries/customerQueries.js
import { pool } from '../utils/index.js';

export async function getCustomersCount() {
    const result = await pool.query("SELECT COUNT(*) FROM customer_profiles");
    return parseInt(result.rows[0].count);
}

export async function getCustomerDemographics() {
    const result = await pool.query(`
        SELECT age_bracket, income_bracket, COUNT(*) as count
        FROM customer_profiles
        GROUP BY age_bracket, income_bracket
        ORDER BY count DESC
        LIMIT 10
    `);
    return result.rows;
}

export async function getUsagePatterns() {
    const result = await pool.query(`
        SELECT service_type,
               AVG(data_consumed) as avg_data_consumed,
               AVG(usage_duration) as avg_usage_duration,
               COUNT(DISTINCT customer_id) as active_users
        FROM usage_patterns
        WHERE usage_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY service_type
        ORDER BY avg_data_consumed DESC
    `);
    return result.rows;
}

export async function getCustomerSatisfaction() {
    const result = await pool.query(`
        SELECT satisfaction_level,
               COUNT(*) as feedback_count,
               AVG(priority) as avg_priority
        FROM customer_feedback
        WHERE feedback_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY satisfaction_level
        ORDER BY 
            CASE satisfaction_level
                WHEN 'very_satisfied' THEN 1
                WHEN 'satisfied' THEN 2
                WHEN 'neutral' THEN 3
                WHEN 'dissatisfied' THEN 4
                WHEN 'very_dissatisfied' THEN 5
            END
    `);
    return result.rows;
}

export async function getChurnRiskAnalysis() {
    const result = await pool.query(`
        SELECT 
            CASE 
                WHEN churn_probability < 20 THEN 'Low Risk'
                WHEN churn_probability < 50 THEN 'Medium Risk'
                ELSE 'High Risk'
            END as risk_level,
            COUNT(*) as customer_count,
            AVG(churn_probability) as avg_probability
        FROM churn_risk_indicators
        WHERE assessment_date = (SELECT MAX(assessment_date) FROM churn_risk_indicators)
        GROUP BY risk_level
        ORDER BY avg_probability DESC
    `);
    return result.rows;
}

export async function runCustomerAnalysis() {
    const [demographics, usagePatterns, satisfaction, churnRisk] = await Promise.all([
        getCustomerDemographics(),
        getUsagePatterns(),
        getCustomerSatisfaction(),
        getChurnRiskAnalysis()
    ]);

    return {
        demographics,
        usagePatterns,
        satisfaction,
        churnRisk
    };
}