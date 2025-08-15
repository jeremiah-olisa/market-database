import pool from "../utils/pool.js";

export async function seedInfrastructure(client) {
  console.log("🏗️ Seeding infrastructure data...");
  
  // First, seed network infrastructure
  const networkInfrastructureData = [
    {
      estate_id: 1,
      infrastructure_type: 'fiber_optic',
      coverage_quality: 'excellent',
      capacity_mbps: 1000,
      current_utilization_percentage: 65,
      reliability_score: 98,
      metadata: {
        fiber_type: 'single_mode',
        connection_points: 500,
        backup_systems: ['UPS', 'Generator'],
        maintenance_schedule: 'monthly'
      }
    },
    {
      estate_id: 2,
      infrastructure_type: 'hybrid_fiber_coaxial',
      coverage_quality: 'good',
      capacity_mbps: 500,
      current_utilization_percentage: 75,
      reliability_score: 92,
      metadata: {
        coaxial_type: 'RG-6',
        connection_points: 300,
        backup_systems: ['UPS'],
        maintenance_schedule: 'quarterly'
      }
    },
    {
      estate_id: 3,
      infrastructure_type: 'wireless_5g',
      coverage_quality: 'fair',
      capacity_mbps: 200,
      current_utilization_percentage: 85,
      reliability_score: 88,
      metadata: {
        wireless_standard: '5G',
        tower_height: '30m',
        connection_points: 150,
        backup_systems: ['Battery'],
        maintenance_schedule: 'monthly'
      }
    }
  ];

  for (const data of networkInfrastructureData) {
    await client.query(`
      INSERT INTO network_infrastructure (
        estate_id, infrastructure_type, coverage_quality, capacity_mbps,
        current_utilization_percentage, reliability_score, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.estate_id, data.infrastructure_type, data.coverage_quality,
      data.capacity_mbps, data.current_utilization_percentage,
      data.reliability_score, JSON.stringify(data.metadata)
    ]);
  }

  // Then, seed capacity metrics
  const capacityMetricsData = [
    {
      infrastructure_id: 1,
      current_utilization: 65,
      peak_utilization: 85,
      average_utilization: 60,
      availability_percentage: 99.9,
      performance_metrics: {
        latency_ms: 5,
        packet_loss: 0.01,
        jitter_ms: 2,
        throughput_mbps: 950
      },
      period: '2024-01'
    },
    {
      infrastructure_id: 2,
      current_utilization: 75,
      peak_utilization: 90,
      average_utilization: 70,
      availability_percentage: 99.5,
      performance_metrics: {
        latency_ms: 12,
        packet_loss: 0.05,
        jitter_ms: 5,
        throughput_mbps: 450
      },
      period: '2024-01'
    },
    {
      infrastructure_id: 3,
      current_utilization: 85,
      peak_utilization: 95,
      average_utilization: 80,
      availability_percentage: 98.8,
      performance_metrics: {
        latency_ms: 25,
        packet_loss: 0.1,
        jitter_ms: 8,
        throughput_mbps: 180
      },
      period: '2024-01'
    }
  ];

  for (const data of capacityMetricsData) {
    await client.query(`
      INSERT INTO capacity_metrics (
        infrastructure_id, current_utilization, peak_utilization, 
        average_utilization, availability_percentage, performance_metrics, period
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      data.infrastructure_id, data.current_utilization, data.peak_utilization,
      data.average_utilization, data.availability_percentage,
      JSON.stringify(data.performance_metrics), data.period
    ]);
  }

  console.log(`✅ Seeded ${networkInfrastructureData.length} network infrastructure and ${capacityMetricsData.length} capacity metrics records`);
}
