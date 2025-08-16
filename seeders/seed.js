import pool from "../utils/pool.js";
import {
  seedProducts,
  seedAreas,
  seedEstates,
  seedEstateUnits,
  seedPriceTrends
} from './baseData.js';
import {
  seedServiceProviders,
  seedProviderCoverage,
  seedServiceOfferings,
  seedMarketShareData
} from './marketIntelligence.js';

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting database seeding...');
    
    // Start transaction
    await client.query('BEGIN');

    // Base Data
    await seedProducts(client);
    await seedAreas(client);
    await seedEstates(client);
    await seedEstateUnits(client);
    await seedPriceTrends(client);

    // Market Intelligence
    await seedServiceProviders(client);
    await seedProviderCoverage(client);
    await seedServiceOfferings(client);
    await seedMarketShareData(client);

    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Database seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Seeding interrupted, cleaning up...');
  await pool.end();
  process.exit(1);
});

seed().catch((err) => {
  console.error('❌ Fatal error during seeding:', err);
  process.exit(1);
});