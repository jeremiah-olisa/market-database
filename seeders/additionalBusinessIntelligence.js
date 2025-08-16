import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedDemographics(client) {
  console.log('👥 Seeding demographics...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  
  for (const estate of estates) {
    const totalPopulation = randomInt(500, 5000);
    const avgHouseholdSize = randomDecimal(3.0, 6.0, 2);
    const avgHouseholdIncome = randomDecimal(500000, 5000000, 2);
    
    await client.query(
      `INSERT INTO demographics (
         estate_id, total_population, avg_household_size,
         avg_household_income, age_distribution, income_distribution,
         occupation_distribution, education_levels, lifestyle_indicators,
         updated_date, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (estate_id) DO NOTHING`,
      [
        estate.id,
        totalPopulation,
        avgHouseholdSize,
        avgHouseholdIncome,
        JSON.stringify({
          '0-17': Math.floor(totalPopulation * randomDecimal(0.15, 0.35, 2)),
          '18-25': Math.floor(totalPopulation * randomDecimal(0.10, 0.25, 2)),
          '26-35': Math.floor(totalPopulation * randomDecimal(0.15, 0.30, 2)),
          '36-50': Math.floor(totalPopulation * randomDecimal(0.15, 0.30, 2)),
          '51-65': Math.floor(totalPopulation * randomDecimal(0.08, 0.20, 2)),
          '65+': Math.floor(totalPopulation * randomDecimal(0.05, 0.15, 2))
        }),
        JSON.stringify({
          'low': Math.floor(totalPopulation * randomDecimal(0.20, 0.40, 2)),
          'middle': Math.floor(totalPopulation * randomDecimal(0.40, 0.60, 2)),
          'high': Math.floor(totalPopulation * randomDecimal(0.15, 0.35, 2))
        }),
        JSON.stringify({
          'Government Employee': Math.floor(totalPopulation * randomDecimal(0.15, 0.30, 2)),
          'Private Sector': Math.floor(totalPopulation * randomDecimal(0.20, 0.40, 2)),
          'Business Owner': Math.floor(totalPopulation * randomDecimal(0.05, 0.15, 2)),
          'Professional': Math.floor(totalPopulation * randomDecimal(0.10, 0.25, 2)),
          'Student': Math.floor(totalPopulation * randomDecimal(0.10, 0.25, 2)),
          'Retired': Math.floor(totalPopulation * randomDecimal(0.05, 0.15, 2)),
          'Unemployed': Math.floor(totalPopulation * randomDecimal(0.02, 0.10, 2))
        }),
        JSON.stringify({
          'Primary': Math.floor(totalPopulation * randomDecimal(0.05, 0.15, 2)),
          'Secondary': Math.floor(totalPopulation * randomDecimal(0.20, 0.35, 2)),
          'Tertiary': Math.floor(totalPopulation * randomDecimal(0.40, 0.60, 2)),
          'Postgraduate': Math.floor(totalPopulation * randomDecimal(0.10, 0.25, 2)),
          'Vocational': Math.floor(totalPopulation * randomDecimal(0.05, 0.15, 2))
        }),
        JSON.stringify({
          'ethnicity': randomChoice(['Mixed', 'Hausa', 'Yoruba', 'Igbo', 'Other']),
          'religion': randomChoice(['Christianity', 'Islam', 'Traditional', 'Other']),
          'language_preference': randomChoice(['English', 'Hausa', 'Yoruba', 'Igbo', 'Mixed']),
          'migration_pattern': randomChoice(['Local', 'Regional', 'National', 'International'])
        }),
        new Date().toISOString().split('T')[0],
        JSON.stringify({
          'data_source': 'Census and Surveys',
          'last_updated_by': randomChoice(['Data Team', 'Analytics Team', 'External Vendor']),
          'quality_score': randomDecimal(85, 100, 2),
          'completeness': randomDecimal(90, 100, 2)
        })
      ]
    );
  }
}

export async function seedRevenueAnalytics(client) {
  console.log('💰 Seeding revenue analytics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const revenueTypes = ['internet_services', 'smart_home', 'security_services', 'fintech_services', 'delivery_services'];
  
  // Generate 12 months of revenue data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  for (let month = 0; month < 12; month++) {
    const revenueDate = new Date(startDate);
    revenueDate.setMonth(revenueDate.getMonth() + month);
    
    for (const estate of estates) {
      for (const revenueType of revenueTypes) {
        if (Math.random() > 0.3) { // 70% chance of having each revenue type
          const amount = randomDecimal(1000000, 20000000, 2);
          const customerCount = randomInt(50, 500);
          const growthRate = randomDecimal(-5, 15, 2);
          
          await client.query(
            `INSERT INTO revenue_analytics (
               estate_id, period, revenue_type, amount, currency,
               customer_count, growth_rate, performance_metrics, metadata
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (estate_id, period, revenue_type) DO NOTHING`,
            [
              estate.id,
              revenueDate.toISOString().split('T')[0],
              revenueType,
              amount,
              'NGN',
              customerCount,
              growthRate,
              JSON.stringify({
                'average_revenue_per_customer': Math.floor(amount / customerCount),
                'customer_lifetime_value': Math.floor((amount / customerCount) * randomInt(12, 60)),
                'acquisition_cost': Math.floor((amount / customerCount) * randomDecimal(0.1, 0.3, 2)),
                'retention_rate': randomDecimal(85, 98, 2)
              }),
              JSON.stringify({
                'seasonal_factors': randomChoice(['Peak Season', 'Off Season', 'Holiday Period', 'Regular Period']),
                'market_conditions': randomChoice(['Favorable', 'Stable', 'Challenging', 'Recession']),
                'competitive_pressure': randomChoice(['Low', 'Medium', 'High', 'Very High']),
                'regulatory_environment': randomChoice(['Supportive', 'Neutral', 'Restrictive', 'Changing'])
              })
            ]
          );
        }
      }
    }
  }
}

export async function seedMarketOpportunities(client) {
  console.log('🎯 Seeding market opportunities...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const opportunityTypes = ['service_expansion', 'market_penetration', 'technology_upgrade', 'partnership_development', 'geographic_expansion'];
  
  for (const estate of estates) {
    const numOpportunities = randomInt(2, 5); // 2-5 opportunities per estate
    
    for (let i = 0; i < numOpportunities; i++) {
      const opportunityType = randomChoice(opportunityTypes);
      const potentialRevenue = randomDecimal(10000000, 500000000, 2);
      const marketSize = randomInt(1000000, 10000000);
      const implementationCost = randomDecimal(5000000, 100000000, 2);
      const roiEstimate = randomDecimal(25, 75, 2);
      const priorityScore = randomInt(60, 100);
      
      await client.query(
        `INSERT INTO market_opportunities (
           estate_id, opportunity_type, potential_revenue, currency,
           probability, competition_level, market_size, implementation_cost,
           roi_estimate, priority_score, status, analysis_data, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT DO NOTHING`,
        [
          estate.id,
          opportunityType,
          potentialRevenue,
          'NGN',
          randomDecimal(60, 95, 2), // probability 60-95%
          randomInt(1, 5), // competition level 1-5
          marketSize,
          implementationCost,
          roiEstimate,
          priorityScore,
          randomChoice(['identified', 'analyzing', 'approved', 'in_progress', 'completed']),
          JSON.stringify({
            'market_demand': randomDecimal(70, 95, 2),
            'competitive_advantage': randomDecimal(60, 90, 2),
            'resource_availability': randomDecimal(50, 85, 2),
            'regulatory_compliance': randomDecimal(80, 100, 2),
            'technical_feasibility': randomDecimal(75, 95, 2)
          }),
          JSON.stringify({
            'stakeholders': ['Business Development', 'Technical Team', 'Finance Team', 'Operations'],
            'success_criteria': ['Revenue Growth', 'Market Share Increase', 'Customer Satisfaction', 'ROI Achievement'],
            'risk_mitigation': ['Market Research', 'Pilot Testing', 'Phased Implementation', 'Expert Consultation'],
            'timeline': {
              'planning': randomInt(1, 3),
              'development': randomInt(3, 8),
              'testing': randomInt(1, 3),
              'launch': randomInt(1, 2)
            }
          })
        ]
      );
    }
  }
}

export async function seedServiceQualityMetrics(client) {
  console.log('⭐ Seeding service quality metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const serviceTypes = ['internet', 'smart_home', 'security', 'fintech', 'delivery'];
  
  for (const estate of estates) {
    for (const serviceType of serviceTypes) {
      if (Math.random() > 0.2) { // 80% chance of offering each service
        const period = new Date();
        period.setMonth(period.getMonth() - randomInt(0, 6)); // Random date in last 6 months
        
        const uptimePercentage = randomDecimal(95, 99.9, 2);
        const avgResponseTime = randomInt(5, 120); // milliseconds
        const customerSatisfactionScore = randomDecimal(3.5, 5.0, 2);
        const incidentCount = randomInt(0, 10);
        const resolutionTimeAvg = randomInt(30, 1440); // minutes (30 min to 24 hours)
        
        await client.query(
          `INSERT INTO service_quality_metrics (
             estate_id, service_type, period, uptime_percentage,
             avg_response_time, customer_satisfaction_score,
             incident_count, resolution_time_avg, quality_metrics, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (estate_id, service_type, period) DO NOTHING`,
          [
            estate.id,
            serviceType,
            period.toISOString().split('T')[0],
            uptimePercentage,
            avgResponseTime,
            customerSatisfactionScore,
            incidentCount,
            resolutionTimeAvg,
            JSON.stringify({
              'reliability': randomDecimal(85, 98, 2),
              'availability': randomDecimal(90, 99.5, 2),
              'performance': randomDecimal(80, 95, 2),
              'security': randomDecimal(90, 99, 2),
              'usability': randomDecimal(75, 95, 2)
            }),
            JSON.stringify({
              'quality_standards': ['ISO 9001', 'Industry Best Practices', 'Internal Standards'],
              'monitoring_tools': ['Real-time Analytics', 'Performance Dashboards', 'Alert Systems'],
              'improvement_initiatives': ['Customer Feedback Analysis', 'Process Optimization', 'Technology Upgrades'],
              'benchmarking': {
                'industry_average': randomDecimal(3.0, 4.5, 2),
                'competitor_analysis': randomDecimal(3.2, 4.8, 2),
                'internal_targets': randomDecimal(4.0, 5.0, 2)
              }
            })
          ]
        );
      }
    }
  }
}
