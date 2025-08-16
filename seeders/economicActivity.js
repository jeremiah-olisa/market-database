import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedEconomicActivityMetrics(client) {
  console.log('💼 Seeding economic activity metrics...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  for (const estate of estates) {
    const gdpContribution = randomDecimal(100000000, 2000000000, 2);
    const employmentRate = randomDecimal(75, 95, 2);
    const averageIncome = randomDecimal(500000, 8000000, 2);
    
    await client.query(
      `INSERT INTO economic_activity_metrics (
         estate_id, gdp_contribution, employment_rate,
         average_income, currency, economic_growth_rate,
         business_activity_level, investment_climate,
         economic_indicators, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        estate.id,
        gdpContribution,
        employmentRate,
        averageIncome,
        'NGN',
        randomDecimal(-5, 15, 2),
        randomChoice(['low', 'medium', 'high', 'very_high']),
        randomChoice(['favorable', 'moderate', 'challenging', 'unfavorable']),
        JSON.stringify({
          'inflation_rate': randomDecimal(5, 25, 2),
          'interest_rate': randomDecimal(10, 30, 2),
          'exchange_rate': randomDecimal(350, 450, 2),
          'purchasing_power': randomChoice(['low', 'medium', 'high', 'premium'])
        }),
        JSON.stringify({
          'economic_sectors': {
            'technology': randomDecimal(15, 40, 2),
            'finance': randomDecimal(20, 45, 2),
            'real_estate': randomDecimal(10, 35, 2),
            'retail': randomDecimal(15, 40, 2),
            'manufacturing': randomDecimal(5, 25, 2),
            'services': randomDecimal(25, 50, 2)
          },
          'market_trends': {
            'growth_drivers': ['Digital Transformation', 'Urbanization', 'Consumer Spending', 'Infrastructure Development'],
            'growth_barriers': ['Regulatory Constraints', 'Infrastructure Gaps', 'Skill Shortages', 'Market Volatility'],
            'opportunity_areas': ['E-commerce', 'Fintech', 'Smart Cities', 'Green Technology'],
            'risk_factors': ['Economic Downturn', 'Policy Changes', 'Competition', 'Technology Disruption']
          }
        })
      ]
    );
  }
}

export async function seedLifestyleIndicators(client) {
  console.log('🏠 Seeding lifestyle indicators...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  for (const estate of estates) {
    const lifestyleScore = randomDecimal(3.0, 5.0, 1);
    const convenienceIndex = randomDecimal(60, 95, 2);
    const qualityOfLife = randomDecimal(3.5, 5.0, 1);
    
    await client.query(
      `INSERT INTO lifestyle_indicators (
         estate_id, lifestyle_score, convenience_index,
         quality_of_life, amenities_availability,
         social_connectivity, lifestyle_metrics, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        estate.id,
        lifestyleScore,
        convenienceIndex,
        qualityOfLife,
        randomDecimal(70, 95, 2),
        randomDecimal(60, 90, 2),
        JSON.stringify({
          'healthcare_access': randomDecimal(70, 95, 2),
          'education_quality': randomDecimal(65, 90, 2),
          'recreation_facilities': randomDecimal(60, 90, 2),
          'shopping_convenience': randomDecimal(75, 95, 2),
          'transportation_access': randomDecimal(70, 90, 2),
          'safety_security': randomDecimal(75, 95, 2)
        }),
        JSON.stringify({
          'lifestyle_categories': {
            'family_friendly': randomDecimal(60, 95, 2),
            'young_professional': randomDecimal(65, 90, 2),
            'retirement_ready': randomDecimal(55, 85, 2),
            'student_focused': randomDecimal(50, 80, 2),
            'luxury_living': randomDecimal(40, 90, 2)
          },
          'amenities_breakdown': {
            'restaurants_cafes': randomInt(10, 50),
            'shopping_centers': randomInt(3, 15),
            'healthcare_facilities': randomInt(2, 10),
            'educational_institutions': randomInt(2, 8),
            'recreation_centers': randomInt(2, 12),
            'banks_financial': randomInt(2, 8),
            'entertainment_venues': randomInt(1, 6)
          },
          'lifestyle_trends': {
            'digital_adoption': randomDecimal(60, 95, 2),
            'health_consciousness': randomDecimal(50, 90, 2),
            'sustainability_focus': randomDecimal(40, 85, 2),
            'work_life_balance': randomDecimal(55, 90, 2),
            'community_engagement': randomDecimal(45, 85, 2)
          }
        })
      ]
    );
  }
}

