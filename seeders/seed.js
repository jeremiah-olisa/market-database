import { pool } from '../utils';
import seeder from './database-seeder.js';

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Seeding interrupted, cleaning up...");
  await pool.end();
  process.exit(1);
});

seeder.seed().catch((err) => {
  console.error("❌ Fatal error during seeding:", err);
  process.exit(1);
});

export default seeder.seed;
