import pool from "../utils/pool.js";

// Enhanced estates seed data with tier classification and market intelligence
const estatesData = [
  {
    name: "Banana Island",
    estate_type: "block_of_flats",
    product_id: 1,
    area_id: 1,
    unit_count: 50,
    occupancy_status: "fully_occupied",
    classification: "luxury",
    gated: true,
    has_security: true,
    tier_classification: "platinum",
    metadata: {
      amenities: ["swimming_pool", "gym", "playground", "clubhouse", "tennis_court"],
      infrastructure: {"fiber_ready": true, "backup_power": true, "water_treatment": true},
      security: {"cctv": true, "access_control": "biometric", "guards": "24_7"}
    },
    market_potential_score: 95.0,
    competitive_intensity: 4,
    market_size_estimate: 2000,
    target_demographics: {
      primary: ["high_income_professionals", "executives", "celebrities"],
      income_range: "1m_plus",
      age_group: "30_60"
    },
    infrastructure_readiness_score: 5,
    fiber_ready: true,
    power_stability_score: 5,
    business_density_score: 5,
    commercial_potential: "very_high",
    entry_barriers: {
      financial: "very_high_investment",
      regulatory: "premium_approvals",
      competitive: "established_luxury_market"
    },
    regulatory_compliance_status: "fully_compliant",
    investment_priority: 5
  },
  {
    name: "Ikeja GRA",
    estate_type: "duplex",
    product_id: 1,
    area_id: 2,
    unit_count: 30,
    occupancy_status: "vacant",
    classification: "middle_income",
    gated: true,
    has_security: false,
    tier_classification: "gold",
    metadata: {
      amenities: ["playground", "parking", "green_space"],
      infrastructure: {"fiber_ready": true, "backup_power": false, "water_treatment": false},
      security: {"cctv": false, "access_control": "key_card", "guards": "day_only"}
    },
    market_potential_score: 78.5,
    competitive_intensity: 3,
    market_size_estimate: 1500,
    target_demographics: {
      primary: ["middle_income_professionals", "families"],
      income_range: "400k_800k",
      age_group: "25_50"
    },
    infrastructure_readiness_score: 4,
    fiber_ready: true,
    power_stability_score: 3,
    business_density_score: 4,
    commercial_potential: "high",
    entry_barriers: {
      financial: "moderate_investment",
      regulatory: "standard_approvals",
      competitive: "moderate_competition"
    },
    regulatory_compliance_status: "compliant",
    investment_priority: 4
  },
  {
    name: "Garki Estate",
    estate_type: "bungalow",
    product_id: 1,
    area_id: 3,
    unit_count: 20,
    occupancy_status: "under_construction",
    classification: "low_income",
    gated: false,
    has_security: false,
    tier_classification: "bronze",
    metadata: {
      amenities: ["basic_road_access"],
      infrastructure: {"fiber_ready": false, "backup_power": false, "water_treatment": false},
      security: {"cctv": false, "access_control": "none", "guards": "none"}
    },
    market_potential_score: 45.2,
    competitive_intensity: 2,
    market_size_estimate: 800,
    target_demographics: {
      primary: ["low_income_families", "young_adults"],
      income_range: "100k_300k",
      age_group: "20_45"
    },
    infrastructure_readiness_score: 2,
    fiber_ready: false,
    power_stability_score: 2,
    business_density_score: 2,
    commercial_potential: "low",
    entry_barriers: {
      financial: "low_investment",
      regulatory: "basic_approvals",
      competitive: "price_sensitive_market"
    },
    regulatory_compliance_status: "partial_compliance",
    investment_priority: 2
  },
  {
    name: "Lekki Phase 1",
    estate_type: "block_of_flats",
    product_id: 2,
    area_id: 4,
    unit_count: 75,
    occupancy_status: "fully_occupied",
    classification: "luxury",
    gated: true,
    has_security: true,
    tier_classification: "platinum",
    metadata: {
      amenities: ["swimming_pool", "gym", "spa", "business_center", "concierge"],
      infrastructure: {"fiber_ready": true, "backup_power": true, "water_treatment": true},
      security: {"cctv": true, "access_control": "biometric", "guards": "24_7"}
    },
    market_potential_score: 92.8,
    competitive_intensity: 5,
    market_size_estimate: 3000,
    target_demographics: {
      primary: ["high_income_professionals", "entrepreneurs", "expatriates"],
      income_range: "800k_plus",
      age_group: "28_55"
    },
    infrastructure_readiness_score: 5,
    fiber_ready: true,
    power_stability_score: 5,
    business_density_score: 5,
    commercial_potential: "very_high",
    entry_barriers: {
      financial: "very_high_investment",
      regulatory: "premium_approvals",
      competitive: "intense_luxury_competition"
    },
    regulatory_compliance_status: "fully_compliant",
    investment_priority: 5
  },
  {
    name: "Wuse Zone 2",
    estate_type: "duplex",
    product_id: 3,
    area_id: 5,
    unit_count: 25,
    occupancy_status: "vacant",
    classification: "middle_income",
    gated: true,
    has_security: true,
    tier_classification: "gold",
    metadata: {
      amenities: ["playground", "parking", "green_space", "shopping_nearby"],
      infrastructure: {"fiber_ready": true, "backup_power": true, "water_treatment": false},
      security: {"cctv": true, "access_control": "key_card", "guards": "24_7"}
    },
    market_potential_score: 82.1,
    competitive_intensity: 3,
    market_size_estimate: 1800,
    target_demographics: {
      primary: ["government_workers", "professionals", "families"],
      income_range: "300k_700k",
      age_group: "25_50"
    },
    infrastructure_readiness_score: 4,
    fiber_ready: true,
    power_stability_score: 4,
    business_density_score: 4,
    commercial_potential: "high",
    entry_barriers: {
      financial: "moderate_investment",
      regulatory: "government_area_approvals",
      competitive: "government_worker_focus"
    },
    regulatory_compliance_status: "fully_compliant",
    investment_priority: 4
  }
];

