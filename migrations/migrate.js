import pool from "../utils/pool.js";
import fs from "fs/promises";
import path from "path";

async function migrate() {
  const client = await pool.connect();
  try {
    // Get all SQL files in the migrations directory
    const files = await fs.readdir(__dirname);

    const sqlFiles = files
      .filter((file) => file.endsWith(".sql") && !file.includes("create-db-schema"))
      .sort(); // Sort alphabetically (timestamp prefixes ensure correct order)

    console.log(`🚀 Found ${sqlFiles.length} migration files to run`);

    await client.query("BEGIN");

    for (const file of sqlFiles) {
      console.log(`📝 Running migration: ${file}`);
      const migrationPath = path.join(__dirname, file);
      const migrationSQL = await fs.readFile(migrationPath, "utf8");
      
      await client.query(migrationSQL);
      console.log(`✅ Completed: ${file}`);
    }

    await client.query("COMMIT");
    console.log("🎉 All migrations completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error running migrations:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
