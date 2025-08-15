import pool from "../utils/pool.js";

export async function seedFinancial(client) {
  console.log("💰 Seeding financial data...");
  
  // First, seed revenue analytics
  const revenueAnalyticsData = [
    {
      estate_id: 1,
      revenue_type: 'subscription',
      amount: 2500000,
      period: '2024-01',
      customer_count: 500,
      average_revenue_per_customer: 5000,
      metadata: {
        service_breakdown: {
          internet: 60,
          cable_tv: 25,
          telephony: 15
        },
        payment_methods: {
          card: 40,
          bank_transfer: 35,
          mobile_money: 25
        }
      }
    },
    {
      estate_id: 2,
      revenue_type: 'subscription',
      amount: 1800000,
      period: '2024-01',
      customer_count: 300,
      average_revenue_per_customer: 6000,
      metadata: {
        service_breakdown: {
          internet: 70,
          cable_tv: 20,
          telephony: 10
        },
        payment_methods: {
          card: 30,
          bank_transfer: 50,
          mobile_money: 20
        }
      }
    },
    {
      estate_id: 3,
      revenue_type: 'subscription',
      amount: 1200000,
      period: '2024-01',
      customer_count: 200,
      average_revenue_per_customer: 6000,
      metadata: {
        service_breakdown: {
          internet: 80,
          cable_tv: 15,
          telephony: 5
        },
        payment_methods: {
          card: 20,
          bank_transfer: 30,
          mobile_money: 50
        }
      }
    }
  ];

  for (const data of revenueAnalyticsData) {
    await client.query(`
      INSERT INTO revenue_analytics (
        estate_id, revenue_type, amount, period, customer_count,
        average_revenue_per_customer, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.estate_id, data.revenue_type, data.amount, data.period,
      data.customer_count, data.average_revenue_per_customer, JSON.stringify(data.metadata)
    ]);
  }

  // Then, seed investment tracking
  const investmentTrackingData = [
    {
      estate_id: 1,
      investment_type: 'infrastructure_upgrade',
      amount: 50000000,
      expected_roi: 25,
      investment_period_months: 24,
      metadata: {
        project_scope: 'Fiber optic network expansion',
        contractor: 'TechBuild NG',
        timeline: '2024-2026',
        risk_level: 'low'
      }
    },
    {
      estate_id: 2,
      investment_type: 'network_optimization',
      amount: 30000000,
      expected_roi: 20,
      investment_period_months: 18,
      metadata: {
        project_scope: 'HFC network upgrade',
        contractor: 'NetSolutions Ltd',
        timeline: '2024-2025',
        risk_level: 'medium'
      }
    },
    {
      estate_id: 3,
      investment_type: 'technology_upgrade',
      amount: 20000000,
      expected_roi: 30,
      investment_period_months: 12,
      metadata: {
        project_scope: '5G network deployment',
        contractor: 'WirelessTech NG',
        timeline: '2024',
        risk_level: 'high'
      }
    }
  ];

  for (const data of investmentTrackingData) {
    await client.query(`
      INSERT INTO investment_tracking (
        estate_id, investment_type, amount, expected_roi,
        investment_period_months, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.estate_id, data.investment_type, data.amount, data.expected_roi,
      data.investment_period_months, JSON.stringify(data.metadata)
    ]);
  }

  // Finally, seed market opportunities
  const marketOpportunitiesData = [
    {
      estate_id: 1,
      opportunity_type: 'market_expansion',
      potential_value: 100000000,
      risk_assessment: 'low',
      timeframe_months: 36,
      metadata: {
        opportunity_description: 'Expand services to neighboring estates',
        target_market: 'Lekki Phase 2',
        competitive_advantage: 'Premium service quality',
        required_investment: 25000000
      }
    },
    {
      estate_id: 2,
      opportunity_type: 'service_diversification',
      potential_value: 75000000,
      risk_assessment: 'medium',
      timeframe_months: 24,
      metadata: {
        opportunity_description: 'Add smart home services',
        target_market: 'Existing customers',
        competitive_advantage: 'Integrated service offering',
        required_investment: 15000000
      }
    },
    {
      estate_id: 3,
      opportunity_type: 'technology_upgrade',
      potential_value: 50000000,
      risk_assessment: 'high',
      timeframe_months: 18,
      metadata: {
        opportunity_description: 'Upgrade to fiber optic',
        target_market: 'Premium segment',
        competitive_advantage: 'Future-proof technology',
        required_investment: 30000000
      }
    }
  ];

  for (const data of marketOpportunitiesData) {
    await client.query(`
      INSERT INTO market_opportunities (
        estate_id, opportunity_type, potential_value, risk_assessment,
        timeframe_months, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.estate_id, data.opportunity_type, data.potential_value,
      data.risk_assessment, data.timeframe_months, JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${revenueAnalyticsData.length} revenue analytics, ${investmentTrackingData.length} investment tracking, and ${marketOpportunitiesData.length} market opportunities records`);
}