async function seedEstates() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding enhanced estates data...");
    
    await client.query("BEGIN");
    
    // Clear existing estates data
    await client.query("DELETE FROM estates");
    console.log("  📝 Cleared existing estates data");
    
    // Insert enhanced estates data
    for (const estate of estatesData) {
      const insertQuery = `
        INSERT INTO estates (
          name, estate_type, product_id, area_id, unit_count, occupancy_status,
          classification, gated, has_security, tier_classification, metadata,
          market_potential_score, competitive_intensity, market_size_estimate,
          target_demographics, infrastructure_readiness_score, fiber_ready,
          power_stability_score, business_density_score, commercial_potential,
          entry_barriers, regulatory_compliance_status, investment_priority
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
      `;
      
      await client.query(insertQuery, [
        estate.name,
        estate.estate_type,
        estate.product_id,
        estate.area_id,
        estate.unit_count,
        estate.occupancy_status,
        estate.classification,
        estate.gated,
        estate.has_security,
        estate.tier_classification,
        JSON.stringify(estate.metadata),
        estate.market_potential_score,
        estate.competitive_intensity,
        estate.market_size_estimate,
        JSON.stringify(estate.target_demographics),
        estate.infrastructure_readiness_score,
        estate.fiber_ready,
        estate.power_stability_score,
        estate.business_density_score,
        estate.commercial_potential,
        JSON.stringify(estate.entry_barriers),
        estate.regulatory_compliance_status,
        estate.investment_priority
      ]);
    }
    
    await client.query("COMMIT");
    console.log(`  ✅ Successfully seeded ${estatesData.length} enhanced estate records`);
    
    // Verify the data
    const countResult = await client.query("SELECT COUNT(*) FROM estates");
    const tierCounts = await client.query(`
      SELECT tier_classification, COUNT(*) 
      FROM estates 
      WHERE tier_classification IS NOT NULL 
      GROUP BY tier_classification
    `);
    
    console.log(`  📊 Total estates: ${countResult.rows[0].count}`);
    tierCounts.rows.forEach(row => {
      console.log(`  📊 ${row.tier_classification} tier: ${row.count} estates`);
    });
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding estates:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedEstates;
export { estatesData }; 