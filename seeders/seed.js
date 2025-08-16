import pool from "../utils/pool.js";

async function seed() {
  const client = await pool.connect();
  try {
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding database:", err);
    throw err;
  } finally {
    client.release();
  }
}

seed().catch((err) => {
  console.error("❌ Fatal error during seeding:", err);
  process.exit(1);
});
