import pool from "../utils/pool.js";

// Service providers seed data - competitive landscape for Nigerian market
const serviceProvidersData = [
  {
    name: "MTN Nigeria",
    legal_name: "MTN Nigeria Communications Plc",
    brand_name: "MTN",
    service_type: "telecommunications",
    primary_services: ["mobile_data", "voice_calls", "sms"],
    secondary_services: ["fintech", "digital_services", "enterprise_solutions"],
    market_segment: "mixed",
    company_size: "multinational",
    market_share_estimate: 35.2,
    coverage_area: "MULTIPOLYGON(((7.4500 9.0500, 7.5500 9.0500, 7.5500 9.1500, 7.4500 9.1500, 7.4500 9.0500)))",
    operational_states: ["fcr", "lagos", "kano", "rivers", "kaduna"],
    headquarters_location: "Lagos, Nigeria",
    regional_offices: ["Abuja", "Kano", "Port Harcourt", "Ibadan"],
    annual_revenue_estimate: 1500000000000,
    customer_base_estimate: 75000000,
    employee_count_estimate: 5000,
    years_in_operation: 21,
    founded_year: 2003,
    competitive_strengths: ["wide_coverage", "network_quality", "brand_recognition", "fintech_integration"],
    competitive_weaknesses: ["premium_pricing", "customer_service"],
    key_differentiators: ["mtn_momo", "data_rollover", "4g_coverage"],
    market_strategy: {
      "focus": "premium_market_leadership",
      "expansion": "digital_services",
      "investment": "5g_infrastructure"
    },
    technology_stack: {
      "network": "4g_lte_5g",
      "core": "ericsson_huawei",
      "billing": "amdocs",
      "customer_portal": "proprietary"
    },
    infrastructure_quality_score: 5,
    innovation_score: 4,
    customer_satisfaction_rating: 3.8,
    service_quality_score: 4,
    support_quality_rating: 3.5,
    response_time_score: 3,
    regulatory_status: "licensed",
    licenses_held: ["unified_access_service", "international_gateway", "fintech"],
    key_partners: ["mastercard", "visa", "microsoft"],
    threat_level: "critical",
    competitive_threat_score: 5,
    data_source: "market_research_2024",
    intelligence_confidence_level: 5,
    last_intelligence_update: "2024-01-15",
    operational_status: "active",
    business_model: "b2c"
  },
  {
    name: "Airtel Nigeria",
    legal_name: "Airtel Networks Limited",
    brand_name: "Airtel",
    service_type: "telecommunications",
    primary_services: ["mobile_data", "voice_calls", "sms"],
    secondary_services: ["fintech", "digital_services"],
    market_segment: "mixed",
    company_size: "multinational",
    market_share_estimate: 28.5,
    coverage_area: "MULTIPOLYGON(((7.4600 9.0600, 7.5400 9.0600, 7.5400 9.1400, 7.4600 9.1400, 7.4600 9.0600)))",
    operational_states: ["fcr", "lagos", "kano", "rivers"],
    headquarters_location: "Lagos, Nigeria",
    regional_offices: ["Abuja", "Kano", "Port Harcourt"],
    annual_revenue_estimate: 900000000000,
    customer_base_estimate: 55000000,
    employee_count_estimate: 3500,
    years_in_operation: 15,
    founded_year: 2009,
    competitive_strengths: ["competitive_pricing", "data_offers", "network_expansion"],
    competitive_weaknesses: ["coverage_gaps", "brand_perception"],
    key_differentiators: ["smartcash", "data_gifting", "affordable_plans"],
    market_strategy: {
      "focus": "value_market",
      "expansion": "rural_coverage",
      "investment": "network_quality"
    },
    technology_stack: {
      "network": "4g_lte",
      "core": "nokia_zte",
      "billing": "comverse",
      "customer_portal": "custom"
    },
    infrastructure_quality_score: 4,
    innovation_score: 3,
    customer_satisfaction_rating: 3.6,
    service_quality_score: 3,
    support_quality_rating: 3.2,
    response_time_score: 3,
    regulatory_status: "licensed",
    licenses_held: ["unified_access_service", "international_gateway"],
    key_partners: ["visa", "mastercard"],
    threat_level: "high",
    competitive_threat_score: 4,
    data_source: "market_research_2024",
    intelligence_confidence_level: 4,
    last_intelligence_update: "2024-01-20",
    operational_status: "active",
    business_model: "b2c"
  },
  {
    name: "Glo Mobile",
    legal_name: "Globacom Limited",
    brand_name: "Glo",
    service_type: "telecommunications",
    primary_services: ["mobile_data", "voice_calls", "sms"],
    secondary_services: ["enterprise_solutions"],
    market_segment: "residential",
    company_size: "large",
    market_share_estimate: 18.3,
    coverage_area: "MULTIPOLYGON(((7.4700 9.0700, 7.5300 9.0700, 7.5300 9.1300, 7.4700 9.1300, 7.4700 9.0700)))",
    operational_states: ["fcr", "lagos", "kano"],
    headquarters_location: "Lagos, Nigeria",
    regional_offices: ["Abuja", "Benin"],
    annual_revenue_estimate: 500000000000,
    customer_base_estimate: 35000000,
    employee_count_estimate: 2500,
    years_in_operation: 20,
    founded_year: 2004,
    competitive_strengths: ["data_bonuses", "local_content", "pricing"],
    competitive_weaknesses: ["network_quality", "coverage_limitations", "customer_service"],
    key_differentiators: ["data_overflow", "nigerian_owned", "entertainment_content"],
    market_strategy: {
      "focus": "mass_market",
      "expansion": "data_services",
      "investment": "network_upgrade"
    },
    technology_stack: {
      "network": "3g_4g",
      "core": "huawei_zte",
      "billing": "in_house",
      "customer_portal": "basic"
    },
    infrastructure_quality_score: 3,
    innovation_score: 2,
    customer_satisfaction_rating: 3.2,
    service_quality_score: 3,
    support_quality_rating: 2.8,
    response_time_score: 2,
    regulatory_status: "licensed",
    licenses_held: ["unified_access_service"],
    key_partners: ["local_banks"],
    threat_level: "medium",
    competitive_threat_score: 3,
    data_source: "market_research_2024",
    intelligence_confidence_level: 3,
    last_intelligence_update: "2024-02-01",
    operational_status: "active",
    business_model: "b2c"
  },
  {
    name: "9mobile",
    legal_name: "Emerging Markets Telecommunication Services Limited",
    brand_name: "9mobile",
    service_type: "telecommunications",
    primary_services: ["mobile_data", "voice_calls", "sms"],
    secondary_services: ["enterprise_solutions"],
    market_segment: "enterprise",
    company_size: "medium",
    market_share_estimate: 8.5,
    coverage_area: "MULTIPOLYGON(((7.4800 9.0800, 7.5200 9.0800, 7.5200 9.1200, 7.4800 9.1200, 7.4800 9.0800)))",
    operational_states: ["fcr", "lagos"],
    headquarters_location: "Lagos, Nigeria",
    regional_offices: ["Abuja"],
    annual_revenue_estimate: 180000000000,
    customer_base_estimate: 12000000,
    employee_count_estimate: 1200,
    years_in_operation: 20,
    founded_year: 2004,
    competitive_strengths: ["enterprise_focus", "data_quality", "premium_service"],
    competitive_weaknesses: ["limited_coverage", "market_share_decline", "financial_challenges"],
    key_differentiators: ["enterprise_solutions", "data_quality", "business_focus"],
    market_strategy: {
      "focus": "enterprise_niche",
      "expansion": "business_solutions",
      "investment": "service_quality"
    },
    technology_stack: {
      "network": "4g_lte",
      "core": "nokia",
      "billing": "comverse",
      "customer_portal": "enterprise_grade"
    },
    infrastructure_quality_score: 4,
    innovation_score: 3,
    customer_satisfaction_rating: 3.8,
    service_quality_score: 4,
    support_quality_rating: 4.0,
    response_time_score: 4,
    regulatory_status: "licensed",
    licenses_held: ["unified_access_service"],
    key_partners: ["cisco", "microsoft"],
    threat_level: "low",
    competitive_threat_score: 2,
    data_source: "market_research_2024",
    intelligence_confidence_level: 4,
    last_intelligence_update: "2024-01-25",
    operational_status: "active",
    business_model: "b2b"
  },
  {
    name: "MainOne Cable",
    legal_name: "MainOne Cable Company Limited",
    brand_name: "MainOne",
    service_type: "internet",
    primary_services: ["fiber_internet", "data_center", "cloud_services"],
    secondary_services: ["managed_services", "cybersecurity"],
    market_segment: "enterprise",
    company_size: "medium",
    market_share_estimate: 15.2,
    coverage_area: "MULTIPOLYGON(((7.4900 9.0900, 7.5100 9.0900, 7.5100 9.1100, 7.4900 9.1100, 7.4900 9.0900)))",
    operational_states: ["fcr", "lagos", "rivers"],
    headquarters_location: "Lagos, Nigeria",
    regional_offices: ["Abuja", "Port Harcourt"],
    annual_revenue_estimate: 85000000000,
    customer_base_estimate: 500000,
    employee_count_estimate: 800,
    years_in_operation: 14,
    founded_year: 2010,
    competitive_strengths: ["fiber_infrastructure", "enterprise_focus", "reliability", "technical_expertise"],
    competitive_weaknesses: ["limited_residential", "pricing", "coverage_area"],
    key_differentiators: ["submarine_cable", "data_center", "enterprise_grade", "international_connectivity"],
    market_strategy: {
      "focus": "enterprise_connectivity",
      "expansion": "data_center_services",
      "investment": "fiber_expansion"
    },
    technology_stack: {
      "network": "fiber_optic",
      "core": "cisco_juniper",
      "billing": "custom_enterprise",
      "customer_portal": "enterprise_dashboard"
    },
    infrastructure_quality_score: 5,
    innovation_score: 4,
    customer_satisfaction_rating: 4.2,
    service_quality_score: 5,
    support_quality_rating: 4.5,
    response_time_score: 4,
    regulatory_status: "licensed",
    licenses_held: ["infrastructure_company", "internet_service_provider"],
    key_partners: ["google", "microsoft", "amazon_aws"],
    threat_level: "medium",
    competitive_threat_score: 3,
    data_source: "market_research_2024",
    intelligence_confidence_level: 5,
    last_intelligence_update: "2024-01-10",
    operational_status: "active",
    business_model: "b2b"
  }
];

async function seedServiceProviders() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding service providers data...");
    
    await client.query("BEGIN");
    
    // Clear existing service providers data
    await client.query("DELETE FROM service_providers");
    console.log("  📝 Cleared existing service providers data");
    
    // Insert service providers data
    for (const provider of serviceProvidersData) {
      const insertQuery = `
        INSERT INTO service_providers (
          name, legal_name, brand_name, service_type, primary_services, secondary_services,
          market_segment, company_size, market_share_estimate, coverage_area, operational_states,
          headquarters_location, regional_offices, annual_revenue_estimate, customer_base_estimate,
          employee_count_estimate, years_in_operation, founded_year, competitive_strengths,
          competitive_weaknesses, key_differentiators, market_strategy, technology_stack,
          infrastructure_quality_score, innovation_score, customer_satisfaction_rating,
          service_quality_score, support_quality_rating, response_time_score, regulatory_status,
          licenses_held, key_partners, threat_level, competitive_threat_score, data_source,
          intelligence_confidence_level, last_intelligence_update, operational_status, business_model
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 
          ST_GeomFromText($10, 4326), $11, $12, $13, $14, $15, $16, $17, $18, $19, 
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, 
          $34, $35, $36, $37, $38, $39
        )
      `;
      
      await client.query(insertQuery, [
        provider.name,
        provider.legal_name,
        provider.brand_name,
        provider.service_type,
        JSON.stringify(provider.primary_services),
        JSON.stringify(provider.secondary_services),
        provider.market_segment,
        provider.company_size,
        provider.market_share_estimate,
        provider.coverage_area,
        JSON.stringify(provider.operational_states),
        provider.headquarters_location,
        JSON.stringify(provider.regional_offices),
        provider.annual_revenue_estimate,
        provider.customer_base_estimate,
        provider.employee_count_estimate,
        provider.years_in_operation,
        provider.founded_year,
        JSON.stringify(provider.competitive_strengths),
        JSON.stringify(provider.competitive_weaknesses),
        JSON.stringify(provider.key_differentiators),
        JSON.stringify(provider.market_strategy),
        JSON.stringify(provider.technology_stack),
        provider.infrastructure_quality_score,
        provider.innovation_score,
        provider.customer_satisfaction_rating,
        provider.service_quality_score,
        provider.support_quality_rating,
        provider.response_time_score,
        provider.regulatory_status,
        JSON.stringify(provider.licenses_held),
        JSON.stringify(provider.key_partners),
        provider.threat_level,
        provider.competitive_threat_score,
        provider.data_source,
        provider.intelligence_confidence_level,
        provider.last_intelligence_update,
        provider.operational_status,
        provider.business_model
      ]);
    }
    
    await client.query("COMMIT");
    console.log(`  ✅ Successfully seeded ${serviceProvidersData.length} service provider records`);
    
    // Verify the data
    const countResult = await client.query("SELECT COUNT(*) FROM service_providers");
    console.log(`  📊 Total service provider records: ${countResult.rows[0].count}`);
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding service providers:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedServiceProviders;