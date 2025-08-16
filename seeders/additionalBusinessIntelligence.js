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
    const householdCount = Math.floor(totalPopulation / randomInt(3, 6)); // 3-6 people per household
    
    await client.query(
      `INSERT INTO demographics (
         estate_id, total_population, household_count,
         age_distribution, income_distribution,
         occupation_distribution, education_levels,
         family_composition, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        estate.id,
        totalPopulation,
        householdCount,
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
          'Single': Math.floor(householdCount * randomDecimal(0.15, 0.30, 2)),
          'Married': Math.floor(householdCount * randomDecimal(0.40, 0.60, 2)),
          'Divorced': Math.floor(householdCount * randomDecimal(0.05, 0.15, 2)),
          'Widowed': Math.floor(householdCount * randomDecimal(0.02, 0.10, 2)),
          'Living Together': Math.floor(householdCount * randomDecimal(0.05, 0.15, 2))
        }),
        JSON.stringify({
          'ethnicity': randomChoice(['Mixed', 'Hausa', 'Yoruba', 'Igbo', 'Other']),
          'religion': randomChoice(['Christianity', 'Islam', 'Traditional', 'Other']),
          'language_preference': randomChoice(['English', 'Hausa', 'Yoruba', 'Igbo', 'Mixed']),
          'migration_pattern': randomChoice(['Local', 'Regional', 'National', 'International'])
        })
      ]
    );
  }
}

export async function seedRevenueAnalytics(client) {
  console.log('💰 Seeding revenue analytics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  // Generate 12 months of revenue data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  for (let month = 0; month < 12; month++) {
    const revenueDate = new Date(startDate);
    revenueDate.setMonth(revenueDate.getMonth() + month);
    
    for (const estate of estates) {
      const monthlyRevenue = randomDecimal(5000000, 50000000, 2);
      const customerCount = randomInt(100, 1000);
      const churnRate = randomDecimal(2, 8, 2);
      const growthRate = randomDecimal(-5, 15, 2);
      
      await client.query(
        `INSERT INTO revenue_analytics (
           estate_id, period, monthly_revenue, customer_count,
           churn_rate, growth_rate, currency,
           revenue_breakdown, performance_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          estate.id,
          revenueDate.toISOString().split('T')[0],
          monthlyRevenue,
          customerCount,
          churnRate,
          growthRate,
          'NGN',
          JSON.stringify({
            'internet_services': Math.floor(monthlyRevenue * randomDecimal(0.40, 0.70, 2)),
            'smart_home': Math.floor(monthlyRevenue * randomDecimal(0.10, 0.25, 2)),
            'security_services': Math.floor(monthlyRevenue * randomDecimal(0.05, 0.20, 2)),
            'fintech_services': Math.floor(monthlyRevenue * randomDecimal(0.05, 0.15, 2)),
            'delivery_services': Math.floor(monthlyRevenue * randomDecimal(0.02, 0.10, 2)),
            'other_services': Math.floor(monthlyRevenue * randomDecimal(0.02, 0.08, 2))
          }),
          JSON.stringify({
            'average_revenue_per_customer': Math.floor(monthlyRevenue / customerCount),
            'customer_lifetime_value': Math.floor((monthlyRevenue / customerCount) * randomInt(12, 60)),
            'acquisition_cost': Math.floor((monthlyRevenue / customerCount) * randomDecimal(0.1, 0.3, 2)),
            'retention_rate': 100 - churnRate
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

export async function seedMarketOpportunities(client) {
  console.log('🎯 Seeding market opportunities...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const opportunityTypes = ['service_expansion', 'market_penetration', 'technology_upgrade', 'partnership_development', 'geographic_expansion'];
  
  for (const estate of estates) {
    const numOpportunities = randomInt(2, 5); // 2-5 opportunities per estate
    
    for (let i = 0; i < numOpportunities; i++) {
      const opportunityType = randomChoice(opportunityTypes);
      const marketSize = randomDecimal(10000000, 500000000, 2);
      const estimatedROI = randomDecimal(25, 75, 2);
      const implementationTime = randomInt(6, 36); // months
      
      await client.query(
        `INSERT INTO market_opportunities (
           estate_id, opportunity_type, name, description,
           market_size, estimated_roi, implementation_time_months,
           risk_level, priority, status, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          estate.id,
          opportunityType,
          `${estate.name} ${opportunityType.replace('_', ' ')} Opportunity`,
          `Strategic ${opportunityType.replace('_', ' ')} opportunity for ${estate.name} with high growth potential`,
          marketSize,
          estimatedROI,
          implementationTime,
          randomChoice(['low', 'medium', 'high']),
          randomChoice(['low', 'medium', 'high', 'critical']),
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
              'planning': Math.floor(implementationTime * 0.2),
              'development': Math.floor(implementationTime * 0.5),
              'testing': Math.floor(implementationTime * 0.2),
              'launch': Math.floor(implementationTime * 0.1)
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
        const satisfactionScore = randomDecimal(3.5, 5.0, 1);
        const responseTime = randomInt(5, 120); // minutes
        const uptime = randomDecimal(95, 99.9, 2);
        
        await client.query(
          `INSERT INTO service_quality_metrics (
             estate_id, service_type, satisfaction_score,
             response_time_minutes, uptime_percentage,
             incident_count, resolution_time_hours,
             quality_metrics, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            estate.id,
            serviceType,
            satisfactionScore,
            responseTime,
            uptime,
            randomInt(0, 10),
            randomDecimal(1, 24, 2),
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
                'industry_average': randomDecimal(3.0, 4.5, 1),
                'competitor_analysis': randomDecimal(3.2, 4.8, 1),
                'internal_targets': randomDecimal(4.0, 5.0, 1)
              }
            })
          ]
        );
      }
    }
  }
}
