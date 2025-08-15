import pool from "../utils/pool.js";

// Customer Intelligence Queries
export const customerIntelligenceQueries = {
  // Get customer segmentation analysis by estate tier
  async getCustomerSegmentationAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.tier_classification,
          COUNT(DISTINCT cp.id) as customer_count,
          AVG(cp.satisfaction_score) as avg_satisfaction_rating,
          AVG(cp.tenure_months) as avg_tenure_months,
          AVG(up.usage_metrics->>'data_consumption_gb')::numeric as avg_data_usage,
          COUNT(DISTINCT up.service_type) as services_used,
          STRING_AGG(DISTINCT cp.lifestyle_indicators->>'internet_usage', ', ') as usage_patterns
        FROM estates e
        LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
        LEFT JOIN usage_patterns up ON cp.id = up.customer_id
        GROUP BY e.tier_classification
        ORDER BY avg_satisfaction_rating DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get customer satisfaction and feedback analysis
  async getCustomerSatisfactionAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.name as estate_name,
          e.tier_classification,
          COUNT(cp.id) as total_customers,
          AVG(cp.satisfaction_score) as avg_satisfaction,
          COUNT(cf.id) as feedback_count,
          AVG(cf.rating) as avg_feedback_rating,
          COUNT(CASE WHEN cf.feedback_type = 'positive' THEN 1 END) as positive_feedback,
          COUNT(CASE WHEN cf.feedback_type = 'negative' THEN 1 END) as negative_feedback,
          STRING_AGG(DISTINCT cf.feedback_text, ' | ') as recent_feedback
        FROM estates e
        LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
        LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id
        GROUP BY e.id, e.name, e.tier_classification
        ORDER BY avg_satisfaction DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get usage pattern analysis by customer segment
  async getUsagePatternAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          cp.lifestyle_indicators->>'internet_usage' as usage_level,
          cp.demographics->>'age_group' as age_group,
          cp.demographics->>'income_level' as income_level,
          COUNT(*) as customer_count,
          AVG(up.usage_metrics->>'data_consumption_gb')::numeric as avg_data_consumption,
          AVG(up.service_quality_rating) as avg_service_quality,
          STRING_AGG(DISTINCT up.service_type, ', ') as services_used,
          AVG(up.usage_metrics->>'average_session_duration')::numeric as avg_session_duration
        FROM customer_profiles cp
        JOIN usage_patterns up ON cp.id = up.customer_id
        GROUP BY 
          cp.lifestyle_indicators->>'internet_usage',
          cp.demographics->>'age_group',
          cp.demographics->>'income_level'
        ORDER BY avg_data_consumption DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get customer lifetime value analysis
  async getCustomerLifetimeValueAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.tier_classification,
          AVG(cp.tenure_months) as avg_tenure_months,
          AVG(ra.average_revenue_per_customer) as avg_revenue_per_customer,
          AVG(cp.tenure_months * ra.average_revenue_per_customer) as estimated_lifetime_value,
          COUNT(DISTINCT cp.id) as customer_count,
          SUM(ra.amount) as total_revenue
        FROM estates e
        LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
        LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id
        WHERE ra.revenue_type = 'subscription'
        GROUP BY e.tier_classification
        ORDER BY estimated_lifetime_value DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get customer churn risk analysis
  async getCustomerChurnRiskAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.name as estate_name,
          cp.id as customer_id,
          cp.satisfaction_score,
          cp.tenure_months,
          up.service_quality_rating,
          cf.rating as feedback_rating,
          CASE 
            WHEN cp.satisfaction_score < 3 OR up.service_quality_rating < 3 THEN 'High Risk'
            WHEN cp.satisfaction_score < 4 OR up.service_quality_rating < 4 THEN 'Medium Risk'
            ELSE 'Low Risk'
          END as churn_risk,
          STRING_AGG(DISTINCT cf.feedback_text, ' | ') as recent_feedback
        FROM estates e
        JOIN customer_profiles cp ON e.id = cp.estate_id
        LEFT JOIN usage_patterns up ON cp.id = up.customer_id
        LEFT JOIN customer_feedback cf ON cp.id = cf.customer_id
        GROUP BY e.name, cp.id, cp.satisfaction_score, cp.tenure_months, up.service_quality_rating, cf.rating
        ORDER BY churn_risk, cp.satisfaction_score ASC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }
};

export default customerIntelligenceQueries;
