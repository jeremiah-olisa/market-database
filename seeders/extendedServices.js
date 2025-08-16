import {
  generateNigerianCoordinates,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedExpandedServiceMetrics(client) {
  console.log('🚀 Seeding expanded service metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceCategories = ['internet', 'fintech', 'delivery', 'money_transfer', 'mailing', 'other'];
  
  for (const estate of estates) {
    for (const serviceCategory of serviceCategories) {
      if (Math.random() > 0.2) { // 80% chance of offering each service
        const period = new Date();
        period.setMonth(period.getMonth() - randomInt(0, 6)); // Random date in last 6 months
        
        await client.query(
          `INSERT INTO expanded_service_metrics (
             estate_id, service_category, period, total_transactions,
             transaction_volume, active_users, service_coverage_percentage,
             adoption_rate, performance_metrics, usage_patterns
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (estate_id, service_category, period) DO NOTHING`,
          [
            estate.id,
            serviceCategory,
            period.toISOString().split('T')[0],
            randomInt(100, 5000),
            randomDecimal(1000000, 50000000, 2),
            randomInt(50, 1000),
            randomDecimal(60, 95, 2),
            randomDecimal(15, 85, 2),
            JSON.stringify({
              response_time: randomDecimal(50, 200, 2),
              uptime_percentage: randomDecimal(95, 99.9, 2),
              error_rate: randomDecimal(0.1, 2.0, 3),
              customer_satisfaction: randomDecimal(3.5, 5.0, 1)
            }),
            JSON.stringify({
              peak_usage_hours: {
                morning: randomInt(8, 15),
                afternoon: randomInt(12, 20),
                evening: randomInt(16, 22),
                night: randomInt(22, 8)
              },
              service_features: randomChoice([
                ['24/7 Support', 'Mobile App', 'Real-time Tracking'],
                ['Instant Notifications', 'Secure Payments', 'User Dashboard'],
                ['API Integration', 'Analytics', 'Customization']
              ]),
              target_demographics: randomChoice([
                ['Young Professionals', 'Families', 'Students'],
                ['Business Owners', 'Retirees', 'Tech Enthusiasts'],
                ['High-Income', 'Middle-Income', 'Students']
              ])
            })
          ]
        );
      }
    }
  }
}

export async function seedDeliveryCoverageZones(client) {
  console.log('📦 Seeding delivery coverage zones...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const serviceLevels = ['standard', 'express', 'premium'];
  
  for (const estate of estates) {
    const numZones = randomInt(1, 3); // 1-3 delivery zones per estate
    
    for (let i = 0; i < numZones; i++) {
      const coords = generateNigerianCoordinates();
      const radius = randomDecimal(1.0, 10.0, 2);
      
      // Create a simple polygon around the center point
      const centerLon = coords.longitude;
      const centerLat = coords.latitude;
      const offset = radius / 111; // Rough conversion from km to degrees
      
      const polygon = `SRID=4326;POLYGON((
        ${centerLon - offset} ${centerLat - offset},
        ${centerLon + offset} ${centerLat - offset},
        ${centerLon + offset} ${centerLat + offset},
        ${centerLon - offset} ${centerLat + offset},
        ${centerLon - offset} ${centerLat - offset}
      ))`;
      
      const zone = {
        estate_id: estate.id,
        zone_name: `${estate.name} Delivery Zone ${i + 1}`,
        coverage_area: polygon,
        service_level: randomChoice(serviceLevels),
        delivery_partners: randomInt(2, 10),
        average_delivery_time: randomInt(15, 120),
        coverage_score: randomInt(70, 100),
        operational_hours: JSON.stringify({
          monday: '8AM-8PM',
          tuesday: '8AM-8PM',
          wednesday: '8AM-8PM',
          thursday: '8AM-8PM',
          friday: '8AM-8PM',
          saturday: '9AM-6PM',
          sunday: '10AM-4PM'
        }),
        delivery_constraints: JSON.stringify([
          'Weather dependent',
          'Traffic conditions',
          'Package size limits',
          'Delivery time windows'
        ])
      };

      await client.query(
        `INSERT INTO delivery_coverage_zones (
           estate_id, zone_name, coverage_area, service_level,
           delivery_partners, average_delivery_time, coverage_score,
           operational_hours, delivery_constraints
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          zone.estate_id,
          zone.zone_name,
          zone.coverage_area,
          zone.service_level,
          zone.delivery_partners,
          zone.average_delivery_time,
          zone.coverage_score,
          zone.operational_hours,
          zone.delivery_constraints
        ]
      );
    }
  }
}

export async function seedFintechServiceMetrics(client) {
  console.log('💳 Seeding fintech service metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const fintechServices = ['mobile_money', 'digital_banking', 'investment_platform', 'insurance_services', 'lending_services'];
  
  for (const estate of estates) {
    for (const service of fintechServices) {
      if (Math.random() > 0.3) { // 70% chance of offering each fintech service
        const period = new Date();
        period.setMonth(period.getMonth() - randomInt(0, 6)); // Random date in last 6 months
        
        await client.query(
          `INSERT INTO fintech_service_metrics (
             estate_id, service_type, period, transaction_count,
             transaction_volume, active_users, user_demographics,
             usage_patterns, risk_metrics
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (estate_id, service_type, period) DO NOTHING`,
          [
            estate.id,
            service,
            period.toISOString().split('T')[0],
            randomInt(100, 5000),
            randomDecimal(1000000, 100000000, 2),
            randomInt(100, 2000),
            JSON.stringify({
              '18-25': randomInt(15, 35),
              '26-35': randomInt(25, 45),
              '36-50': randomInt(20, 40),
              '50+': randomInt(10, 25)
            }),
            JSON.stringify({
              transaction_patterns: {
                'morning': randomInt(10, 25),
                'afternoon': randomInt(20, 35),
                'evening': randomInt(25, 45),
                'night': randomInt(5, 15)
              },
              security_features: ['2FA', 'Biometric', 'Encryption', 'Fraud Detection'],
              regulatory_compliance: ['CBN Guidelines', 'NDIC Coverage', 'AML/KYC', 'Data Protection']
            }),
            JSON.stringify({
              fraud_rate: randomDecimal(0.1, 2.0, 3),
              chargeback_rate: randomDecimal(0.5, 3.0, 3),
              default_rate: randomDecimal(1.0, 8.0, 2),
              compliance_score: randomDecimal(85, 100, 2)
            })
          ]
        );
      }
    }
  }
}

export async function seedMailingSystemMetrics(client) {
  console.log('📮 Seeding mailing system metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  for (const estate of estates) {
    const period = new Date();
    period.setMonth(period.getMonth() - randomInt(0, 6)); // Random date in last 6 months
    
    await client.query(
      `INSERT INTO mailing_system_metrics (
         estate_id, period, total_mailboxes, active_mailboxes,
         total_packages, average_processing_time, service_usage_metrics,
         operational_metrics
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (estate_id, period) DO NOTHING`,
      [
        estate.id,
        period.toISOString().split('T')[0],
        randomInt(50, 200),
        randomInt(30, 150),
        randomInt(100, 1000),
        randomInt(30, 180), // 30 minutes to 3 hours
        JSON.stringify({
          peak_hours: {
            '9AM-11AM': randomInt(20, 40),
            '11AM-2PM': randomInt(15, 30),
            '2PM-5PM': randomInt(25, 45),
            '5PM-7PM': randomInt(10, 25)
          },
          delivery_success_rate: randomDecimal(95, 99.5, 2),
          average_delivery_time: randomInt(1, 48), // hours
          return_rate: randomDecimal(1, 8, 2)
        }),
        JSON.stringify({
          facility_features: ['Secure Storage', 'Climate Control', '24/7 Access', 'Security Cameras'],
          service_options: ['Standard', 'Express', 'Overnight', 'Scheduled'],
          tracking_capabilities: ['Real-time Updates', 'SMS Notifications', 'Email Alerts', 'Mobile App'],
          special_handling: ['Fragile Items', 'Temperature Sensitive', 'High Value', 'Oversized']
        })
      ]
    );
  }
}
