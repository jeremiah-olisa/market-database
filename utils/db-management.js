import pool from "./pool.js";

async function truncateAllTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Disable triggers temporarily
    await client.query('SET session_replication_role = replica;');

    // Truncate all tables in the public schema
    await client.query(`
      DO $$ 
      DECLARE 
        table_rec record;
      BEGIN 
        FOR table_rec IN (SELECT table_name 
                         FROM information_schema.tables 
                         WHERE table_schema = 'public' 
                         AND table_type = 'BASE TABLE'
                         AND table_name != '__migrations') 
        LOOP
          EXECUTE format('TRUNCATE TABLE %I CASCADE', table_rec.table_name);
        END LOOP;
      END $$;
    `);

    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT;');

    await client.query('COMMIT');
    console.log('🧹 All tables truncated successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error truncating tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function dropAllTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop materialized views first (if any exist)
    await client.query(`
      DO $$ 
      DECLARE 
        matview_rec record;
      BEGIN 
        FOR matview_rec IN (SELECT schemaname, matviewname 
                           FROM pg_matviews 
                           WHERE schemaname = 'public') 
        LOOP
          EXECUTE format('DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE', 
                        matview_rec.schemaname, 
                        matview_rec.matviewname);
        END LOOP;
      END $$;
    `);

    // Drop all tables in the public schema (except migrations table)
    await client.query(`
      DO $$ 
      DECLARE 
        table_rec record;
      BEGIN 
        FOR table_rec IN (SELECT table_name 
                         FROM information_schema.tables 
                         WHERE table_schema = 'public' 
                         AND table_type = 'BASE TABLE'
                         AND table_name != '__migrations') 
        LOOP
          EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_rec.table_name);
        END LOOP;
      END $$;
    `);

    // Drop PostGIS extension if it exists
    await client.query('DROP EXTENSION IF EXISTS postgis CASCADE');

    await client.query('COMMIT');
    console.log('💥 All tables dropped successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function refreshDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting database refresh...');
    
    // Drop everything
    await dropAllTables();
    
    // Run migrations
    console.log('📝 Running migrations...');
    const { migrate } = await import('../migrations/migrate.js');
    await migrate();
    
    // Run seeds
    console.log('🌱 Seeding database...');
    const { seed } = await import('../seeders/seed.js');
    await seed();
    
    console.log('✨ Database refresh completed successfully!');
  } catch (err) {
    console.error('❌ Error refreshing database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute based on command line argument
const command = process.argv[2];

switch (command) {
  case 'truncate':
    truncateAllTables()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case 'drop':
    dropAllTables()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  case 'refresh':
    refreshDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;
  default:
    console.error('❌ Invalid command. Use: truncate, drop, or refresh');
    process.exit(1);
}
