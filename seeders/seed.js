import pool from "../utils/pool.js";
import { seedProducts } from "./products-seed.js";
import { seedAreas } from "./areas-seed.js";
import { seedEstates } from "./estates-seed.js";
import { seedEstateUnits } from "./estate-units-seed.js";
import { seedPriceTrends } from "./price-trends-seed.js";
import { seedDemographics } from "./demographics-seed.js";
import { seedServiceProviders } from "./service-providers-seed.js";
import { seedBusinessEcosystem } from "./business-ecosystem-seed.js";
import { seedCustomerIntelligence } from "./customer-intelligence-seed.js";
import { seedInfrastructure } from "./infrastructure-seed.js";
import { seedFinancial } from "./financial-seed.js";
import { seedMarketIntelligence } from "./market-intelligence-seed.js";
import { enhanceExistingData } from "./enhanced-seed.js";

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting comprehensive database seeding for Requirements v2...");
    await client.query("BEGIN");

    // Seed core tables in dependency order
    console.log("\n📋 Phase 1: Core Tables");
    await seedProducts(client);
    await seedAreas(client);
    await seedEstates(client);
    await seedEstateUnits(client);
    await seedPriceTrends(client);

    // Enhance existing data with new fields
    console.log("\n🔄 Phase 2: Enhance Existing Data");
    await enhanceExistingData(client);

    // Seed new tables for Requirements v2
    console.log("\n📊 Phase 3: Market Intelligence & Demographics");
    await seedDemographics(client);
    await seedServiceProviders(client);
    await seedMarketIntelligence(client);

    console.log("\n🏪 Phase 4: Business Ecosystem");
    await seedBusinessEcosystem(client);

    console.log("\n👥 Phase 5: Customer Intelligence");
    await seedCustomerIntelligence(client);

    console.log("\n🏗️ Phase 6: Infrastructure & Performance");
    await seedInfrastructure(client);

    console.log("\n💰 Phase 7: Financial Intelligence");
    await seedFinancial(client);

    await client.query("COMMIT");
    console.log("\n🎉 Comprehensive database seeding completed successfully!");
    console.log("✅ All Requirements v2 tables have been populated with realistic data");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding database:", err);
    throw err;
  } finally {
    client.release();
  }
}

seed().then(() => pool.end());