export async function seedCustomerSegmentation(client) {
  console.log('👥 Seeding customer segmentation...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const segmentTypes = ['demographic', 'behavioral', 'psychographic', 'geographic', 'value_based'];
  
  for (const estate of estates) {
    for (const segmentType of segmentTypes) {
      const segmentSize = randomInt(100, 2000);
      const averageValue = randomDecimal(50000, 500000, 2);
      const growthRate = randomDecimal(5, 25, 2);
      
      await client.query(
        `INSERT INTO customer_segments (
           estate_id, segment_type, segment_name,
           segment_size, average_customer_value,
           growth_rate, characteristics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          estate.id,
          segmentType,
          `${estate.id} ${segmentType.replace('_', ' ')} segment`,
          segmentSize,
          averageValue,
          growthRate,
          JSON.stringify({
            'age_range': randomChoice(['18-25', '26-35', '36-50', '51-65', '65+', 'All Ages']),
            'income_level': randomChoice(['Low', 'Middle', 'High', 'Premium', 'Mixed']),
            'occupation': randomChoice(['Students', 'Professionals', 'Business Owners', 'Retirees', 'Mixed']),
            'lifestyle': randomChoice(['Tech-savvy', 'Family-oriented', 'Business-focused', 'Health-conscious', 'Mixed'])
          }),
          JSON.stringify({
            'segment_behavior': {
              'service_usage': randomChoice(['High', 'Medium', 'Low', 'Variable']),
              'payment_preference': randomChoice(['Monthly', 'Quarterly', 'Annually', 'Mixed']),
              'support_usage': randomChoice(['Frequent', 'Occasional', 'Rare', 'Never']),
              'upgrade_tendency': randomChoice(['Early Adopter', 'Mainstream', 'Late Majority', 'Laggard'])
            },
            'marketing_preferences': {
              'channels': ['Email', 'SMS', 'Social Media', 'Direct Mail', 'Phone'],
              'content_type': ['Educational', 'Promotional', 'Technical', 'Entertainment'],
              'frequency': randomChoice(['Daily', 'Weekly', 'Monthly', 'Quarterly']),
              'personalization': randomChoice(['High', 'Medium', 'Low', 'None'])
            },
            'lifetime_value': {
              'current_lifetime_value': averageValue * randomInt(12, 60),
              'potential_lifetime_value': averageValue * randomInt(24, 84),
              'retention_probability': randomDecimal(60, 95, 2),
              'cross_sell_potential': randomDecimal(20, 60, 2)
            }
          })
        ]
      );
    }
  }
}

export async function seedMarketTrends(client) {
  console.log('📈 Seeding market trends...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const trendCategories = ['technology', 'consumer_behavior', 'economic', 'regulatory', 'competitive'];
  
  for (const estate of estates) {
    for (const category of trendCategories) {
      const trendImpact = randomChoice(['positive', 'neutral', 'negative']);
      const confidenceLevel = randomDecimal(60, 95, 2);
      const timeHorizon = randomChoice(['short_term', 'medium_term', 'long_term']);
      
      await client.query(
        `INSERT INTO market_trends (
           estate_id, trend_category, trend_name,
           trend_description, impact, confidence_level,
           time_horizon, business_implications, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          estate.id,
          category,
          `${estate.id} ${category.replace('_', ' ')} trend`,
          `Significant ${category.replace('_', ' ')} trend affecting ${estate.id} market dynamics`,
          trendImpact,
          confidenceLevel,
          timeHorizon,
          JSON.stringify({
            'revenue_impact': randomChoice(['Increase', 'Decrease', 'Stable', 'Variable']),
            'customer_impact': randomChoice(['Positive', 'Negative', 'Neutral', 'Mixed']),
            'operational_impact': randomChoice(['Efficiency Gain', 'Cost Increase', 'Process Change', 'Minimal']),
            'strategic_impact': randomChoice(['Opportunity', 'Threat', 'Neutral', 'Requires Monitoring'])
          }),
          JSON.stringify({
            'trend_indicators': {
              'market_adoption': randomDecimal(20, 80, 2),
              'customer_sentiment': randomDecimal(3.0, 5.0, 1),
              'industry_momentum': randomChoice(['Growing', 'Stable', 'Declining', 'Emerging']),
              'regulatory_support': randomChoice(['Supportive', 'Neutral', 'Restrictive', 'Changing'])
            },
            'response_strategies': {
              'immediate_actions': ['Market Research', 'Customer Feedback', 'Competitive Analysis', 'Risk Assessment'],
              'short_term_plans': ['Pilot Testing', 'Staff Training', 'Process Updates', 'Technology Assessment'],
              'long_term_vision': ['Strategic Planning', 'Investment Planning', 'Partnership Development', 'Innovation Focus']
            },
            'success_metrics': {
              'market_share_change': randomDecimal(-10, 20, 2),
              'customer_satisfaction': randomDecimal(3.5, 5.0, 1),
              'revenue_growth': randomDecimal(-5, 25, 2),
              'operational_efficiency': randomDecimal(5, 20, 2)
            }
          })
        ]
      );
    }
  }
}
