import pool from "../utils/pool.js";

// Import base data seeders
import {
  seedProducts,
  seedAreas,
  seedEstates,
  seedEstateUnits,
  seedPriceTrends,
} from "./baseData.js";

// Import market intelligence seeders
import {
  seedServiceProviders,
  seedProviderCoverage,
  seedServiceOfferings,
  seedMarketShareData,
} from "./marketIntelligence.js";

// Import business ecosystem seeders
import {
  seedBusinessCategories,
  seedLocalBusinesses,
  seedBusinessReviews,
  seedBusinessMetrics,
} from "./businessEcosystem.js";

// Import customer intelligence seeders
import {
  seedCustomerProfiles,
  seedUsagePatterns,
  seedCustomerFeedback,
  seedCrossServiceAdoption,
} from "./customerIntelligence.js";

// Import infrastructure seeders
import {
  seedNetworkInfrastructure,
  seedCapacityMetrics,
  seedInfrastructureInvestments,
  seedMaintenanceSchedule,
} from "./infrastructure.js";

// Import financial intelligence seeders
import {
  seedInvestmentPlans,
  seedCapitalExpenditure,
  seedROITracking,
  seedInvestmentPerformanceMetrics,
} from "./financialIntelligence.js";

// Import extended services seeders
import {
  seedExpandedServiceMetrics,
  seedDeliveryCoverageZones,
  seedFintechServiceMetrics,
  seedMailingSystemMetrics,
} from "./extendedServices.js";

// Import additional business intelligence seeders
import {
  seedDemographics,
  seedRevenueAnalytics,
  seedMarketOpportunities,
  seedServiceQualityMetrics,
} from "./additionalBusinessIntelligence.js";

// Import competitive intelligence seeders
import {
  seedMarketPenetrationMetrics,
  seedCompetitiveServiceComparison,
  seedCrossSellingOpportunities,
  seedMarketReadinessMetrics,
} from "./competitiveIntelligence.js";

// Import economic activity seeders
import {
  seedEconomicActivityMetrics,
  seedLifestyleIndicators,
  seedCustomerSegmentation,
  seedMarketTrends,
} from "./economicActivity.js";

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting comprehensive data seeding...");

    // Phase 1: Base Data (Required by other seeders)
    console.log("\n📋 Phase 1: Seeding Base Data...");
    await seedProducts(client);
    await seedAreas(client);
    await seedEstates(client);
    await seedEstateUnits(client);
    await seedPriceTrends(client);

    // Phase 2: Market Intelligence
    console.log("\n📊 Phase 2: Seeding Market Intelligence...");
    await seedServiceProviders(client);
    await seedProviderCoverage(client);
    await seedServiceOfferings(client);
    await seedMarketShareData(client);

    // Phase 3: Business Ecosystem
    console.log("\n🏪 Phase 3: Seeding Business Ecosystem...");
    await seedBusinessCategories(client);
    await seedLocalBusinesses(client);
    await seedBusinessReviews(client);
    await seedBusinessMetrics(client);

    // Phase 4: Customer Intelligence
    console.log("\n👥 Phase 4: Seeding Customer Intelligence...");
    await seedCustomerProfiles(client);
    await seedUsagePatterns(client);
    await seedCustomerFeedback(client);
    await seedCrossServiceAdoption(client);

    // Phase 5: Infrastructure
    console.log("\n🌐 Phase 5: Seeding Infrastructure...");
    await seedNetworkInfrastructure(client);
    await seedCapacityMetrics(client);
    await seedInfrastructureInvestments(client);
    await seedMaintenanceSchedule(client);

    // Phase 6: Financial Intelligence
    console.log("\n💼 Phase 6: Seeding Financial Intelligence...");
    await seedInvestmentPlans(client);
    await seedCapitalExpenditure(client);
    await seedROITracking(client);
    await seedInvestmentPerformanceMetrics(client);

    // Phase 7: Extended Services
    console.log("\n🚀 Phase 7: Seeding Extended Services...");
    await seedExpandedServiceMetrics(client);
    await seedDeliveryCoverageZones(client);
    await seedFintechServiceMetrics(client);
    await seedMailingSystemMetrics(client);

    // Phase 8: Additional Business Intelligence
    console.log("\n📈 Phase 8: Seeding Additional Business Intelligence...");
    await seedDemographics(client);
    await seedRevenueAnalytics(client);
    await seedMarketOpportunities(client);
    await seedServiceQualityMetrics(client);

    // Phase 9: Competitive Intelligence
    console.log("\n🏆 Phase 9: Seeding Competitive Intelligence...");
    await seedMarketPenetrationMetrics(client);
    await seedCompetitiveServiceComparison(client);
    await seedCrossSellingOpportunities(client);
    await seedMarketReadinessMetrics(client);

    // Phase 10: Economic Activity
    console.log("\n💼 Phase 10: Seeding Economic Activity...");
    await seedEconomicActivityMetrics(client);
    await seedLifestyleIndicators(client);
    await seedCustomerSegmentation(client);
    await seedMarketTrends(client);

    console.log("\n✅ All data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Seeding interrupted, cleaning up...");
  await pool.end();
  process.exit(1);
});

seed().catch((err) => {
  console.error("❌ Fatal error during seeding:", err);
  process.exit(1);
});

export default seed;
