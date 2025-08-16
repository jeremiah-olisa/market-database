import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedEconomicActivityMetrics(client) {
  console.log('💼 Seeding economic activity metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  for (const estate of estates) {
    const economicActivityScore = randomInt(1, 100);
    const businessGrowthRate = randomDecimal(-5, 15, 2);
    
    await client.query(
      `UPDATE estates 
       SET economic_activity_score = $1,
           business_growth_rate = $2,
           economic_indicators = $3
       WHERE id = $4`,
      [
        economicActivityScore,
        businessGrowthRate,
        JSON.stringify({
          'gdp_contribution': randomDecimal(100000000, 2000000000, 2),
          'employment_rate': randomDecimal(75, 95, 2),
          'average_income': randomDecimal(500000, 8000000, 2),
          'inflation_rate': randomDecimal(5, 25, 2),
          'interest_rate': randomDecimal(10, 30, 2),
          'exchange_rate': randomDecimal(350, 450, 2),
          'purchasing_power': randomChoice(['low', 'medium', 'high', 'premium'])
        }),
        estate.id
      ]
    );
  }
  
  console.log(`✅ Updated economic activity metrics for ${estates.length} estates`);
}

export async function seedLifestyleIndicators(client) {
  console.log('🏠 Seeding lifestyle indicators...');
  
  // Since there's no dedicated lifestyle_indicators table, we'll add this data
  // to the estates table's economic_indicators column
  const { rows: estates } = await client.query('SELECT id, economic_indicators FROM estates');
  
  for (const estate of estates) {
    const existingIndicators = estate.economic_indicators || {};
    const lifestyleData = {
      ...existingIndicators,
      'lifestyle_score': randomDecimal(3.0, 5.0, 1),
      'convenience_index': randomDecimal(60, 95, 2),
      'quality_of_life': randomDecimal(3.5, 5.0, 1),
      'amenities_availability': randomDecimal(70, 95, 2),
      'social_connectivity': randomDecimal(60, 90, 2),
      'healthcare_access': randomDecimal(70, 95, 2),
      'education_quality': randomDecimal(65, 90, 2),
      'recreation_facilities': randomDecimal(60, 90, 2),
      'shopping_convenience': randomDecimal(75, 95, 2),
      'transportation_access': randomDecimal(70, 90, 2),
      'safety_security': randomDecimal(75, 95, 2)
    };
    
    await client.query(
      `UPDATE estates 
       SET economic_indicators = $1
       WHERE id = $2`,
      [JSON.stringify(lifestyleData), estate.id]
    );
  }
  
  console.log(`✅ Updated lifestyle indicators for ${estates.length} estates`);
}

export async function seedCustomerSegmentation(client) {
  console.log('👥 Seeding customer segmentation...');
  
  // Add customer segmentation data to the estates table's economic_indicators
  const { rows: estates } = await client.query('SELECT id, economic_indicators FROM estates');
  
  for (const estate of estates) {
    const existingIndicators = estate.economic_indicators || {};
    const segmentationData = {
      ...existingIndicators,
      'customer_segments': {
        'family_friendly': randomDecimal(60, 95, 2),
        'young_professional': randomDecimal(65, 90, 2),
        'retirement_ready': randomDecimal(55, 85, 2),
        'student_focused': randomDecimal(50, 80, 2),
        'luxury_living': randomDecimal(40, 90, 2)
      },
      'demographic_distribution': {
        '18-25': randomInt(10, 25),
        '26-35': randomInt(20, 35),
        '36-50': randomInt(25, 40),
        '51-65': randomInt(15, 30),
        '65+': randomInt(5, 20)
      },
      'income_distribution': {
        'low_income': randomInt(20, 40),
        'middle_income': randomInt(40, 60),
        'high_income': randomInt(15, 35),
        'premium_income': randomInt(5, 20)
      }
    };
    
    await client.query(
      `UPDATE estates 
       SET economic_indicators = $1
       WHERE id = $2`,
      [JSON.stringify(segmentationData), estate.id]
    );
  }
  
  console.log(`✅ Updated customer segmentation for ${estates.length} estates`);
}

export async function seedMarketTrends(client) {
  console.log('📈 Seeding market trends...');
  
  // Add market trends data to the estates table's economic_indicators
  const { rows: estates } = await client.query('SELECT id, economic_indicators FROM estates');
  
  for (const estate of estates) {
    const existingIndicators = estate.economic_indicators || {};
    const trendsData = {
      ...existingIndicators,
      'market_trends': {
        'growth_drivers': ['Digital Transformation', 'Urbanization', 'Consumer Spending', 'Infrastructure Development'],
        'growth_barriers': ['Regulatory Constraints', 'Infrastructure Gaps', 'Skill Shortages', 'Market Volatility'],
        'opportunity_areas': ['E-commerce', 'Fintech', 'Smart Cities', 'Green Technology'],
        'risk_factors': ['Economic Downturn', 'Policy Changes', 'Competition', 'Technology Disruption']
      },
      'technology_adoption': {
        'smart_home_penetration': randomDecimal(20, 80, 2),
        'digital_payment_usage': randomDecimal(60, 95, 2),
        'mobile_app_adoption': randomDecimal(70, 95, 2),
        'cloud_service_usage': randomDecimal(40, 85, 2)
      },
      'market_maturity': randomChoice(['emerging', 'growing', 'mature', 'declining']),
      'innovation_index': randomDecimal(30, 90, 2),
      'sustainability_score': randomDecimal(40, 95, 2)
    };
    
    await client.query(
      `UPDATE estates 
       SET economic_indicators = $1
       WHERE id = $2`,
      [JSON.stringify(trendsData), estate.id]
    );
  }
  
  console.log(`✅ Updated market trends for ${estates.length} estates`);
}
