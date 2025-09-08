import { pool } from '../utils/index.js';

/**
 * Installation Testing Suite
 * Tests system installation, setup, and configuration using Jest
 */
describe('System Installation Tests', () => {
  beforeAll(async () => {
    // Test database connection before running tests
    const connection = await global.testUtils.testDatabaseConnection(pool);
    if (!connection.success) {
      throw new Error(`Database connection failed: ${connection.error}`);
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Database Connection', () => {
    test('should connect to PostgreSQL database', async () => {
      const result = await pool.query('SELECT version()');

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].version).toContain('PostgreSQL');
    });

    test('should have correct database name', async () => {
      const result = await pool.query('SELECT current_database()');

      expect(result.rows[0].current_database).toBe(process?.env?.DB_NAME ?? 'market_db_2');
    });

    test('should have correct user permissions', async () => {
      const result = await pool.query('SELECT current_user');

      expect(result.rows[0].current_user).toBe('postgres');
    });
  });

  describe('PostGIS Extension', () => {
    test('should have PostGIS extension enabled', async () => {
      const result = await pool.query(`
        SELECT extname, extversion
        FROM pg_extension
        WHERE extname = 'postgis'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].extname).toBe('postgis');
      expect(result.rows[0].extversion).toBeDefined();
    });

    test('should have spatial functions available', async () => {
      const result = await pool.query(`
        SELECT proname
        FROM pg_proc
        WHERE proname IN ('st_distance', 'st_within', 'st_intersects')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Database Configuration', () => {
    test('should have proper connection settings', async () => {
      const result = await pool.query(`
        SELECT name, setting, unit
        FROM pg_settings
        WHERE name IN ('max_connections', 'shared_buffers', 'work_mem')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3);

      // Check specific settings
      const maxConnections = result.rows.find(row => row.name === 'max_connections');
      expect(parseInt(maxConnections.setting)).toBeGreaterThanOrEqual(100);
    });

    test('should have proper timeout settings', async () => {
      const result = await pool.query(`
        SELECT name, setting
        FROM pg_settings
        WHERE name IN ('statement_timeout', 'lock_timeout')
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Schema Installation', () => {
    test('should have all required schemas', async () => {
      const result = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name IN ('public', 'information_schema', 'pg_catalog')
    `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });

    test('should have public schema as default', async () => {
      const result = await pool.query('SELECT current_schema()');
      expect(result.rows[0].current_schema).toBe('public');
    });
  });

  describe('Table Installation', () => {
    test('should have migrations table for version control', async () => {
      const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = '__migrations'
    `);
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should have all core geographic tables', async () => {
      const coreTables = [
        'areas',
        'estates',
        'demographics'
      ];

      for (const tableName of coreTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have market intelligence tables', async () => {
      const intelligenceTables = [
        'service_providers',
        'service_offerings',
        'provider_coverage',
        'market_share_data',
        'competitive_benchmarking'
      ];

      for (const tableName of intelligenceTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have customer intelligence tables', async () => {
      const customerTables = [
        'customer_profiles',
        'usage_patterns',
        'customer_feedback',
        'churn_risk_indicators',
      ];

      for (const tableName of customerTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have infrastructure tables', async () => {
      const infrastructureTables = [
        'network_infrastructure',
        'service_quality_metrics',
      ];

      for (const tableName of infrastructureTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have financial tables', async () => {
      const financialTables = [
        'cross_platform_revenue',
        'market_opportunities',
      ];

      for (const tableName of financialTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have business ecosystem tables', async () => {
      const businessTables = [
        'local_businesses',
      ];

      for (const tableName of businessTables) {
        const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = $1
      `, [tableName]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Seeding', () => {
    test('should have seeded areas data with Nigerian states', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM areas');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(10);

      const areas = await pool.query('SELECT name, state FROM areas LIMIT 5');
      expect(areas.rows.length).toBeGreaterThan(0);
      expect(areas.rows.some(row => ['Lagos', 'Abuja', 'Rivers'].includes(row.state))).toBe(true);
    });

    test('should have seeded estates with proper tiers', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM estates');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(15);

      const tiers = await pool.query(`
      SELECT DISTINCT tier
      FROM estates
    `);
      const tierTypes = tiers.rows.map(row => row.tier);
      expect(tierTypes).toContain('platinum');
      expect(tierTypes).toContain('gold');
      expect(tierTypes).toContain('silver');
      expect(tierTypes).toContain('bronze');
    });

    test('should have seeded service providers', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM service_providers');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(5);

      const providers = await pool.query('SELECT name FROM service_providers');
      const providerNames = providers.rows.map(row => row.name);
      expect(providerNames).toContain('MTN Nigeria');
      expect(providerNames).toContain('Airtel Nigeria');
    });

    test('should have seeded customer profiles', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM customer_profiles');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(50);

      const profiles = await pool.query('SELECT customer_type FROM customer_profiles LIMIT 5');
      expect(profiles.rows.length).toBeGreaterThan(0);
      expect(profiles.rows.some(row => ['residential', 'business'].includes(row.customer_type))).toBe(true);
    });

    test('should have seeded local businesses', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM local_businesses');
      const count = parseInt(result.rows[0].count);
      expect(count).toBeGreaterThanOrEqual(20);

      const businesses = await pool.query('SELECT business_type FROM local_businesses LIMIT 5');
      expect(businesses.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Index Installation', () => {
    test('should have primary key indexes', async () => {
      const tables = ['areas', 'estates', 'service_providers', 'customer_profiles', 'local_businesses'];

      for (const table of tables) {
        const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = $1 AND indexname LIKE '%_pkey'
      `, [table]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have foreign key indexes', async () => {
      const foreignKeyIndexes = [
        { table: 'estates', column: 'area_id' },
        { table: 'demographics', column: 'estate_id' },
        { table: 'local_businesses', column: 'estate_id' },
        { table: 'customer_profiles', column: 'estate_id' },
        { table: 'service_offerings', column: 'provider_id' }
      ];

      for (const { table, column } of foreignKeyIndexes) {
        const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = $1 AND indexdef LIKE '%' || $2 || '%'
      `, [table, column]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    // test('should have spatial indexes for geometry columns', async () => {
    //   const spatialTables = ['areas', 'estates', 'local_businesses', 'network_infrastructure'];

    //   for (const table of spatialTables) {
    //     const result = await pool.query(`
    //     SELECT indexname
    //     FROM pg_indexes
    //     WHERE tablename = $1 AND indexdef LIKE '%gist%'
    //   `, [table]);
    //     expect(result.rows.length).toBeGreaterThan(0);
    //   }
    // });

    // test('should have JSONB indexes for metadata columns', async () => {
    //   const jsonbTables = [
    //     { table: 'estates', column: 'economic_indicators' },
    //     { table: 'local_businesses', column: 'business_metrics' },
    //     { table: 'customer_profiles', column: 'preferences' }
    //   ];

    //   for (const { table, column } of jsonbTables) {
    //     const result = await pool.query(`
    //     SELECT indexname
    //     FROM pg_indexes
    //     WHERE tablename = $1 AND indexdef LIKE '%' || $2 || '%'
    //   `, [table, column]);
    //     expect(result.rows.length).toBeGreaterThan(0);
    //   }
    // });
  });

  describe('Constraint Installation', () => {
    test('should have proper foreign key constraints', async () => {
      const foreignKeys = [
        { table: 'estates', column: 'area_id', references: 'areas(id)' },
        { table: 'demographics', column: 'estate_id', references: 'estates(id)' },
        { table: 'local_businesses', column: 'estate_id', references: 'estates(id)' },
        { table: 'customer_profiles', column: 'estate_id', references: 'estates(id)' },
        { table: 'service_offerings', column: 'provider_id', references: 'service_providers(id)' }
      ];

      for (const { table, column } of foreignKeys) {
        const result = await pool.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 
          AND kcu.column_name = $2
          AND tc.constraint_type = 'FOREIGN KEY'
      `, [table, column]);
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have enum constraints', async () => {
      const enumColumns = [
        { table: 'estates', column: 'tier' },
        { table: 'service_providers', column: 'status' },
        { table: 'customer_profiles', column: 'status' },
        { table: 'local_businesses', column: 'status' }
      ];

      for (const { table, column } of enumColumns) {
        const result = await pool.query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
        expect(result.rows[0].data_type).toBe('USER-DEFINED');
      }
    });
  });

  describe('System Health', () => {
    test('should have no orphaned records', async () => {
      const relationships = [
        { child: 'estates', parent: 'areas', fk: 'area_id' },
        { child: 'demographics', parent: 'estates', fk: 'estate_id' },
        { child: 'local_businesses', parent: 'estates', fk: 'estate_id' },
        { child: 'customer_profiles', parent: 'estates', fk: 'estate_id' }
      ];

      for (const { child, parent, fk } of relationships) {
        const result = await pool.query(`
        SELECT COUNT(*) as orphaned_count
        FROM ${child} c
        LEFT JOIN ${parent} p ON c.${fk} = p.id
        WHERE p.id IS NULL
      `);
        const orphanedCount = parseInt(result.rows[0].orphaned_count);
        expect(orphanedCount).toBe(0);
      }
    });

    test('should have consistent data types', async () => {
      const numericColumns = [
        { table: 'estates', column: 'unit_count', expected: 'integer' },
        { table: 'demographics', column: 'total_population', expected: 'integer' },
        { table: 'demographics', column: 'avg_household_income', expected: 'numeric' },
        { table: 'market_share_data', column: 'market_share_percentage', expected: 'numeric' }
      ];

      for (const { table, column, expected } of numericColumns) {
        const result = await pool.query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
        expect(result.rows[0].data_type).toBe(expected);
      }
    });

    test('should have proper timestamps', async () => {
      const tables = ['estates', 'service_providers', 'customer_profiles', 'local_businesses'];

      for (const table of tables) {
        const result = await pool.query(`
        SELECT 
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_name = $1 
          AND column_name IN ('created_at', 'updated_at')
      `, [table]);
        expect(result.rows.length).toBe(2);
        result.rows.forEach(row => {
          expect(row.data_type).toContain('timestamp');
        });
      }
    });

    test('should have valid geometry data', async () => {
      const geometryTables = [
        { table: 'areas', column: 'geometry' },
        { table: 'estates', column: 'geometry' },
        { table: 'local_businesses', column: 'location' }
      ];

      for (const { table, column } of geometryTables) {
        const result = await pool.query(`
        SELECT COUNT(*) as valid_count
        FROM ${table}
        WHERE ST_IsValid(${column}) = true
      `);
        const validCount = parseInt(result.rows[0].valid_count);
        expect(validCount).toBeGreaterThan(0);
      }
    });
  });
});
