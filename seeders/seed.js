import pool from "../utils/pool.js";
import seedProducts from "./products-seed.js";
import seedAreas from "./areas-seed.js";
import seedEstates from "./estates-seed.js";
import seedEstateUnits from "./estate-units-seed.js";
import seedPriceTrends from "./price-trends-seed.js";

// Import new v2 seeders
import seedDemographics from "./demographics-seed.js";
import seedServiceProviders from "./service-providers-seed.js";
import seedBusinessCategories from "./business-categories-seed.js";

async function seedDatabase() {
  console.log("🚀 Starting Market Intelligence Database v2 seeding process...");
  console.log("📊 This will populate all tables with comprehensive market data\n");
  
  const startTime = Date.now();
  
  try {
    // Phase 1: Core foundational data (areas, products, estates)
    console.log("📍 Phase 1: Seeding foundational data...");
    await seedAreas();
    await seedProducts();
    await seedEstates(); // Now includes tier classification and market intelligence
    await seedEstateUnits();
    await seedPriceTrends();
    console.log("✅ Phase 1 completed: Foundational data seeded\n");
    
    // Phase 2: Market intelligence and demographic data
    console.log("🧠 Phase 2: Seeding market intelligence data...");
    await seedDemographics();
    await seedServiceProviders();
    await seedBusinessCategories();
    console.log("✅ Phase 2 completed: Market intelligence data seeded\n");
    
    // Phase 3: Refresh materialized views for optimal performance
    console.log("🔄 Phase 3: Refreshing business intelligence views...");
    const client = await pool.connect();
    try {
      // Refresh materialized views if they exist
      try {
        await client.query("SELECT refresh_business_intelligence_views()");
        console.log("  ✅ Materialized views refreshed successfully");
      } catch (err) {
        console.log("  ℹ️  Materialized views not yet available - will be refreshed after first data load");
      }
    } finally {
      client.release();
    }
    console.log("✅ Phase 3 completed: Views refreshed\n");
    
    // Generate summary report
    const client2 = await pool.connect();
    try {
      console.log("📈 DATABASE SEEDING SUMMARY REPORT");
      console.log("=" .repeat(50));
      
      // Core tables summary
      const areas = await client2.query("SELECT COUNT(*) FROM areas");
      const products = await client2.query("SELECT COUNT(*) FROM products");
      const estates = await client2.query("SELECT COUNT(*) FROM estates");
      const estateUnits = await client2.query("SELECT COUNT(*) FROM estate_units");
      const priceTrends = await client2.query("SELECT COUNT(*) FROM price_trends");
      
      console.log("📊 Core Tables:");
      console.log(`   • Areas: ${areas.rows[0].count}`);
      console.log(`   • Products: ${products.rows[0].count}`);
      console.log(`   • Estates: ${estates.rows[0].count}`);
      console.log(`   • Estate Units: ${estateUnits.rows[0].count}`);
      console.log(`   • Price Trends: ${priceTrends.rows[0].count}`);
      
      // New v2 tables summary
      const demographics = await client2.query("SELECT COUNT(*) FROM demographics");
      const serviceProviders = await client2.query("SELECT COUNT(*) FROM service_providers");
      const businessCategories = await client2.query("SELECT COUNT(*) FROM business_categories");
      
      console.log("\n🧠 Market Intelligence Tables:");
      console.log(`   • Demographics: ${demographics.rows[0].count}`);
      console.log(`   • Service Providers: ${serviceProviders.rows[0].count}`);
      console.log(`   • Business Categories: ${businessCategories.rows[0].count}`);
      
      // Estate tier distribution
      const tierDistribution = await client2.query(`
        SELECT tier_classification, COUNT(*) as count 
        FROM estates 
        WHERE tier_classification IS NOT NULL 
        GROUP BY tier_classification 
        ORDER BY 
          CASE tier_classification 
            WHEN 'platinum' THEN 1 
            WHEN 'gold' THEN 2 
            WHEN 'silver' THEN 3 
            WHEN 'bronze' THEN 4 
          END
      `);
      
      console.log("\n🏆 Estate Tier Distribution:");
      tierDistribution.rows.forEach(row => {
        const icon = row.tier_classification === 'platinum' ? '💎' : 
                    row.tier_classification === 'gold' ? '🥇' :
                    row.tier_classification === 'silver' ? '🥈' : '🥉';
        console.log(`   ${icon} ${row.tier_classification.toUpperCase()}: ${row.count} estates`);
      });
      
      // Market intelligence summary
      const avgMarketPotential = await client2.query(`
        SELECT 
          ROUND(AVG(market_potential_score), 1) as avg_potential,
          ROUND(AVG(competitive_intensity), 1) as avg_competition,
          COUNT(CASE WHEN fiber_ready = true THEN 1 END) as fiber_ready_count
        FROM estates
      `);
      
      console.log("\n📊 Market Intelligence Summary:");
      console.log(`   • Average Market Potential: ${avgMarketPotential.rows[0].avg_potential}/100`);
      console.log(`   • Average Competition Level: ${avgMarketPotential.rows[0].avg_competition}/5`);
      console.log(`   • Fiber-Ready Estates: ${avgMarketPotential.rows[0].fiber_ready_count}`);
      
      // Data quality indicators
      const dataQuality = await client2.query(`
        SELECT 
          COUNT(CASE WHEN d.data_quality_score >= 4 THEN 1 END) as high_quality_demos,
          COUNT(CASE WHEN sp.intelligence_confidence_level >= 4 THEN 1 END) as reliable_provider_data
        FROM demographics d, service_providers sp
      `);
      
      console.log("\n✅ Data Quality Indicators:");
      console.log(`   • High-Quality Demographics: ${dataQuality.rows[0].high_quality_demos}/${demographics.rows[0].count}`);
      console.log(`   • Reliable Provider Intel: ${dataQuality.rows[0].reliable_provider_data}/${serviceProviders.rows[0].count}`);
      
    } finally {
      client2.release();
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log("\n" + "=" .repeat(50));
    console.log(`🎉 Market Intelligence Database v2 seeding completed successfully!`);
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`🚀 Database is ready for market intelligence analysis and business decision support`);
    console.log("\n💡 Next steps:");
    console.log("   • Run market intelligence queries");
    console.log("   • Analyze competitive landscape");
    console.log("   • Generate business intelligence reports");
    console.log("   • Monitor materialized view refresh schedules");
    
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeding process
seedDatabase();
