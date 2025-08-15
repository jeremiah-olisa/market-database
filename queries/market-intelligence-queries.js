import pool from "../utils/pool.js";

// Market Intelligence Queries
export const marketIntelligenceQueries = {
  // Get comprehensive market intelligence summary for all estates
  async getMarketIntelligenceSummary() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.id as estate_id,
          e.name as estate_name,
          e.tier_classification,
          e.market_potential_score,
          e.competitive_intensity,
          a.name as area_name,
          a.population_density,
          a.economic_activity_score,
          COUNT(DISTINCT sp.id) as competitor_count,
          AVG(msd.market_share) as avg_market_share,
          COUNT(lb.id) as business_count,
          d.population,
          d.employment_rate
        FROM estates e
        LEFT JOIN areas a ON e.area_id = a.id
        LEFT JOIN market_share_data msd ON e.id = msd.estate_id
        LEFT JOIN service_providers sp ON msd.provider_id = sp.id
        LEFT JOIN local_businesses lb ON e.id = lb.estate_id
        LEFT JOIN demographics d ON e.id = d.estate_id
        GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score, 
                 e.competitive_intensity, a.name, a.population_density, a.economic_activity_score,
                 d.population, d.employment_rate
        ORDER BY e.market_potential_score DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get competitive landscape analysis by area
  async getCompetitiveLandscapeAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          a.name as area_name,
          a.population_density,
          a.economic_activity_score,
          COUNT(DISTINCT sp.id) as total_providers,
          COUNT(DISTINCT e.id) as total_estates,
          AVG(e.market_potential_score) as avg_market_potential,
          SUM(msd.market_share) as total_market_share,
          AVG(e.competitive_intensity) as avg_competitive_intensity
        FROM areas a
        JOIN estates e ON a.id = e.area_id
        LEFT JOIN market_share_data msd ON e.id = msd.estate_id
        LEFT JOIN service_providers sp ON msd.provider_id = sp.id
        GROUP BY a.id, a.name, a.population_density, a.economic_activity_score
        ORDER BY a.economic_activity_score DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get service provider performance analysis
  async getServiceProviderPerformance() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          sp.name as provider_name,
          sp.service_type,
          sp.technology_stack,
          sp.network_capacity,
          COUNT(pc.estate_id) as estates_covered,
          AVG(pc.quality_metrics->>'signal_strength')::numeric as avg_signal_strength,
          AVG(pc.quality_metrics->>'uptime_percentage')::numeric as avg_uptime,
          AVG(msd.market_share) as avg_market_share,
          SUM(msd.revenue_share) as total_revenue_share
        FROM service_providers sp
        LEFT JOIN provider_coverage pc ON sp.id = pc.provider_id
        LEFT JOIN market_share_data msd ON sp.id = msd.provider_id
        GROUP BY sp.id, sp.name, sp.service_type, sp.technology_stack, sp.network_capacity
        ORDER BY avg_market_share DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get market opportunities by estate tier
  async getMarketOpportunitiesByTier() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.tier_classification,
          COUNT(mo.id) as opportunity_count,
          AVG(mo.potential_value) as avg_potential_value,
          SUM(mo.potential_value) as total_potential_value,
          AVG(mo.risk_assessment::numeric) as avg_risk_score,
          STRING_AGG(DISTINCT mo.opportunity_type, ', ') as opportunity_types
        FROM estates e
        LEFT JOIN market_opportunities mo ON e.id = mo.estate_id
        GROUP BY e.tier_classification
        ORDER BY avg_potential_value DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get demographic analysis by estate
  async getDemographicAnalysis() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          e.name as estate_name,
          e.tier_classification,
          d.population,
          d.age_groups,
          d.income_levels,
          d.education_levels,
          d.household_size,
          d.employment_rate,
          a.name as area_name,
          a.population_density
        FROM estates e
        JOIN demographics d ON e.id = d.estate_id
        JOIN areas a ON e.area_id = a.id
        ORDER BY d.population DESC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }
};

export default marketIntelligenceQueries;
