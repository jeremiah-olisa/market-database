import {
  generateEmail,
  generatePhoneNumber,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedCustomerProfiles(client) {
  console.log('👥 Seeding customer profiles...');
  
  const { rows: estateUnits } = await client.query('SELECT id FROM estate_units WHERE status = $1', ['occupied']);
  
  for (const unit of estateUnits) {
    const customerType = randomChoice(['residential', 'business', 'premium', 'standard']);
    const householdSize = randomInt(1, 8);
    const incomeBracket = randomChoice(['low', 'low', 'middle', 'middle', 'high']);
    const occupationCategory = randomChoice([
      'Government Employee', 'Private Sector', 'Business Owner', 'Professional',
      'Student', 'Retired', 'Freelancer', 'Entrepreneur'
    ]);
    const ageBracket = randomChoice(['18-25', '26-35', '36-45', '46-55', '55+']);
    
    const lifestyleTags = [];
    if (Math.random() > 0.5) lifestyleTags.push('tech-savvy');
    if (Math.random() > 0.6) lifestyleTags.push('family-oriented');
    if (Math.random() > 0.7) lifestyleTags.push('business-focused');
    if (Math.random() > 0.8) lifestyleTags.push('health-conscious');
    
    await client.query(
      `INSERT INTO customer_profiles (
         estate_unit_id, customer_type, status, registration_date,
         household_size, income_bracket, occupation_category,
         age_bracket, lifestyle_tags, preferences,
         contact_email, contact_phone, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        unit.id,
        customerType,
        randomChoice(['active', 'active', 'active', 'suspended']), // 75% active
        new Date(Date.now() - randomInt(30, 1095) * 24 * 60 * 60 * 1000), // 1 month to 3 years ago
        householdSize,
        incomeBracket,
        occupationCategory,
        ageBracket,
        lifestyleTags,
        JSON.stringify({
          preferred_contact_method: randomChoice(['email', 'phone', 'sms']),
          notification_preferences: ['service_updates', 'promotions', 'maintenance_alerts'],
          language_preference: randomChoice(['English', 'Hausa', 'Yoruba', 'Igbo']),
          payment_preference: randomChoice(['monthly', 'quarterly', 'annually'])
        }),
        generateEmail(`customer_${unit.id}`),
        generatePhoneNumber(),
        JSON.stringify({
          source: randomChoice(['referral', 'online_search', 'advertisement', 'walk_in']),
          sales_agent: `Agent_${randomInt(1, 10)}`,
          notes: 'Customer profile created during initial setup'
        })
      ]
    );
  }
}

export async function seedUsagePatterns(client) {
  console.log('📊 Seeding usage patterns...');
  
  const { rows: customers } = await client.query('SELECT id FROM customer_profiles');
  const serviceTypes = ['internet', 'smart_home', 'security', 'entertainment'];
  
  // Generate 3 months of usage data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  
  for (let month = 0; month < 3; month++) {
    const usageDate = new Date(startDate);
    usageDate.setMonth(usageDate.getMonth() + month);
    
    for (const customer of customers) {
      for (const serviceType of serviceTypes) {
        if (Math.random() > 0.3) { // 70% chance of using each service
          const dataConsumed = randomDecimal(1, 100, 2); // GB
          const peakUsageTime = `${randomInt(6, 23)}:${randomInt(0, 59).toString().padStart(2, '0')}`;
          const deviceType = randomChoice(['mobile', 'laptop', 'desktop', 'tablet', 'smart_tv']);
          const connectionQuality = randomInt(6, 10); // 6-10 scale
          const usageDuration = randomInt(30, 480); // 30 minutes to 8 hours
          
          await client.query(
            `INSERT INTO usage_patterns (
               customer_id, service_type, usage_date, data_consumed,
               peak_usage_time, device_type, connection_quality,
               usage_duration, usage_metrics, metadata
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              customer.id,
              serviceType,
              usageDate.toISOString().split('T')[0],
              dataConsumed,
              peakUsageTime,
              deviceType,
              connectionQuality,
              usageDuration,
              JSON.stringify({
                peak_hours: {
                  morning: randomInt(10, 30),
                  afternoon: randomInt(20, 50),
                  evening: randomInt(30, 80),
                  night: randomInt(5, 20)
                },
                bandwidth_utilization: randomDecimal(20, 95, 2),
                session_count: randomInt(1, 10)
              }),
              JSON.stringify({
                location: 'home',
                network_type: randomChoice(['wifi', 'ethernet', 'mobile']),
                device_count: randomInt(1, 5)
              })
            ]
          );
        }
      }
    }
  }
}

