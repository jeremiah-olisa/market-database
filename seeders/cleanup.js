import pool from "../utils/pool.js";

async function cleanup() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');
    
    // Get all table names (excluding system tables and the migrations table)
    const { rows: tables } = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%' 
      AND tablename != '__migrations'
      ORDER BY tablename;
    `);
    
    console.log(`📋 Found ${tables.length} tables to clean`);
    
    // Truncate all tables
    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
        console.log(`✅ Cleaned table: ${table.tablename}`);
      } catch (error) {
        console.log(`⚠️  Could not clean table ${table.tablename}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Cleanup interrupted, cleaning up...');
  await pool.end();
  process.exit(1);
});

cleanup().catch((err) => {
  console.error('❌ Fatal error during cleanup:', err);
  process.exit(1);
});
