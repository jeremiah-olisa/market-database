import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedMarketPenetrationMetrics(client) {
  console.log('📊 Seeding market penetration metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceTypes = ['internet', 'smart_home', 'security', 'fintech', 'delivery'];
  
  for (const estate of estates) {
    for (const serviceType of serviceTypes) {
      if (Math.random() > 0.2) { // 80% chance of offering each service
        const marketShare = randomDecimal(15, 85, 2);
        const penetrationRate = randomDecimal(20, 90, 2);
        const conversionRate = randomDecimal(5, 25, 2);
        const churnRate = randomDecimal(2, 12, 2);
        
        await client.query(
          `INSERT INTO market_penetration_metrics (
             estate_id, service_type, market_share_percentage,
             penetration_rate, conversion_rate, churn_rate,
             customer_acquisition_cost, customer_lifetime_value,
             growth_metrics, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            estate.id,
            serviceType,
            marketShare,
            penetrationRate,
            conversionRate,
            churnRate,
            randomDecimal(5000, 50000, 2),
            randomDecimal(50000, 500000, 2),
            JSON.stringify({
              'monthly_growth': randomDecimal(2, 15, 2),
              'quarterly_growth': randomDecimal(5, 25, 2),
              'yearly_growth': randomDecimal(15, 60, 2),
              'market_expansion': randomDecimal(10, 40, 2)
            }),
            JSON.stringify({
              'target_market_size': randomInt(1000, 10000),
              'addressable_market': randomInt(5000, 50000),
              'competitive_landscape': randomChoice(['Fragmented', 'Concentrated', 'Oligopoly', 'Monopoly']),
              'market_maturity': randomChoice(['Emerging', 'Growing', 'Mature', 'Declining']),
              'entry_barriers': randomChoice(['Low', 'Medium', 'High', 'Very High'])
            })
          ]
        );
      }
    }
  }
}

export async function seedCompetitiveServiceComparison(client) {
  console.log('🏆 Seeding competitive service comparison...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const { rows: competitors } = await client.query('SELECT id, name FROM service_providers');
  const serviceTypes = ['internet', 'smart_home', 'security', 'fintech', 'delivery'];
  
  for (const estate of estates) {
    for (const serviceType of serviceTypes) {
      if (Math.random() > 0.3) { // 70% chance of having competitive data
        const competitor = randomChoice(competitors);
        const ourScore = randomDecimal(3.5, 5.0, 1);
        const competitorScore = randomDecimal(3.0, 4.8, 1);
        
        await client.query(
          `INSERT INTO competitive_service_comparison (
             estate_id, competitor_id, service_type,
             our_score, competitor_score, price_comparison,
             feature_comparison, market_position, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            estate.id,
            competitor.id,
            serviceType,
            ourScore,
            competitorScore,
            JSON.stringify({
              'our_price': randomDecimal(5000, 50000, 2),
              'competitor_price': randomDecimal(4500, 55000, 2),
              'price_difference': randomDecimal(-20, 20, 2),
              'price_competitiveness': ourScore > competitorScore ? 'competitive' : 'premium'
            }),
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
              'feature_advantage': ourScore > competitorScore ? 'superior' : 'comparable'
            }),
            randomChoice(['leading', 'strong', 'competitive', 'developing', 'challenger']),
            JSON.stringify({
              'competitive_analysis_date': new Date().toISOString().split('T')[0],
              'analysis_method': randomChoice(['Customer Survey', 'Market Research', 'Direct Comparison', 'Third-party Review']),
              'strengths': ['Superior Technology', 'Better Customer Service', 'Competitive Pricing', 'Wider Coverage'],
              'weaknesses': ['Limited Brand Recognition', 'Smaller Network', 'Higher Setup Costs', 'Limited Service Range'],
              'opportunities': ['Market Expansion', 'Technology Innovation', 'Partnership Development', 'Service Diversification'],
              'threats': ['New Entrants', 'Price Wars', 'Technology Disruption', 'Regulatory Changes']
            })
          ]
        );
      }
    }
  }
}

