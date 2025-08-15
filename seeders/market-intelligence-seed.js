import pool from "../utils/pool.js";

export async function seedMarketIntelligence(client) {
  console.log("📊 Seeding market intelligence data...");
  
  // First, seed provider coverage data
  const providerCoverageData = [
    {
      provider_id: 1, // TechConnect NG
      estate_id: 1,
      coverage_status: 'active',
      quality_metrics: {
        signal_strength: 95,
        speed_consistency: 98,
        uptime_percentage: 99.9,
        customer_satisfaction: 4.5
      },
      metadata: {
        installation_date: '2020-01-15',
        last_maintenance: '2024-01-10',
        coverage_area_km2: 2.5
      }
    },
    {
      provider_id: 2, // NetSpeed Solutions
      estate_id: 2,
      coverage_status: 'active',
      quality_metrics: {
        signal_strength: 88,
        speed_consistency: 92,
        uptime_percentage: 99.5,
        customer_satisfaction: 4.2
      },
      metadata: {
        installation_date: '2019-06-20',
        last_maintenance: '2024-01-05',
        coverage_area_km2: 1.8
      }
    },
    {
      provider_id: 3, // ConnectPlus
      estate_id: 3,
      coverage_status: 'active',
      quality_metrics: {
        signal_strength: 82,
        speed_consistency: 85,
        uptime_percentage: 98.8,
        customer_satisfaction: 3.8
      },
      metadata: {
        installation_date: '2021-03-10',
        last_maintenance: '2024-01-15',
        coverage_area_km2: 1.2
      }
    }
  ];

  for (const data of providerCoverageData) {
    await client.query(`
      INSERT INTO provider_coverage (
        provider_id, estate_id, coverage_status, quality_metrics, metadata
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      data.provider_id, data.estate_id, data.coverage_status,
      JSON.stringify(data.quality_metrics), JSON.stringify(data.metadata)
    ]);
  }

  // Then, seed market share data
  const marketShareData = [
    {
      estate_id: 1,
      provider_id: 1,
      market_share: 65,
      period: '2024-01',
      customer_count: 325,
      revenue_share: 70,
      metadata: {
        competitive_position: 'market_leader',
        growth_rate: 15,
        churn_rate: 2.5
      }
    },
    {
      estate_id: 2,
      provider_id: 2,
      market_share: 55,
      period: '2024-01',
      customer_count: 165,
      revenue_share: 60,
      metadata: {
        competitive_position: 'strong_contender',
        growth_rate: 12,
        churn_rate: 3.2
      }
    },
    {
      estate_id: 3,
      provider_id: 3,
      market_share: 40,
      period: '2024-01',
      customer_count: 80,
      revenue_share: 45,
      metadata: {
        competitive_position: 'challenger',
        growth_rate: 8,
        churn_rate: 4.1
      }
    }
  ];

  for (const data of marketShareData) {
    await client.query(`
      INSERT INTO market_share_data (
        estate_id, provider_id, market_share, period, customer_count,
        revenue_share, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.estate_id, data.provider_id, data.market_share, data.period,
      data.customer_count, data.revenue_share, JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${providerCoverageData.length} provider coverage and ${marketShareData.length} market share records`);
}
