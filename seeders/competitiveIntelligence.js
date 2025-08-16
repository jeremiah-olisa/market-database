import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedMarketPenetrationMetrics(client) {
  console.log('📊 Seeding market penetration metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const { rows: providers } = await client.query('SELECT id FROM service_providers');
  
  for (const estate of estates) {
    for (const provider of providers) {
      if (Math.random() > 0.3) { // 70% chance of having data for each estate-provider combination
        const period = new Date();
        period.setMonth(period.getMonth() - randomInt(0, 6)); // Random date in last 6 months
        
        const totalAddressableMarket = randomInt(1000, 10000);
        const currentCustomers = randomInt(100, totalAddressableMarket);
        const conversionRate = randomDecimal(5, 25, 2);
        const churnRate = randomDecimal(2, 12, 2);
        const marketShare = randomDecimal(15, 85, 2);
        
        await client.query(
          `INSERT INTO market_penetration_metrics (
             estate_id, provider_id, period, total_addressable_market,
             current_customers, conversion_rate, churn_rate, market_share,
             competitor_comparison, growth_metrics
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (estate_id, provider_id, period) DO NOTHING`,
          [
            estate.id,
            provider.id,
            period.toISOString().split('T')[0],
            totalAddressableMarket,
            currentCustomers,
            conversionRate,
            churnRate,
            marketShare,
            JSON.stringify({
              'competitive_advantages': randomChoice([
                ['Lower Prices', 'Better Service', 'More Features'],
                ['Faster Delivery', '24/7 Support', 'Mobile App'],
                ['No Contracts', 'Money-back Guarantee', 'Free Installation']
              ]),
              'competitive_disadvantages': randomChoice([
                ['Limited Coverage', 'Basic Features', 'Standard Support'],
                ['Higher Prices', 'Long Contracts', 'Limited Hours'],
                ['No Mobile App', 'Slow Response', 'Basic Security']
              ]),
              'market_position': randomChoice(['Leader', 'Challenger', 'Follower', 'Niche'])
            }),
            JSON.stringify({
              'monthly_growth': randomDecimal(2, 15, 2),
              'quarterly_growth': randomDecimal(5, 25, 2),
              'yearly_growth': randomDecimal(15, 60, 2),
              'market_expansion': randomDecimal(10, 40, 2),
              'customer_retention': randomDecimal(80, 98, 2),
              'acquisition_efficiency': randomDecimal(70, 95, 2)
            })
          ]
        );
      }
    }
  }
}

export async function seedCompetitiveServiceComparison(client) {
  console.log('🏆 Seeding competitive service comparison...');
  
  const { rows: ourServices } = await client.query('SELECT id FROM service_offerings LIMIT 50'); // Limit to avoid too many combinations
  const { rows: competitorServices } = await client.query('SELECT id FROM service_offerings LIMIT 50');
  
  for (const ourService of ourServices) {
    for (const competitorService of competitorServices) {
      if (ourService.id !== competitorService.id && Math.random() > 0.7) { // 30% chance and ensure different services
        const comparisonDate = new Date();
        comparisonDate.setDate(comparisonDate.getDate() - randomInt(0, 30)); // Random date in last 30 days
        
        const priceDifference = randomDecimal(-20000, 20000, 2);
        const marketPositioningScore = randomInt(1, 100);
        
        await client.query(
          `INSERT INTO competitive_service_comparison (
             our_service_id, competitor_service_id, comparison_date,
             price_difference, feature_comparison, competitive_advantages,
             competitive_disadvantages, market_positioning_score, customer_preference_data
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (our_service_id, competitor_service_id, comparison_date) DO NOTHING`,
          [
            ourService.id,
            competitorService.id,
            comparisonDate.toISOString().split('T')[0],
            priceDifference,
            JSON.stringify({
              'our_features': randomChoice([
                ['24/7 Support', 'Mobile App', 'Real-time Monitoring'],
                ['Advanced Security', 'Cloud Backup', 'AI Integration'],
                ['Instant Setup', 'No Contract', 'Money-back Guarantee']
              ]),
              'competitor_features': randomChoice([
                ['Basic Support', 'Web Portal', 'Standard Monitoring'],
                ['Standard Security', 'Local Backup', 'Manual Integration'],
                ['Standard Setup', 'Annual Contract', 'Limited Warranty']
              ]),
              'feature_gap': randomChoice(['Advantage', 'Disadvantage', 'Neutral'])
            }),
            randomChoice([
              ['Lower Prices', 'Better Service', 'More Features'],
              ['Faster Delivery', '24/7 Support', 'Mobile App'],
              ['No Contracts', 'Money-back Guarantee', 'Free Installation']
            ]),
            randomChoice([
              ['Limited Coverage', 'Basic Features', 'Standard Support'],
              ['Higher Prices', 'Long Contracts', 'Limited Hours'],
              ['No Mobile App', 'Slow Response', 'Basic Security']
            ]),
            marketPositioningScore,
            JSON.stringify({
              'customer_satisfaction': randomDecimal(3.0, 5.0, 1),
              'brand_recognition': randomDecimal(40, 95, 2),
              'customer_loyalty': randomDecimal(30, 90, 2),
              'preference_factors': randomChoice([
                ['Price', 'Quality', 'Service'],
                ['Convenience', 'Features', 'Support'],
                ['Reliability', 'Speed', 'Security']
              ])
            })
          ]
        );
      }
    }
  }
}

// export async function seedBusinessDensityMetrics(client) {
//   console.log('🏢 Seeding business density metrics...');
//   
//   const { rows: estates } = await client.query('SELECT id FROM estates');
//   
//   for (const estate of estates) {
//     const businessCount = randomInt(10, 100);
//     const businessDensity = randomDecimal(50, 500, 2); // businesses per km²
//     const footTraffic = randomInt(1000, 10000);
//     
//     await client.query(
//       `INSERT INTO business_density_metrics (
//          estate_id, business_count, business_density_per_sqkm,
//          foot_traffic_daily, business_variety_score,
//          economic_activity_level, metadata
//        )
//        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//       [
//         estate.id,
//         businessCount,
//         businessDensity,
//         footTraffic,
//         randomDecimal(3.0, 5.0, 1),
//         randomChoice(['low', 'medium', 'high', 'very_high']),
//         JSON.stringify({
//           'business_categories': {
//             'retail': Math.floor(businessCount * randomDecimal(0.20, 0.40, 2)),
//             'food_beverage': Math.floor(businessCount * randomDecimal(0.15, 0.30, 2)),
//             'services': Math.floor(businessCount * randomDecimal(0.20, 0.35, 2)),
//             'entertainment': Math.floor(businessCount * randomDecimal(0.05, 0.20, 2)),
//             'healthcare': Math.floor(businessCount * randomDecimal(0.05, 0.15, 2)),
//             'education': Math.floor(businessCount * randomDecimal(0.03, 0.12, 2))
//           },
//           'business_hours': {
//             'early_morning': randomInt(5, 15),
//             'morning': randomInt(20, 40),
//             'afternoon': randomInt(30, 60),
//             'evening': randomInt(25, 50),
//             'late_night': randomInt(5, 20)
//           },
//           'economic_indicators': {
//             'average_rent': randomDecimal(500000, 5000000, 2),
//             'employment_rate': randomDecimal(70, 95, 2),
//             'income_level': randomChoice(['low', 'middle', 'high']),
//             'spending_power': randomChoice(['limited', 'moderate', 'high', 'premium'])
//           }
//         })
//       ]
//     );
//   }
// }

export async function seedCrossSellingOpportunities(client) {
  console.log('🔄 Seeding cross-selling opportunities...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceTypes = ['internet', 'smart_home', 'security', 'fintech', 'delivery', 'mailing'];
  
  for (const estate of estates) {
    for (const serviceType of serviceTypes) {
      if (Math.random() > 0.4) { // 60% chance of having cross-selling opportunity
        const potentialCustomerCount = randomInt(100, 2000);
        const readinessScore = randomInt(1, 100);
        const marketFitScore = randomInt(1, 100);
        const competitorPresenceLevel = randomInt(1, 5);
        const estimatedPenetrationRate = randomDecimal(5, 40, 2);
        
        await client.query(
          `INSERT INTO cross_selling_opportunities (
             estate_id, service_type, potential_customer_count,
             readiness_score, market_fit_score, competitor_presence_level,
             estimated_penetration_rate, target_demographic, opportunity_factors,
             barriers_to_entry
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT DO NOTHING`,
          [
            estate.id,
            serviceType,
            potentialCustomerCount,
            readinessScore,
            marketFitScore,
            competitorPresenceLevel,
            estimatedPenetrationRate,
            JSON.stringify({
              'age_groups': {
                '18-25': randomInt(10, 30),
                '26-35': randomInt(25, 45),
                '36-50': randomInt(20, 40),
                '50+': randomInt(15, 35)
              },
              'income_levels': randomChoice(['low', 'medium', 'high', 'premium']),
              'occupation_types': randomChoice(['students', 'professionals', 'business_owners', 'retirees']),
              'lifestyle_preferences': randomChoice(['tech_savvy', 'traditional', 'luxury', 'budget_conscious'])
            }),
            JSON.stringify({
              'market_demand': randomChoice(['high', 'medium', 'low']),
              'growth_potential': randomChoice(['high', 'medium', 'low']),
              'customer_interest': randomChoice(['very_high', 'high', 'medium', 'low']),
              'competitive_advantage': randomChoice(['price', 'quality', 'service', 'innovation']),
              'market_timing': randomChoice(['optimal', 'good', 'challenging', 'poor'])
            }),
            JSON.stringify([
              'Regulatory compliance requirements',
              'Infrastructure limitations',
              'Customer education needs',
              'Competitive pricing pressure',
              'Technology adoption barriers'
            ])
          ]
        );
      }
    }
  }
}

export async function seedMarketReadinessMetrics(client) {
  console.log('🚀 Seeding market readiness metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceTiers = ['basic', 'standard', 'premium', 'enterprise', 'custom'];
  
  for (const estate of estates) {
    for (const serviceTier of serviceTiers) {
      if (Math.random() > 0.3) { // 70% chance of having readiness data
        const assessmentDate = new Date();
        assessmentDate.setDate(assessmentDate.getDate() - randomInt(0, 90)); // Random date in last 3 months
        
        const infrastructureReadiness = randomInt(1, 100);
        const demographicFitScore = randomInt(1, 100);
        const economicViabilityScore = randomInt(1, 100);
        const competitionIntensity = randomInt(1, 5);
        
        await client.query(
          `INSERT INTO market_readiness_metrics (
             estate_id, service_tier, assessment_date, infrastructure_readiness,
             demographic_fit_score, economic_viability_score, competition_intensity,
             market_demand_indicators, barrier_analysis, readiness_factors
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (estate_id, service_tier, assessment_date) DO NOTHING`,
          [
            estate.id,
            serviceTier,
            assessmentDate.toISOString().split('T')[0],
            infrastructureReadiness,
            demographicFitScore,
            economicViabilityScore,
            competitionIntensity,
            JSON.stringify({
              'customer_demand': randomChoice(['very_high', 'high', 'medium', 'low']),
              'market_growth': randomChoice(['accelerating', 'stable', 'declining']),
              'adoption_rate': randomDecimal(10, 80, 2),
              'customer_satisfaction': randomDecimal(3.0, 5.0, 1),
              'market_maturity': randomChoice(['emerging', 'growing', 'mature', 'declining'])
            }),
            JSON.stringify({
              'technical_barriers': randomChoice(['low', 'medium', 'high']),
              'financial_barriers': randomChoice(['low', 'medium', 'high']),
              'regulatory_barriers': randomChoice(['low', 'medium', 'high']),
              'market_barriers': randomChoice(['low', 'medium', 'high']),
              'barrier_mitigation': randomChoice(['feasible', 'challenging', 'difficult'])
            }),
            JSON.stringify([
              'Infrastructure capacity',
              'Customer education',
              'Staff training',
              'Technology investment',
              'Partnership development',
              'Quality assurance',
              'Performance monitoring'
            ])
          ]
        );
      }
    }
  }
}