export async function seedBusinessDensityMetrics(client) {
  console.log('🏢 Seeding business density metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  for (const estate of estates) {
    const businessCount = randomInt(10, 100);
    const businessDensity = randomDecimal(50, 500, 2); // businesses per km²
    const footTraffic = randomInt(1000, 10000);
    
    await client.query(
      `INSERT INTO business_density_metrics (
         estate_id, business_count, business_density_per_sqkm,
         foot_traffic_daily, business_variety_score,
         economic_activity_level, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        estate.id,
        businessCount,
        businessDensity,
        footTraffic,
        randomDecimal(3.0, 5.0, 1),
        randomChoice(['low', 'medium', 'high', 'very_high']),
        JSON.stringify({
          'business_categories': {
            'retail': Math.floor(businessCount * randomDecimal(0.20, 0.40, 2)),
            'food_beverage': Math.floor(businessCount * randomDecimal(0.15, 0.30, 2)),
            'services': Math.floor(businessCount * randomDecimal(0.20, 0.35, 2)),
            'entertainment': Math.floor(businessCount * randomDecimal(0.05, 0.20, 2)),
            'healthcare': Math.floor(businessCount * randomDecimal(0.05, 0.15, 2)),
            'education': Math.floor(businessCount * randomDecimal(0.03, 0.12, 2))
          },
          'business_hours': {
            'early_morning': randomInt(5, 15),
            'morning': randomInt(20, 40),
            'afternoon': randomInt(30, 60),
            'evening': randomInt(25, 50),
            'late_night': randomInt(5, 20)
          },
          'economic_indicators': {
            'average_rent': randomDecimal(500000, 5000000, 2),
            'employment_rate': randomDecimal(70, 95, 2),
            'income_level': randomChoice(['low', 'middle', 'high']),
            'spending_power': randomChoice(['limited', 'moderate', 'high', 'premium'])
          }
        })
      ]
    );
  }
}

export async function seedCrossSellingOpportunities(client) {
  console.log('🔄 Seeding cross-selling opportunities...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const opportunityTypes = ['service_bundle', 'upgrade_promotion', 'referral_program', 'loyalty_rewards', 'new_service_introduction'];
  
  for (const estate of estates) {
    const numOpportunities = randomInt(3, 8); // 3-8 opportunities per estate
    
    for (let i = 0; i < numOpportunities; i++) {
      const opportunityType = randomChoice(opportunityTypes);
      const potentialRevenue = randomDecimal(1000000, 50000000, 2);
      const conversionProbability = randomDecimal(15, 45, 2);
      
      await client.query(
        `INSERT INTO cross_selling_opportunities (
           estate_id, opportunity_type, name, description,
           potential_revenue, conversion_probability,
           target_customer_segment, implementation_timeline,
           success_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          estate.id,
          opportunityType,
          `${estate.name} ${opportunityType.replace('_', ' ')} Opportunity`,
          `Strategic ${opportunityType.replace('_', ' ')} opportunity to increase customer value and revenue`,
          potentialRevenue,
          conversionProbability,
          randomChoice(['existing_customers', 'new_customers', 'premium_customers', 'all_customers']),
          randomInt(1, 12), // months
          JSON.stringify({
            'revenue_increase': randomDecimal(10, 40, 2),
            'customer_satisfaction': randomDecimal(3.5, 5.0, 1),
            'customer_retention': randomDecimal(5, 20, 2),
            'market_share_growth': randomDecimal(2, 15, 2)
          }),
          JSON.stringify({
            'marketing_channels': ['Email Campaigns', 'SMS Marketing', 'Social Media', 'Direct Sales'],
            'incentives': ['Discounts', 'Free Trials', 'Loyalty Points', 'Premium Features'],
            'targeting_criteria': ['Usage Patterns', 'Spending History', 'Service Preferences', 'Demographics'],
            'success_factors': ['Timing', 'Personalization', 'Value Proposition', 'Ease of Adoption'],
            'risk_factors': ['Customer Resistance', 'Implementation Costs', 'Market Competition', 'Regulatory Changes']
          })
        ]
      );
    }
  }
}

export async function seedMarketReadinessMetrics(client) {
  console.log('🚀 Seeding market readiness metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const readinessFactors = ['infrastructure', 'customer_demand', 'competitive_landscape', 'regulatory_environment', 'economic_conditions'];
  
  for (const estate of estates) {
    for (const factor of readinessFactors) {
      const readinessScore = randomDecimal(50, 95, 2);
      const implementationComplexity = randomChoice(['low', 'medium', 'high']);
      
      await client.query(
        `INSERT INTO market_readiness_metrics (
           estate_id, readiness_factor, readiness_score,
           implementation_complexity, timeline_estimate,
           resource_requirements, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          estate.id,
          factor,
          readinessScore,
          implementationComplexity,
          randomInt(1, 24), // months
          randomChoice(['minimal', 'moderate', 'substantial', 'extensive']),
          JSON.stringify({
            'current_status': readinessScore > 80 ? 'ready' : readinessScore > 60 ? 'preparing' : 'not_ready',
            'key_requirements': randomChoice([
              ['Infrastructure Upgrade', 'Staff Training', 'Customer Education'],
              ['Technology Investment', 'Partnership Development', 'Market Research'],
              ['Regulatory Compliance', 'Quality Assurance', 'Performance Monitoring']
            ]),
            'success_probability': readinessScore > 80 ? 'high' : readinessScore > 60 ? 'medium' : 'low',
            'risk_assessment': {
              'technical_risk': randomChoice(['low', 'medium', 'high']),
              'market_risk': randomChoice(['low', 'medium', 'high']),
              'financial_risk': randomChoice(['low', 'medium', 'high']),
              'operational_risk': randomChoice(['low', 'medium', 'high'])
            }
          })
        ]
      );
    }
  }
}
