import {
  generateNigerianCoordinates,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedExpandedServiceMetrics(client) {
  console.log('🚀 Seeding expanded service metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceTypes = ['fintech', 'delivery', 'mailing', 'smart_home', 'security'];
  
  for (const estate of estates) {
    for (const serviceType of serviceTypes) {
      if (Math.random() > 0.2) { // 80% chance of offering each service
        const adoptionRate = randomDecimal(15, 85, 2);
        const monthlyTransactions = randomInt(100, 5000);
        const averageTransactionValue = randomDecimal(1000, 50000, 2);
        
        await client.query(
          `INSERT INTO expanded_service_metrics (
             estate_id, service_type, adoption_rate,
             monthly_transactions, average_transaction_value,
             currency, customer_satisfaction, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            estate.id,
            serviceType,
            adoptionRate,
            monthlyTransactions,
            averageTransactionValue,
            'NGN',
            randomDecimal(3.5, 5.0, 1),
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
  const deliveryTypes = ['food_delivery', 'package_delivery', 'grocery_delivery', 'pharmacy_delivery', 'document_delivery'];
  
  for (const estate of estates) {
    const numZones = randomInt(1, 3); // 1-3 delivery zones per estate
    
    for (let i = 0; i < numZones; i++) {
      const deliveryType = randomChoice(deliveryTypes);
      const coords = generateNigerianCoordinates();
      const location = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      
      const zone = {
        estate_id: estate.id,
        delivery_type: deliveryType,
        zone_name: `${estate.name} ${deliveryType.replace('_', ' ')} Zone ${i + 1}`,
        coverage_radius_km: randomDecimal(1.0, 10.0, 2),
        delivery_time_minutes: randomInt(15, 120),
        service_level: randomChoice(['standard', 'express', 'premium']),
        location: location,
        operational_hours: randomChoice(['8AM-8PM', '6AM-10PM', '24/7', '9AM-6PM'])
      };

      await client.query(
        `INSERT INTO delivery_coverage_zones (
           estate_id, delivery_type, zone_name, coverage_radius_km,
           delivery_time_minutes, service_level, location,
           operational_hours, delivery_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          zone.estate_id,
          zone.delivery_type,
          zone.zone_name,
          zone.coverage_radius_km,
          zone.delivery_time_minutes,
          zone.service_level,
          zone.location,
          zone.operational_hours,
          JSON.stringify({
            daily_orders: randomInt(50, 500),
            average_order_value: randomDecimal(2000, 25000, 2),
            delivery_success_rate: randomDecimal(95, 99.5, 2),
            customer_rating: randomDecimal(4.0, 5.0, 1)
          }),
          JSON.stringify({
            delivery_partners: randomChoice(['In-house', 'Third-party', 'Hybrid']),
            vehicle_types: randomChoice(['Motorcycles', 'Cars', 'Bicycles', 'Mixed']),
            payment_methods: ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'],
            special_services: ['Scheduled Delivery', 'Gift Wrapping', 'Temperature Control', 'Signature Required']
          })
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
        const monthlyUsers = randomInt(100, 2000);
        const monthlyVolume = randomDecimal(1000000, 100000000, 2);
        const averageTransactionSize = randomDecimal(5000, 100000, 2);
        
        await client.query(
          `INSERT INTO fintech_service_metrics (
             estate_id, service_type, monthly_active_users,
             monthly_transaction_volume, average_transaction_size,
             currency, user_growth_rate, risk_metrics, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            estate.id,
            service,
            monthlyUsers,
            monthlyVolume,
            averageTransactionSize,
            'NGN',
            randomDecimal(5, 25, 2), // 5-25% monthly growth
            JSON.stringify({
              fraud_rate: randomDecimal(0.1, 2.0, 3),
              chargeback_rate: randomDecimal(0.5, 3.0, 3),
              default_rate: randomDecimal(1.0, 8.0, 2),
              compliance_score: randomDecimal(85, 100, 2)
            }),
            JSON.stringify({
              user_demographics: {
                '18-25': randomInt(15, 35),
                '26-35': randomInt(25, 45),
                '36-50': randomInt(20, 40),
                '50+': randomInt(10, 25)
              },
              transaction_patterns: {
                'morning': randomInt(10, 25),
                'afternoon': randomInt(20, 35),
                'evening': randomInt(25, 45),
                'night': randomInt(5, 15)
              },
              security_features: ['2FA', 'Biometric', 'Encryption', 'Fraud Detection'],
              regulatory_compliance: ['CBN Guidelines', 'NDIC Coverage', 'AML/KYC', 'Data Protection']
            })
          ]
        );
      }
    }
  }
}

export async function seedMailingSystemMetrics(client) {
  console.log('📮 Seeding mailing system metrics...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const mailingServices = ['package_delivery', 'document_services', 'parcel_tracking', 'mailbox_rental', 'courier_services'];
  
  for (const estate of estates) {
    const numServices = randomInt(1, 4); // 1-4 mailing services per estate
    
    for (let i = 0; i < numServices; i++) {
      const service = randomChoice(mailingServices);
      const dailyVolume = randomInt(20, 200);
      const averageProcessingTime = randomInt(1, 24); // hours
      
      const mailingService = {
        estate_id: estate.id,
        service_type: service,
        service_name: `${estate.name} ${service.replace('_', ' ')} Service`,
        daily_volume: dailyVolume,
        average_processing_time_hours: averageProcessingTime,
        service_quality: randomChoice(['excellent', 'good', 'fair', 'poor']),
        customer_satisfaction: randomDecimal(3.5, 5.0, 1)
      };

      await client.query(
        `INSERT INTO mailing_system_metrics (
           estate_id, service_type, service_name, daily_volume,
           average_processing_time_hours, service_quality,
           customer_satisfaction, operational_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          mailingService.estate_id,
          mailingService.service_type,
          mailingService.service_name,
          mailingService.daily_volume,
          mailingService.average_processing_time_hours,
          mailingService.service_quality,
          mailingService.customer_satisfaction,
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
}
