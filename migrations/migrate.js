import pool from "../utils/pool.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate SHA-256 hash of file contents
function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function executeMigration(client, file, migrationSQL, checksum) {
  // Each migration runs in its own savepoint for granular control
  const savepointName = `migration_${file.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  try {
    // Create savepoint for this specific migration
    await client.query(`SAVEPOINT ${savepointName}`);

    // Execute migration
    await client.query(migrationSQL);

    // Record migration in the same transaction
    await client.query(
      `INSERT INTO "__migrations" (name, checksum) VALUES ($1, $2)`,
      [file, checksum]
    );

    // Release savepoint on success
    await client.query(`RELEASE SAVEPOINT ${savepointName}`);
    
    return true;
  } catch (err) {
    // Rollback to savepoint on failure
    await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
    throw err;
  }
}

async function migrate() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

    // Ensure migrations table exists first
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__migrations" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) NOT NULL,
        UNIQUE(name)
      );
      
      -- Add advisory lock function
      CREATE OR REPLACE FUNCTION acquire_migration_lock() RETURNS BOOLEAN AS $$
      BEGIN
        -- Try to acquire an advisory lock (lock_id: 1000)
        -- Returns true if lock is acquired, false if not
        RETURN pg_try_advisory_xact_lock(1000);
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Try to acquire migration lock
    const { rows: [{ acquire_migration_lock: lockAcquired }] } = 
      await client.query('SELECT acquire_migration_lock()');

    if (!lockAcquired) {
      throw new Error('Another migration process is running. Please wait.');
    }

    // Get all SQL files
    const files = await fs.readdir(__dirname);
    const sqlFiles = files
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`🚀 Found ${sqlFiles.length} migration files to run`);

    // Check for modified migrations first
    for (const file of sqlFiles) {
      const migrationPath = path.join(__dirname, file);
      const migrationSQL = await fs.readFile(migrationPath, "utf8");
      const checksum = calculateChecksum(migrationSQL);

      const { rows } = await client.query(
        `SELECT checksum FROM "__migrations" WHERE name = $1`,
        [file]
      );

      if (rows.length > 0 && rows[0].checksum !== checksum) {
        throw new Error(
          `Migration ${file} has been modified after being applied. This is not allowed for ACID compliance.`
        );
      }
    }

    // Run migrations
    for (const file of sqlFiles) {
      console.log(`📝 Processing migration: ${file}`);
      const migrationPath = path.join(__dirname, file);
      const migrationSQL = await fs.readFile(migrationPath, "utf8");
      const checksum = calculateChecksum(migrationSQL);

      // Check if already applied
      const { rows } = await client.query(
        `SELECT name FROM "__migrations" WHERE name = $1`,
        [file]
      );

      if (rows.length > 0) {
        console.log(`⏭️  Skipping: ${file} (already applied)`);
        continue;
      }

      // Execute migration with savepoint
      try {
        await executeMigration(client, file, migrationSQL, checksum);
        console.log(`✅ Completed: ${file}`);
      } catch (err) {
        console.error(`❌ Failed to apply migration ${file}:`, err);
        throw err; // Re-throw to trigger main transaction rollback
      }
    }

    // Commit main transaction
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

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted, cleaning up...');
  await pool.end();
  process.exit(1);
});

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});