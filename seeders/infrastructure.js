import {
  generateNigerianCoordinates,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedNetworkInfrastructure(client) {
  console.log('🌐 Seeding network infrastructure...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const infrastructureTypes = ['fiber_hub', 'distribution_point', 'wireless_tower', 'data_center', 'exchange_point'];
  
  for (const estate of estates) {
    const numInfrastructure = randomInt(1, 4); // 1-4 infrastructure per estate
    
    for (let i = 0; i < numInfrastructure; i++) {
      const coords = generateNigerianCoordinates();
      const location = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      const infrastructureType = randomChoice(infrastructureTypes);
      
      const infrastructure = {
        estate_id: estate.id,
        type: infrastructureType,
        name: `${estate.name} ${infrastructureType.replace('_', ' ')} ${i + 1}`,
        status: randomChoice(['operational', 'operational', 'operational', 'maintenance', 'upgrade']), // 75% operational
        installation_date: new Date(Date.now() - randomInt(365, 2555) * 24 * 60 * 60 * 1000), // 1-7 years ago
        capacity_mbps: randomInt(100, 10000),
        coverage_radius_km: randomDecimal(0.5, 5.0, 2),
        location: location,
        last_maintenance: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000)
      };

      await client.query(
        `INSERT INTO network_infrastructure (
           estate_id, type, name, status, installation_date,
           capacity_mbps, coverage_radius_km, location,
           last_maintenance, technical_specs, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          infrastructure.estate_id,
          infrastructure.type,
          infrastructure.name,
          infrastructure.status,
          infrastructure.installation_date,
          infrastructure.capacity_mbps,
          infrastructure.coverage_radius_km,
          infrastructure.location,
          infrastructure.last_maintenance,
          JSON.stringify({
            technology: randomChoice(['GPON', 'EPON', 'WiFi 6', '5G', 'Fiber Optic']),
            vendor: randomChoice(['Huawei', 'Cisco', 'Nokia', 'Ericsson', 'ZTE']),
            model: `${randomChoice(['HG', 'RG', 'ONU', 'OLT'])}-${randomInt(1000, 9999)}`,
            firmware_version: `${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
            power_consumption: randomDecimal(50, 500, 2)
          }),
          JSON.stringify({
            backup_power: Math.random() > 0.2, // 80% have backup power
            security_features: ['CCTV', 'Access Control', 'Fire Suppression'],
            environmental_monitoring: ['Temperature', 'Humidity', 'Power'],
            maintenance_contract: randomChoice(['Premium', 'Standard', 'Basic'])
          })
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
      const peakUtilization = randomDecimal(40, 95, 2);
      const averageUtilization = randomDecimal(20, peakUtilization, 2);
      const bandwidthUtilization = randomDecimal(30, 90, 2);
      
      await client.query(
        `INSERT INTO capacity_metrics (
           infrastructure_id, metric_date, peak_utilization,
           average_utilization, bandwidth_utilization,
           active_connections, total_capacity_mbps,
           performance_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          infra.id,
          metricDate.toISOString().split('T')[0],
          peakUtilization,
          averageUtilization,
          bandwidthUtilization,
          randomInt(10, 200),
          randomInt(100, 10000),
          JSON.stringify({
            latency_ms: randomDecimal(5, 50, 2),
            packet_loss: randomDecimal(0, 2, 3),
            jitter_ms: randomDecimal(1, 10, 2),
            uptime_percentage: randomDecimal(95, 99.9, 2)
          }),
          JSON.stringify({
            peak_hours: {
              morning: randomInt(8, 12),
              afternoon: randomInt(12, 17),
              evening: randomInt(17, 22),
              night: randomInt(22, 8)
            },
            congestion_events: randomInt(0, 5),
            maintenance_windows: randomInt(0, 2)
          })
        ]
      );
    }
  }
}

export async function seedInfrastructureInvestments(client) {
  console.log('💰 Seeding infrastructure investments...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const investmentTypes = ['network_expansion', 'equipment_upgrade', 'capacity_increase', 'technology_migration', 'maintenance'];
  
  for (const estate of estates) {
    const numInvestments = randomInt(1, 3); // 1-3 investments per estate
    
    for (let i = 0; i < numInvestments; i++) {
      const investmentType = randomChoice(investmentTypes);
      const startDate = new Date(Date.now() - randomInt(30, 1095) * 24 * 60 * 60 * 1000);
      const duration = randomInt(30, 180); // 1-6 months
      const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
      
      const investment = {
        estate_id: estate.id,
        type: investmentType,
        name: `${estate.id} ${investmentType.replace('_', ' ')} Project`,
        description: `${investmentType.replace('_', ' ')} project for ${estate.id}`,
        start_date: startDate,
        end_date: endDate,
        budget_amount: randomDecimal(5000000, 50000000, 2),
        actual_amount: randomDecimal(4500000, 55000000, 2),
        status: endDate < new Date() ? 'completed' : randomChoice(['in_progress', 'planning', 'on_hold']),
        roi_percentage: randomDecimal(15, 45, 2)
      };

      await client.query(
        `INSERT INTO infrastructure_investments (
           estate_id, type, name, description, start_date,
           end_date, budget_amount, actual_amount, status,
           roi_percentage, vendor_details, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          investment.estate_id,
          investment.type,
          investment.name,
          investment.description,
          investment.start_date,
          investment.end_date,
          investment.budget_amount,
          investment.actual_amount,
          investment.status,
          investment.roi_percentage,
          JSON.stringify({
            vendor_name: randomChoice(['TechCorp', 'NetSolutions', 'InfraTech', 'ConnectPro', 'DigitalNet']),
            vendor_rating: randomDecimal(3.5, 5.0, 1),
            contract_type: randomChoice(['Fixed Price', 'Time & Material', 'Cost Plus']),
            warranty_period: randomInt(12, 60) // months
          }),
          JSON.stringify({
            risk_level: randomChoice(['low', 'medium', 'high']),
            contingency_budget: randomDecimal(500000, 5000000, 2),
            stakeholder_approval: ['Technical Team', 'Finance', 'Management'],
            success_metrics: ['Uptime Improvement', 'Capacity Increase', 'Cost Reduction']
          })
        ]
      );
    }
  }
}

export async function seedMaintenanceSchedule(client) {
  console.log('🔧 Seeding maintenance schedule...');
  
  const { rows: infrastructure } = await client.query('SELECT id, type FROM network_infrastructure');
  const maintenanceTypes = ['preventive', 'corrective', 'emergency', 'upgrade', 'inspection'];
  
  for (const infra of infrastructure) {
    const numMaintenance = randomInt(2, 6); // 2-6 maintenance records per infrastructure
    
    for (let i = 0; i < numMaintenance; i++) {
      const maintenanceType = randomChoice(maintenanceTypes);
      const scheduledDate = new Date(Date.now() + randomInt(1, 365) * 24 * 60 * 60 * 1000);
      const estimatedDuration = randomInt(2, 48); // 2-48 hours
      const priority = maintenanceType === 'emergency' ? 'high' : 
                      maintenanceType === 'corrective' ? 'medium' : 'low';
      
      await client.query(
        `INSERT INTO maintenance_schedule (
           infrastructure_id, maintenance_type, scheduled_date,
           estimated_duration_hours, priority, status,
           assigned_team, description, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          infra.id,
          maintenanceType,
          scheduledDate.toISOString().split('T')[0],
          estimatedDuration,
          priority,
          randomChoice(['scheduled', 'in_progress', 'completed', 'cancelled']),
          randomChoice(['Team Alpha', 'Team Beta', 'Team Gamma', 'Emergency Team']),
          `${maintenanceType} maintenance for ${infra.type} infrastructure`,
          JSON.stringify({
            required_parts: randomChoice(['None', 'Cables', 'Modules', 'Full Replacement']),
            safety_requirements: ['Safety Gear', 'Work Permit', 'Emergency Contacts'],
            backup_plan: 'Service will be temporarily unavailable during maintenance',
            estimated_cost: randomDecimal(50000, 2000000, 2)
          })
        ]
      );
    }
  }
}