export async function seedCustomerFeedback(client) {
  console.log('💬 Seeding customer feedback...');
  
  const { rows: customers } = await client.query('SELECT id FROM customer_profiles');
  const serviceTypes = ['internet', 'smart_home', 'security', 'entertainment'];
  const categories = ['service_quality', 'billing', 'technical_support', 'installation', 'maintenance'];
  
  for (const customer of customers) {
    const numFeedbacks = randomInt(0, 3); // 0-3 feedbacks per customer
    
    for (let i = 0; i < numFeedbacks; i++) {
      const feedbackDate = new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000);
      const satisfactionLevel = randomChoice(['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied']);
      const priority = satisfactionLevel.includes('dissatisfied') ? randomInt(3, 5) : randomInt(1, 3);
      
      await client.query(
        `INSERT INTO customer_feedback (
           customer_id, service_type, feedback_date, satisfaction_level,
           feedback_text, category, priority, resolution_status,
           resolved_date, resolution_notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          customer.id,
          randomChoice(serviceTypes),
          feedbackDate.toISOString().split('T')[0],
          satisfactionLevel,
          randomChoice([
            'Service is working well, very satisfied with the quality',
            'Good service but could be faster during peak hours',
            'Experienced some issues but support team was helpful',
            'Service quality has improved significantly',
            'Facing connectivity issues, need immediate assistance',
            'Billing system is confusing, needs simplification',
            'Installation was smooth and professional',
            'Technical support response time could be better'
          ]),
          randomChoice(categories),
          priority,
          priority <= 2 ? 'resolved' : randomChoice(['pending', 'in_progress', 'resolved']),
          priority <= 2 ? new Date(feedbackDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000) : null,
          priority <= 2 ? randomChoice([
            'Issue resolved by technical team',
            'Customer concern addressed satisfactorily',
            'Service restored and customer notified',
            'Compensation provided for inconvenience'
          ]) : null
        ]
      );
    }
  }
}

export async function seedCrossServiceAdoption(client) {
  console.log('🔄 Seeding cross-service adoption...');
  
  const { rows: customers } = await client.query('SELECT id FROM customer_profiles');
  const { rows: services } = await client.query('SELECT id, name FROM service_offerings');
  
  for (const customer of customers) {
    // Each customer adopts 1-3 additional services
    const numServices = randomInt(1, 3);
    const adoptedServices = services
      .sort(() => Math.random() - 0.5)
      .slice(0, numServices);
    
    for (const service of adoptedServices) {
      const adoptionDate = new Date(Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000);
      const subscriptionTier = randomChoice(['basic', 'standard', 'premium', 'enterprise']);
      const monthlyCost = randomDecimal(5000, 100000, 2);
      
      await client.query(
        `INSERT INTO cross_service_adoption (
           customer_id, service_id, adoption_date, status,
           subscription_tier, monthly_cost, currency,
           usage_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          customer.id,
          service.id,
          adoptionDate.toISOString().split('T')[0],
          randomChoice(['active', 'active', 'pending', 'cancelled']), // 50% active
          subscriptionTier,
          monthlyCost,
          'NGN',
          JSON.stringify({
            monthly_usage: randomDecimal(50, 500, 2),
            feature_utilization: randomDecimal(30, 90, 2),
            satisfaction_score: randomDecimal(3.5, 5.0, 1)
          }),
          JSON.stringify({
            adoption_source: randomChoice(['recommendation', 'promotion', 'self_discovery']),
            sales_agent: `Agent_${randomInt(1, 10)}`,
            contract_duration: randomInt(12, 36), // months
            auto_renewal: Math.random() > 0.3 // 70% auto-renewal
          })
        ]
      );
    }
  }
}
