import pool from "../utils/pool.js";
import { seedProducts } from "./products-seed.js";
import { seedAreas } from "./areas-seed.js";
import { seedEstates } from "./estates-seed.js";
import { seedEstateUnits } from "./estate-units-seed.js";
import { seedPriceTrends } from "./price-trends-seed.js";

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting database seeding...");
    await client.query("BEGIN");

    // Seed tables in dependency order
    await seedProducts(client);
    await seedAreas(client);
    await seedEstates(client);
    await seedEstateUnits(client);
    await seedPriceTrends(client);

    await client.query("COMMIT");
    console.log("🎉 Database seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding database:", err);
    throw err;
  } finally {
    client.release();
  }
}

seed().then(() => pool.end());
