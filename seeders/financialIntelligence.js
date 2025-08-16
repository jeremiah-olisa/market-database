import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedInvestmentPlans(client) {
  console.log('💼 Seeding investment plans...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const planTypes = ['infrastructure_expansion', 'technology_upgrade', 'market_penetration', 'service_diversification', 'capacity_increase'];
  const riskLevels = ['low', 'medium', 'high'];
  
  for (const estate of estates) {
    const numPlans = randomInt(1, 3); // 1-3 investment plans per estate
    
    for (let i = 0; i < numPlans; i++) {
      const planType = randomChoice(planTypes);
      const riskLevel = randomChoice(riskLevels);
      const startDate = new Date(Date.now() + randomInt(30, 730) * 24 * 60 * 60 * 1000); // 1 month to 2 years from now
      const duration = randomInt(6, 36); // 6-36 months
      const endDate = new Date(startDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
      
      const investment = {
        estate_id: estate.id,
        plan_type: planType,
        name: `${estate.name} ${planType.replace('_', ' ')} Plan`,
        description: `Strategic ${planType.replace('_', ' ')} investment for ${estate.name}`,
        start_date: startDate,
        end_date: endDate,
        budget_amount: randomDecimal(10000000, 200000000, 2),
        expected_roi: randomDecimal(20, 60, 2),
        risk_level: riskLevel,
        status: randomChoice(['planning', 'approved', 'in_progress', 'on_hold']),
        priority: randomChoice(['low', 'medium', 'high', 'critical'])
      };

      await client.query(
        `INSERT INTO investment_plans (
           estate_id, plan_type, name, description, start_date,
           end_date, budget_amount, expected_roi, risk_level,
           status, priority, feasibility_analysis, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          investment.estate_id,
          investment.plan_type,
          investment.name,
          investment.description,
          investment.start_date,
          investment.end_date,
          investment.budget_amount,
          investment.expected_roi,
          investment.risk_level,
          investment.status,
          investment.priority,
          JSON.stringify({
            market_demand: randomDecimal(70, 95, 2),
            technical_feasibility: randomDecimal(80, 98, 2),
            financial_viability: randomDecimal(75, 92, 2),
            regulatory_compliance: randomDecimal(85, 100, 2),
            resource_availability: randomDecimal(70, 90, 2)
          }),
          JSON.stringify({
            stakeholders: ['Board of Directors', 'Technical Team', 'Finance Team', 'Operations Team'],
            success_criteria: ['ROI Achievement', 'Timeline Adherence', 'Quality Standards', 'Customer Satisfaction'],
            risk_mitigation: ['Insurance Coverage', 'Contingency Planning', 'Expert Consultation', 'Phased Implementation'],
            market_conditions: ['Growing Demand', 'Competitive Landscape', 'Regulatory Environment', 'Economic Factors']
          })
        ]
      );
    }
  }
}

export async function seedCapitalExpenditure(client) {
  console.log('💸 Seeding capital expenditure...');
  
  const { rows: estates } = await client.query('SELECT id FROM estates');
  const expenditureTypes = ['equipment_purchase', 'infrastructure_development', 'technology_licensing', 'facility_construction', 'software_development'];
  const vendors = ['TechCorp Nigeria', 'InfraTech Solutions', 'DigitalNet Systems', 'ConnectPro Africa', 'SmartCity Technologies'];
  
  for (const estate of estates) {
    const numExpenditures = randomInt(2, 6); // 2-6 expenditures per estate
    
    for (let i = 0; i < numExpenditures; i++) {
      const expenditureType = randomChoice(expenditureTypes);
      const vendor = randomChoice(vendors);
      const expenditureDate = new Date(Date.now() - randomInt(0, 1095) * 24 * 60 * 60 * 1000); // Up to 3 years ago
      
      const expenditure = {
        estate_id: estate.id,
        type: expenditureType,
        description: `${expenditureType.replace('_', ' ')} for ${estate.id}`,
        amount: randomDecimal(1000000, 50000000, 2),
        currency: 'NGN',
        expenditure_date: expenditureDate,
        vendor_name: vendor,
        payment_status: randomChoice(['paid', 'paid', 'paid', 'pending', 'partial']), // 60% paid
        category: randomChoice(['operational', 'strategic', 'maintenance', 'expansion', 'upgrade'])
      };

      await client.query(
        `INSERT INTO capital_expenditure (
           estate_id, type, description, amount, currency,
           expenditure_date, vendor_name, payment_status,
           category, payment_details, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          expenditure.estate_id,
          expenditure.type,
          expenditure.description,
          expenditure.amount,
          expenditure.currency,
          expenditure.expenditure_date,
          expenditure.vendor_name,
          expenditure.payment_status,
          expenditure.category,
          JSON.stringify({
            payment_method: randomChoice(['Bank Transfer', 'Cheque', 'Credit Card', 'Cash']),
            payment_terms: randomChoice(['Net 30', 'Net 60', 'Immediate', '50% Advance']),
            invoice_number: `INV-${randomInt(10000, 99999)}`,
            tax_amount: expenditure.amount * 0.075, // 7.5% VAT
            discount_amount: expenditure.amount * randomDecimal(0, 0.15, 2)
          }),
          JSON.stringify({
            approval_authority: randomChoice(['Department Head', 'Finance Manager', 'CEO', 'Board']),
            project_code: `PRJ-${estate.id}-${randomInt(100, 999)}`,
            cost_center: randomChoice(['IT Infrastructure', 'Network Operations', 'Customer Service', 'Business Development']),
            depreciation_period: randomInt(3, 10) // years
          })
        ]
      );
    }
  }
}

export async function seedROITracking(client) {
  console.log('📈 Seeding ROI tracking...');
  
  const { rows: investments } = await client.query('SELECT id, estate_id FROM infrastructure_investments');
  
  for (const investment of investments) {
    // Generate 12 months of ROI tracking data
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let month = 0; month < 12; month++) {
      const trackingDate = new Date(startDate);
      trackingDate.setMonth(trackingDate.getMonth() + month);
      
      const revenue = randomDecimal(500000, 10000000, 2);
      const costs = randomDecimal(200000, 5000000, 2);
      const profit = revenue - costs;
      const roi = (profit / costs) * 100;
      
      await client.query(
        `INSERT INTO roi_tracking (
           investment_id, tracking_date, revenue, costs,
           profit, roi_percentage, currency, variance_analysis,
           performance_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          investment.id,
          trackingDate.toISOString().split('T')[0],
          revenue,
          costs,
          profit,
          roi,
          'NGN',
          JSON.stringify({
            budget_variance: randomDecimal(-15, 15, 2),
            timeline_variance: randomDecimal(-10, 10, 2),
            scope_variance: randomDecimal(-5, 5, 2),
            quality_variance: randomDecimal(-8, 8, 2)
          }),
          JSON.stringify({
            customer_satisfaction: randomDecimal(3.5, 5.0, 1),
            service_uptime: randomDecimal(95, 99.9, 2),
            response_time: randomDecimal(5, 50, 2),
            capacity_utilization: randomDecimal(60, 95, 2)
          }),
          JSON.stringify({
            market_conditions: randomChoice(['Favorable', 'Stable', 'Challenging']),
            competitive_position: randomChoice(['Leading', 'Strong', 'Competitive', 'Developing']),
            regulatory_environment: randomChoice(['Supportive', 'Neutral', 'Restrictive']),
            economic_factors: randomChoice(['Growth', 'Stability', 'Recession'])
          })
        ]
      );
    }
  }
}

export async function seedInvestmentPerformanceMetrics(client) {
  console.log('🎯 Seeding investment performance metrics...');
  
  const { rows: investments } = await client.query('SELECT id FROM infrastructure_investments');
  
  for (const investment of investments) {
    // Generate quarterly performance metrics
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let quarter = 0; quarter < 4; quarter++) {
      const quarterDate = new Date(startDate);
      quarterDate.setMonth(quarterDate.getMonth() + (quarter * 3));
      
      const progressPercentage = Math.min(100, (quarter + 1) * 25 + randomInt(-10, 10));
      const qualityScore = randomDecimal(3.5, 5.0, 1);
      const riskIndicator = randomChoice(['low', 'low', 'medium', 'medium', 'high']);
      
      await client.query(
        `INSERT INTO investment_performance_metrics (
           investment_id, quarter_date, progress_percentage,
           quality_score, risk_indicator, milestone_achievement,
           resource_utilization, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          investment.id,
          quarterDate.toISOString().split('T')[0],
          progressPercentage,
          qualityScore,
          riskIndicator,
          JSON.stringify({
            technical_milestones: randomInt(2, 8),
            business_milestones: randomInt(1, 5),
            regulatory_milestones: randomInt(1, 3),
            quality_milestones: randomInt(2, 6)
          }),
          JSON.stringify({
            budget_utilization: randomDecimal(70, 110, 2),
            timeline_utilization: randomDecimal(75, 105, 2),
            resource_efficiency: randomDecimal(80, 95, 2),
            team_productivity: randomDecimal(75, 90, 2)
          }),
          JSON.stringify({
            challenges_faced: randomChoice(['Technical Issues', 'Resource Constraints', 'Market Changes', 'Regulatory Delays']),
            mitigation_strategies: ['Alternative Solutions', 'Resource Reallocation', 'Timeline Adjustment', 'Expert Consultation'],
            lessons_learned: ['Improved Planning', 'Better Risk Assessment', 'Enhanced Communication', 'Process Optimization'],
            next_quarter_focus: ['Milestone Achievement', 'Quality Improvement', 'Risk Mitigation', 'Stakeholder Communication']
          })
        ]
      );
    }
  }
}
