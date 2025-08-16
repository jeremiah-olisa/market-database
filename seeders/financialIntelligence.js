import {
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedInvestmentPlans(client) {
  console.log('💼 Seeding investment plans...');
  
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  const planTypes = ['infrastructure', 'service_expansion', 'upgrade', 'maintenance', 'new_market_entry', 'technology', 'acquisition'];
  const statuses = ['planned', 'approved', 'in_progress', 'completed', 'cancelled'];
  
  for (const estate of estates) {
    const numPlans = randomInt(1, 3); // 1-3 investment plans per estate
    
    for (let i = 0; i < numPlans; i++) {
      const investmentType = randomChoice(planTypes);
      const status = randomChoice(statuses);
      const startDate = new Date(Date.now() + randomInt(30, 730) * 24 * 60 * 60 * 1000); // 1 month to 2 years from now
      const duration = randomInt(6, 36); // 6-36 months
      const endDate = new Date(startDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
      
      const investment = {
        estate_id: estate.id,
        investment_type: investmentType,
        status: status,
        planned_amount: randomDecimal(1000000, 50000000, 2), // Reduced from 200M to 50M
        currency: 'NGN',
        start_date: startDate,
        end_date: endDate,
        expected_roi: randomDecimal(15, 50, 2), // Reduced from 60 to 50
        payback_period: randomInt(12, 60), // 1-5 years
        risk_assessment: JSON.stringify({
          risk_level: randomChoice(['low', 'medium', 'high']),
          risk_factors: ['Market Volatility', 'Technical Challenges', 'Regulatory Changes', 'Resource Constraints'],
          mitigation_strategies: ['Insurance Coverage', 'Contingency Planning', 'Expert Consultation', 'Phased Implementation']
        }),
        feasibility_metrics: JSON.stringify({
          market_demand: randomDecimal(70, 95, 2),
          technical_feasibility: randomDecimal(80, 98, 2),
          financial_viability: randomDecimal(75, 92, 2),
          regulatory_compliance: randomDecimal(85, 100, 2),
          resource_availability: randomDecimal(70, 90, 2)
        }),
        approval_status: JSON.stringify({
          stakeholders: ['Board of Directors', 'Technical Team', 'Finance Team', 'Operations Team'],
          success_criteria: ['ROI Achievement', 'Timeline Adherence', 'Quality Standards', 'Customer Satisfaction'],
          approval_date: new Date().toISOString().split('T')[0],
          approved_by: randomChoice(['CEO', 'CFO', 'CTO', 'Board'])
        })
      };

      await client.query(
        `INSERT INTO investment_plans (
           estate_id, investment_type, status, planned_amount, currency,
           start_date, end_date, expected_roi, payback_period,
           risk_assessment, feasibility_metrics, approval_status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          investment.estate_id,
          investment.investment_type,
          investment.status,
          investment.planned_amount,
          investment.currency,
          investment.start_date,
          investment.end_date,
          investment.expected_roi,
          investment.payback_period,
          investment.risk_assessment,
          investment.feasibility_metrics,
          investment.approval_status
        ]
      );
    }
  }
}

export async function seedCapitalExpenditure(client) {
  console.log('💸 Seeding capital expenditure...');
  
  const { rows: investmentPlans } = await client.query('SELECT id FROM investment_plans');
  const expenditureCategories = ['equipment_purchase', 'infrastructure_development', 'technology_licensing', 'facility_construction', 'software_development'];
  const vendors = ['TechCorp Nigeria', 'InfraTech Solutions', 'DigitalNet Systems', 'ConnectPro Africa', 'SmartCity Technologies'];
  
  for (const plan of investmentPlans) {
    const numExpenditures = randomInt(1, 3); // 1-3 expenditures per investment plan
    
    for (let i = 0; i < numExpenditures; i++) {
      const category = randomChoice(expenditureCategories);
      const vendor = randomChoice(vendors);
      const expenditureDate = new Date(Date.now() - randomInt(0, 1095) * 24 * 60 * 60 * 1000); // Up to 3 years ago
      const amount = randomDecimal(100000, 10000000, 2); // Reduced from 50M to 10M
      
      const expenditure = {
        investment_plan_id: plan.id,
        expenditure_date: expenditureDate,
        amount: amount,
        currency: 'NGN',
        category: category,
        vendor: vendor,
        payment_status: randomChoice(['paid', 'paid', 'paid', 'pending', 'partial']), // 60% paid
        invoice_reference: `INV-${randomInt(10000, 99999)}`,
        expenditure_details: JSON.stringify({
          payment_method: randomChoice(['Bank Transfer', 'Cheque', 'Credit Card', 'Cash']),
          payment_terms: randomChoice(['Net 30', 'Net 60', 'Immediate', '50% Advance']),
          tax_amount: amount * 0.075, // 7.5% VAT
          discount_amount: amount * randomDecimal(0, 0.15, 2),
          project_code: `PRJ-${plan.id}-${randomInt(100, 999)}`,
          cost_center: randomChoice(['IT Infrastructure', 'Network Operations', 'Customer Service', 'Business Development'])
        })
      };

      await client.query(
        `INSERT INTO capital_expenditure (
           investment_plan_id, expenditure_date, amount, currency,
           category, vendor, payment_status, invoice_reference, expenditure_details
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          expenditure.investment_plan_id,
          expenditure.expenditure_date,
          expenditure.amount,
          expenditure.currency,
          expenditure.category,
          expenditure.vendor,
          expenditure.payment_status,
          expenditure.invoice_reference,
          expenditure.expenditure_details
        ]
      );
    }
  }
}

export async function seedROITracking(client) {
  console.log('📈 Seeding ROI tracking...');
  
  const { rows: investmentPlans } = await client.query('SELECT id FROM investment_plans');
  
  for (const plan of investmentPlans) {
    // Generate 12 months of ROI tracking data with unique dates
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let month = 0; month < 12; month++) {
      const trackingDate = new Date(startDate);
      trackingDate.setMonth(trackingDate.getMonth() + month);
      
      // Use very small, safe values to avoid any numeric overflow
      const actualRevenue = randomDecimal(1000, 10000, 2);  // 1K to 10K
      const actualCosts = randomDecimal(500, 5000, 2);      // 500 to 5K
      
      try {
        await client.query(
          `INSERT INTO roi_tracking (
             investment_plan_id, tracking_period, actual_revenue, actual_costs,
             currency, performance_metrics, variance_analysis
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (investment_plan_id, tracking_period) DO NOTHING`,
          [
            plan.id,
            trackingDate.toISOString().split('T')[0],
            actualRevenue,
            actualCosts,
            'NGN',
            JSON.stringify({
              customer_satisfaction: randomDecimal(3.5, 5.0, 1),
              service_uptime: randomDecimal(95, 99.9, 2),
              response_time: randomDecimal(5, 50, 2),
              capacity_utilization: randomDecimal(60, 95, 2)
            }),
            JSON.stringify({
              budget_variance: randomDecimal(-15, 15, 2),
              timeline_variance: randomDecimal(-10, 10, 2),
              scope_variance: randomDecimal(-5, 5, 2),
              quality_variance: randomDecimal(-8, 8, 2)
            })
          ]
        );
      } catch (error) {
        console.warn(`Warning: Could not insert ROI tracking for plan ${plan.id}, month ${month}: ${error.message}`);
      }
    }
  }
}

export async function seedInvestmentPerformanceMetrics(client) {
  console.log('🎯 Seeding investment performance metrics...');
  
  const { rows: investmentPlans } = await client.query('SELECT id FROM investment_plans');
  
  for (const plan of investmentPlans) {
    // Generate quarterly performance metrics with unique dates
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let quarter = 0; quarter < 4; quarter++) {
      const quarterDate = new Date(startDate);
      quarterDate.setMonth(quarterDate.getMonth() + (quarter * 3));
      
      const actualProgress = Math.min(100, Math.max(0, (quarter + 1) * 25 + randomInt(-10, 10)));
      const qualityScore = randomInt(70, 100);
      const budgetUtilization = randomDecimal(70, 100, 2); // Fixed: max 100 instead of 110
      
      try {
        await client.query(
          `INSERT INTO investment_performance_metrics (
             investment_plan_id, metric_date, actual_progress,
             budget_utilization, quality_score, milestone_completion,
             performance_indicators, risk_indicators
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (investment_plan_id, metric_date) DO NOTHING`,
          [
            plan.id,
            quarterDate.toISOString().split('T')[0],
            actualProgress,
            budgetUtilization,
            qualityScore,
            JSON.stringify({
              technical_milestones: randomInt(2, 8),
              business_milestones: randomInt(1, 5),
              regulatory_milestones: randomInt(1, 3),
              quality_milestones: randomInt(2, 6)
            }),
            JSON.stringify({
              timeline_utilization: randomDecimal(75, 100, 2), // Fixed: max 100
              resource_efficiency: randomDecimal(80, 95, 2),
              team_productivity: randomDecimal(75, 90, 2),
              stakeholder_satisfaction: randomDecimal(3.5, 5.0, 1)
            }),
            JSON.stringify({
              risk_level: randomChoice(['low', 'low', 'medium', 'medium', 'high']),
              challenges_faced: randomChoice(['Technical Issues', 'Resource Constraints', 'Market Changes', 'Regulatory Delays']),
              mitigation_strategies: ['Alternative Solutions', 'Resource Reallocation', 'Timeline Adjustment', 'Expert Consultation'],
              lessons_learned: ['Improved Planning', 'Better Risk Assessment', 'Enhanced Communication', 'Process Optimization']
            })
          ]
        );
      } catch (error) {
        console.warn(`Warning: Could not insert performance metrics for plan ${plan.id}, quarter ${quarter}: ${error.message}`);
      }
    }
  }
}
