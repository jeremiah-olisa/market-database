import pool from "../utils/pool.js";

// Business categories seed data - hierarchical structure for Nigerian business ecosystem
const businessCategoriesData = [
  // Level 1 categories
  {
    name: "Retail",
    description: "Businesses selling goods directly to consumers",
    parent_category_id: null,
    category_level: 1,
    category_path: "retail",
    business_type: "retail",
    market_relevance_score: 5,
    typical_investment_range: { min: 500000, max: 5000000, currency: "NGN" },
    employment_potential: 4,
    target_demographics: ["families", "young_adults", "professionals"],
    seasonality_factors: { peak_months: ["december", "january"], low_months: ["february", "march"] }
  },
  {
    name: "Food & Hospitality",
    description: "Restaurants, cafes, and food service businesses",
    parent_category_id: null,
    category_level: 1,
    category_path: "food_hospitality",
    business_type: "hospitality",
    market_relevance_score: 5,
    typical_investment_range: { min: 1000000, max: 10000000, currency: "NGN" },
    employment_potential: 5,
    target_demographics: ["all_demographics"],
    seasonality_factors: { peak_months: ["december", "april"], low_months: ["january"] }
  },
  {
    name: "Professional Services",
    description: "Professional and business services",
    parent_category_id: null,
    category_level: 1,
    category_path: "professional_services",
    business_type: "professional",
    market_relevance_score: 4,
    typical_investment_range: { min: 200000, max: 2000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["professionals", "businesses"],
    seasonality_factors: { peak_months: ["october", "november"], low_months: ["december"] }
  },
  {
    name: "Healthcare",
    description: "Medical and healthcare services",
    parent_category_id: null,
    category_level: 1,
    category_path: "healthcare",
    business_type: "healthcare",
    market_relevance_score: 5,
    typical_investment_range: { min: 2000000, max: 50000000, currency: "NGN" },
    employment_potential: 4,
    target_demographics: ["all_demographics"],
    seasonality_factors: { peak_months: ["all_year"], low_months: [] }
  },
  {
    name: "Personal Services",
    description: "Personal care and service businesses",
    parent_category_id: null,
    category_level: 1,
    category_path: "personal_services",
    business_type: "service",
    market_relevance_score: 4,
    typical_investment_range: { min: 300000, max: 3000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["families", "young_adults", "professionals"],
    seasonality_factors: { peak_months: ["december", "april"], low_months: ["february"] }
  }
];

// Level 2 categories (will be inserted after level 1)
const level2CategoriesData = [
  // Retail subcategories
  {
    name: "Grocery & Supermarkets",
    description: "Food and household essentials retail",
    parent_category_name: "Retail",
    category_level: 2,
    category_path: "retail/grocery",
    business_type: "retail",
    market_relevance_score: 5,
    typical_investment_range: { min: 2000000, max: 15000000, currency: "NGN" },
    employment_potential: 5,
    target_demographics: ["families", "households"],
    seasonality_factors: { peak_months: ["december"], low_months: [] }
  },
  {
    name: "Fashion & Clothing",
    description: "Clothing, shoes, and fashion accessories",
    parent_category_name: "Retail",
    category_level: 2,
    category_path: "retail/fashion",
    business_type: "retail",
    market_relevance_score: 4,
    typical_investment_range: { min: 800000, max: 8000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["young_adults", "professionals", "teenagers"],
    seasonality_factors: { peak_months: ["december", "april"], low_months: ["february"] }
  },
  {
    name: "Electronics & Technology",
    description: "Consumer electronics and tech products",
    parent_category_name: "Retail",
    category_level: 2,
    category_path: "retail/electronics",
    business_type: "retail",
    market_relevance_score: 4,
    typical_investment_range: { min: 1500000, max: 20000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["professionals", "young_adults", "students"],
    seasonality_factors: { peak_months: ["december", "january"], low_months: ["march"] }
  },
  
  // Food & Hospitality subcategories
  {
    name: "Restaurants",
    description: "Full-service dining establishments",
    parent_category_name: "Food & Hospitality",
    category_level: 2,
    category_path: "food_hospitality/restaurants",
    business_type: "hospitality",
    market_relevance_score: 5,
    typical_investment_range: { min: 3000000, max: 25000000, currency: "NGN" },
    employment_potential: 5,
    target_demographics: ["all_demographics"],
    seasonality_factors: { peak_months: ["december", "april"], low_months: ["january"] }
  },
  {
    name: "Fast Food & Cafes",
    description: "Quick service restaurants and cafes",
    parent_category_name: "Food & Hospitality",
    category_level: 2,
    category_path: "food_hospitality/fast_food",
    business_type: "hospitality",
    market_relevance_score: 5,
    typical_investment_range: { min: 1500000, max: 8000000, currency: "NGN" },
    employment_potential: 4,
    target_demographics: ["young_adults", "professionals", "students"],
    seasonality_factors: { peak_months: ["all_year"], low_months: [] }
  },
  
  // Professional Services subcategories
  {
    name: "Legal Services",
    description: "Law firms and legal consulting",
    parent_category_name: "Professional Services",
    category_level: 2,
    category_path: "professional_services/legal",
    business_type: "professional",
    market_relevance_score: 4,
    typical_investment_range: { min: 500000, max: 5000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["businesses", "professionals"],
    seasonality_factors: { peak_months: ["october", "november"], low_months: ["december"] }
  },
  {
    name: "Financial Services",
    description: "Accounting, banking, and financial consulting",
    parent_category_name: "Professional Services",
    category_level: 2,
    category_path: "professional_services/financial",
    business_type: "professional",
    market_relevance_score: 5,
    typical_investment_range: { min: 800000, max: 8000000, currency: "NGN" },
    employment_potential: 4,
    target_demographics: ["businesses", "professionals", "individuals"],
    seasonality_factors: { peak_months: ["march", "december"], low_months: ["january"] }
  },
  
  // Healthcare subcategories
  {
    name: "Clinics & Medical Centers",
    description: "Primary healthcare facilities",
    parent_category_name: "Healthcare",
    category_level: 2,
    category_path: "healthcare/clinics",
    business_type: "healthcare",
    market_relevance_score: 5,
    typical_investment_range: { min: 5000000, max: 50000000, currency: "NGN" },
    employment_potential: 4,
    target_demographics: ["all_demographics"],
    seasonality_factors: { peak_months: ["all_year"], low_months: [] }
  },
  {
    name: "Pharmacies",
    description: "Pharmaceutical retail and services",
    parent_category_name: "Healthcare",
    category_level: 2,
    category_path: "healthcare/pharmacies",
    business_type: "healthcare",
    market_relevance_score: 5,
    typical_investment_range: { min: 2000000, max: 15000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["all_demographics"],
    seasonality_factors: { peak_months: ["all_year"], low_months: [] }
  },
  
  // Personal Services subcategories
  {
    name: "Beauty & Wellness",
    description: "Salons, spas, and beauty services",
    parent_category_name: "Personal Services",
    category_level: 2,
    category_path: "personal_services/beauty",
    business_type: "service",
    market_relevance_score: 4,
    typical_investment_range: { min: 800000, max: 5000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["women", "young_adults", "professionals"],
    seasonality_factors: { peak_months: ["december", "april"], low_months: ["february"] }
  },
  {
    name: "Fitness & Recreation",
    description: "Gyms, sports, and recreational facilities",
    parent_category_name: "Personal Services",
    category_level: 2,
    category_path: "personal_services/fitness",
    business_type: "service",
    market_relevance_score: 3,
    typical_investment_range: { min: 2000000, max: 20000000, currency: "NGN" },
    employment_potential: 3,
    target_demographics: ["young_adults", "professionals", "health_conscious"],
    seasonality_factors: { peak_months: ["january", "april"], low_months: ["december"] }
  }
];

async function seedBusinessCategories() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding business categories data...");
    
    await client.query("BEGIN");
    
    // Clear existing business categories data
    await client.query("DELETE FROM business_categories");
    console.log("  📝 Cleared existing business categories data");
    
    // Insert Level 1 categories first
    const level1Ids = {};
    for (const category of businessCategoriesData) {
      const insertQuery = `
        INSERT INTO business_categories (
          name, description, parent_category_id, category_level, category_path,
          business_type, market_relevance_score, typical_investment_range,
          employment_potential, target_demographics, seasonality_factors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        category.name,
        category.description,
        category.parent_category_id,
        category.category_level,
        category.category_path,
        category.business_type,
        category.market_relevance_score,
        JSON.stringify(category.typical_investment_range),
        category.employment_potential,
        JSON.stringify(category.target_demographics),
        JSON.stringify(category.seasonality_factors)
      ]);
      
      level1Ids[category.name] = result.rows[0].id;
    }
    
    console.log(`  ✅ Inserted ${businessCategoriesData.length} level 1 categories`);
    
    // Insert Level 2 categories
    for (const category of level2CategoriesData) {
      const parentId = level1Ids[category.parent_category_name];
      if (!parentId) {
        console.error(`Parent category not found: ${category.parent_category_name}`);
        continue;
      }
      
      const insertQuery = `
        INSERT INTO business_categories (
          name, description, parent_category_id, category_level, category_path,
          business_type, market_relevance_score, typical_investment_range,
          employment_potential, target_demographics, seasonality_factors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await client.query(insertQuery, [
        category.name,
        category.description,
        parentId,
        category.category_level,
        category.category_path,
        category.business_type,
        category.market_relevance_score,
        JSON.stringify(category.typical_investment_range),
        category.employment_potential,
        JSON.stringify(category.target_demographics),
        JSON.stringify(category.seasonality_factors)
      ]);
    }
    
    await client.query("COMMIT");
    console.log(`  ✅ Successfully seeded ${level2CategoriesData.length} level 2 categories`);
    
    // Verify the data
    const countResult = await client.query("SELECT COUNT(*) FROM business_categories");
    const level1Count = await client.query("SELECT COUNT(*) FROM business_categories WHERE category_level = 1");
    const level2Count = await client.query("SELECT COUNT(*) FROM business_categories WHERE category_level = 2");
    
    console.log(`  📊 Total categories: ${countResult.rows[0].count}`);
    console.log(`  📊 Level 1 categories: ${level1Count.rows[0].count}`);
    console.log(`  📊 Level 2 categories: ${level2Count.rows[0].count}`);
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding business categories:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedBusinessCategories;