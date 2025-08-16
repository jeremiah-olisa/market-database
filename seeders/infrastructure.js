import {
  generateNigerianCoordinates,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedNetworkInfrastructure(client) {
  console.log('🌐 Seeding network infrastructure...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const infrastructureTypes = ['fiber', 'tower', 'datacenter', 'distribution_point'];
  
  for (const estate of estates) {
    const numInfrastructure = randomInt(1, 4); // 1-4 infrastructure per estate
    
    for (let i = 0; i < numInfrastructure; i++) {
      const coords = generateNigerianCoordinates();
      const location = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      const infrastructureType = randomChoice(infrastructureTypes);
      
      const infrastructure = {
        estate_id: estate.id,
        infrastructure_type: infrastructureType,
        status: randomChoice(['operational', 'operational', 'operational', 'maintenance', 'degraded']), // 75% operational
        installation_date: new Date(Date.now() - randomInt(365, 2555) * 24 * 60 * 60 * 1000), // 1-7 years ago
        last_maintenance_date: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
        next_maintenance_date: new Date(Date.now() + randomInt(30, 180) * 24 * 60 * 60 * 1000),
        manufacturer: randomChoice(['Huawei', 'Cisco', 'Nokia', 'Ericsson', 'ZTE']),
        model_number: `${randomChoice(['HG', 'RG', 'ONU', 'OLT'])}-${randomInt(1000, 9999)}`,
        serial_number: `SN${randomInt(100000, 999999)}`,
        capacity_specs: JSON.stringify({
          bandwidth_mbps: randomInt(100, 10000),
          coverage_radius_km: randomDecimal(0.5, 5.0, 2),
          max_connections: randomInt(100, 1000)
        }),
        location: location,
        coverage_area: null, // Optional field, set to null for now
        technical_specs: JSON.stringify({
          technology: randomChoice(['GPON', 'EPON', 'WiFi 6', '5G', 'Fiber Optic']),
          firmware_version: `${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
          power_consumption: randomDecimal(50, 500, 2),
          backup_power: Math.random() > 0.2, // 80% have backup power
          security_features: ['CCTV', 'Access Control', 'Fire Suppression'],
          environmental_monitoring: ['Temperature', 'Humidity', 'Power']
        }),
        maintenance_history: JSON.stringify([]),
        metadata: JSON.stringify({
          maintenance_contract: randomChoice(['Premium', 'Standard', 'Basic']),
          risk_level: randomChoice(['low', 'medium', 'high']),
          contingency_plan: 'Service will be temporarily unavailable during maintenance'
        })
      };

      await client.query(
        `INSERT INTO network_infrastructure (
           estate_id, infrastructure_type, status, installation_date,
           last_maintenance_date, next_maintenance_date, manufacturer,
           model_number, serial_number, capacity_specs, location,
           coverage_area, technical_specs, maintenance_history, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          infrastructure.estate_id,
          infrastructure.infrastructure_type,
          infrastructure.status,
          infrastructure.installation_date.toISOString().split('T')[0],
          infrastructure.last_maintenance_date.toISOString().split('T')[0],
          infrastructure.next_maintenance_date.toISOString().split('T')[0],
          infrastructure.manufacturer,
          infrastructure.model_number,
          infrastructure.serial_number,
          infrastructure.capacity_specs,
          infrastructure.location,
          infrastructure.coverage_area,
          infrastructure.technical_specs,
          infrastructure.maintenance_history,
          infrastructure.metadata
        ]
      );
    }
  }
}

export async function seedCapacityMetrics(client) {
  console.log('📊 Seeding capacity metrics...');
  
  const { rows: infrastructure } = await client.query('SELECT id FROM network_infrastructure');
  
  // Generate 6 months of capacity data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  for (let month = 0; month < 6; month++) {
    const metricDate = new Date(startDate);
    metricDate.setMonth(metricDate.getMonth() + month);
    
    for (const infra of infrastructure) {
      const bandwidthUsage = randomDecimal(100, 5000, 2);
      const bandwidthCapacity = randomInt(1000, 10000);
      const latencyMs = randomDecimal(5, 50, 2);
      const packetLossPercent = randomDecimal(0, 2, 3);
      const activeConnections = randomInt(10, 200);
      const cpuUsagePercent = randomDecimal(20, 80, 2);
      const memoryUsagePercent = randomDecimal(30, 85, 2);
      const storageUsagePercent = randomDecimal(40, 90, 2);
      
      await client.query(
        `INSERT INTO capacity_metrics (
           infrastructure_id, metric_timestamp, bandwidth_usage,
           bandwidth_capacity, latency_ms, packet_loss_percent,
           active_connections, cpu_usage_percent, memory_usage_percent,
           storage_usage_percent, performance_metrics, alerts, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          infra.id,
          metricDate.toISOString(),
          bandwidthUsage,
          bandwidthCapacity,
          latencyMs,
          packetLossPercent,
          activeConnections,
          cpuUsagePercent,
          memoryUsagePercent,
          storageUsagePercent,
          JSON.stringify({
            uptime_percentage: randomDecimal(95, 99.9, 2),
            jitter_ms: randomDecimal(1, 10, 2),
            congestion_events: randomInt(0, 5),
            maintenance_windows: randomInt(0, 2)
          }),
          JSON.stringify([]), // Empty alerts array
          JSON.stringify({
            peak_hours: {
              morning: randomInt(8, 12),
              afternoon: randomInt(12, 17),
              evening: randomInt(17, 22),
              night: randomInt(22, 8)
            },
            data_source: 'automated_monitoring',
            collection_method: 'real_time_sampling'
          })
        ]
      );
    }
  }
}

export async function seedInfrastructureInvestments(client) {
  console.log('💰 Seeding infrastructure investments...');
  
  const { rows: infrastructure } = await client.query('SELECT id FROM network_infrastructure');
  const investmentTypes = ['network_expansion', 'equipment_upgrade', 'capacity_increase', 'technology_migration', 'maintenance'];
  
  for (const infra of infrastructure) {
    const numInvestments = randomInt(1, 3); // 1-3 investments per infrastructure
    
    for (let i = 0; i < numInvestments; i++) {
      const investmentType = randomChoice(investmentTypes);
      const investmentDate = new Date(Date.now() - randomInt(30, 1095) * 24 * 60 * 60 * 1000);
      const depreciationPeriod = randomInt(12, 60); // 1-5 years in months
      
      const investment = {
        infrastructure_id: infra.id,
        investment_date: investmentDate,
        investment_type: investmentType,
        amount: randomDecimal(5000000, 50000000, 2),
        currency: 'NGN',
        depreciation_period: depreciationPeriod,
        roi_metrics: JSON.stringify({
          roi_percentage: randomDecimal(15, 45, 2),
          payback_period_months: randomInt(12, 36),
          net_present_value: randomDecimal(1000000, 10000000, 2),
          internal_rate_of_return: randomDecimal(8, 25, 2)
        }),
        vendor_details: JSON.stringify({
          vendor_name: randomChoice(['TechCorp', 'NetSolutions', 'InfraTech', 'ConnectPro', 'DigitalNet']),
          vendor_rating: randomDecimal(3.5, 5.0, 1),
          contract_type: randomChoice(['Fixed Price', 'Time & Material', 'Cost Plus']),
          warranty_period: randomInt(12, 60) // months
        }),
        warranty_info: JSON.stringify({
          warranty_type: randomChoice(['Standard', 'Extended', 'Premium']),
          coverage_details: ['Parts', 'Labor', 'On-site Support'],
          exclusions: ['Natural Disasters', 'Misuse', 'Unauthorized Modifications']
        }),
        documents: JSON.stringify([]), // Empty documents array
        metadata: JSON.stringify({
          risk_level: randomChoice(['low', 'medium', 'high']),
          contingency_budget: randomDecimal(500000, 5000000, 2),
          stakeholder_approval: ['Technical Team', 'Finance', 'Management'],
          success_metrics: ['Uptime Improvement', 'Capacity Increase', 'Cost Reduction']
        })
      };

      await client.query(
        `INSERT INTO infrastructure_investments (
           infrastructure_id, investment_date, investment_type, amount,
           currency, depreciation_period, roi_metrics, vendor_details,
           warranty_info, documents, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          investment.infrastructure_id,
          investment.investment_date.toISOString().split('T')[0],
          investment.investment_type,
          investment.amount,
          investment.currency,
          investment.depreciation_period,
          investment.roi_metrics,
          investment.vendor_details,
          investment.warranty_info,
          investment.documents,
          investment.metadata
        ]
      );
    }
  }
}

export async function seedMaintenanceSchedule(client) {
  console.log('🔧 Seeding maintenance schedule...');
  
  const { rows: infrastructure } = await client.query('SELECT id, infrastructure_type FROM network_infrastructure');
  const maintenanceTypes = ['preventive', 'corrective', 'emergency', 'upgrade', 'inspection'];
  
  for (const infra of infrastructure) {
    const numMaintenance = randomInt(2, 6); // 2-6 maintenance records per infrastructure
    
    for (let i = 0; i < numMaintenance; i++) {
      const maintenanceType = randomChoice(maintenanceTypes);
      const scheduledDate = new Date(Date.now() + randomInt(1, 365) * 24 * 60 * 60 * 1000);
      const estimatedDuration = randomInt(120, 2880); // 2-48 hours in minutes
      const priority = maintenanceType === 'emergency' ? 1 : 
                      maintenanceType === 'corrective' ? 3 : 5;
      
      await client.query(
        `INSERT INTO maintenance_schedule (
           infrastructure_id, scheduled_date, maintenance_type, priority,
           estimated_duration, technician_assigned, status, completion_date,
           maintenance_notes, cost_estimate, currency, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          infra.id,
          scheduledDate.toISOString().split('T')[0],
          maintenanceType,
          priority,
          estimatedDuration,
          randomChoice(['Team Alpha', 'Team Beta', 'Team Gamma', 'Emergency Team']),
          randomChoice(['scheduled', 'in_progress', 'completed', 'cancelled']),
          null, // completion_date - null for scheduled/in_progress
          `${maintenanceType} maintenance for ${infra.infrastructure_type} infrastructure`,
          randomDecimal(50000, 2000000, 2),
          'NGN',
          JSON.stringify({
            required_parts: randomChoice(['None', 'Cables', 'Modules', 'Full Replacement']),
            safety_requirements: ['Safety Gear', 'Work Permit', 'Emergency Contacts'],
            backup_plan: 'Service will be temporarily unavailable during maintenance',
            risk_assessment: randomChoice(['low', 'medium', 'high']),
            contingency_measures: ['Backup Systems', 'Emergency Contacts', 'Service Degradation Plan']
          })
        ]
      );
    }
  }
}
