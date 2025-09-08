import { pool } from '../utils/index.js';

/**
 * Migration Testing Suite for Market Intelligence Database
 * Tests database migration system and schema updates
 */
describe('Database Migration Tests - Market Intelligence Schema', () => {
  beforeAll(async () => {
    // Test database connection before running tests
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful:', result.rows[0].now);
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Migration System', () => {
    test('should have migrations table', async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_name = '__migrations'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].table_name).toBe('__migrations');
    });

    test('should track migration history', async () => {
      const result = await pool.query(`
        SELECT 
          id,
          name,
          applied_at,
          checksum
        FROM __migrations
        ORDER BY id
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check that migrations have proper structure
      result.rows.forEach(row => {
        expect(row.id).toBeDefined();
        expect(row.name).toBeDefined();
        expect(row.applied_at).toBeDefined();
        expect(row.checksum).toBeDefined();
      });
    });
  });

  describe('Schema Migration Validation', () => {
    test('should have all required core tables', async () => {
      const requiredTables = [
        'areas',
        'estates',
        'demographics'
      ];

      for (const tableName of requiredTables) {
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

    test('should have proper enum types', async () => {
      const requiredEnums = [
        'estate_tier',
        'provider_status',
        'service_quality',
        'business_status',
        'customer_status',
        'satisfaction_level',
        'service_category',
        'infrastructure_type',
        'infrastructure_status'
      ];

      for (const enumName of requiredEnums) {
        const result = await pool.query(`
          SELECT typname
          FROM pg_type
          WHERE typtype = 'e' AND typname = $1
        `, [enumName]);
        
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Migration Validation', () => {
    test('should have seeded data in core tables', async () => {
      const coreTables = [
        { table: 'areas', minCount: 10 },
        { table: 'estates', minCount: 15 },
        { table: 'demographics', minCount: 15 }
      ];

      for (const { table, minCount } of coreTables) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        
        expect(count).toBeGreaterThanOrEqual(minCount);
      }
    });

    test('should have Nigerian market data', async () => {
      // Check areas have Nigerian states
      const result = await pool.query(`
        SELECT DISTINCT state
        FROM areas
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows.some(row => ['Lagos', 'Abuja', 'Rivers'].includes(row.state))).toBe(true);
    });

    test('should have proper estate tiers', async () => {
      const result = await pool.query(`
        SELECT DISTINCT tier
        FROM estates
      `);
      
      const tiers = result.rows.map(row => row.tier);
      expect(tiers).toContain('platinum');
      expect(tiers).toContain('gold');
      expect(tiers).toContain('silver');
      expect(tiers).toContain('bronze');
    });

    test('should have Nigerian service providers', async () => {
      const result = await pool.query(`
        SELECT name FROM service_providers
      `);
      
      const providerNames = result.rows.map(row => row.name);
      expect(providerNames).toContain('MTN Nigeria');
      expect(providerNames).toContain('Airtel Nigeria');
    });
  });

  describe('Constraint Migration Validation', () => {
    test('should have proper foreign key constraints', async () => {
      const foreignKeyRelations = [
        { table: 'estates', column: 'area_id', references: 'areas(id)' },
        { table: 'demographics', column: 'estate_id', references: 'estates(id)' },
        { table: 'local_businesses', column: 'estate_id', references: 'estates(id)' },
        { table: 'customer_profiles', column: 'estate_id', references: 'estates(id)' },
        { table: 'service_offerings', column: 'provider_id', references: 'service_providers(id)' },
        { table: 'provider_coverage', column: 'provider_id', references: 'service_providers(id)' },
        { table: 'provider_coverage', column: 'estate_id', references: 'estates(id)' },
        { table: 'market_share_data', column: 'provider_id', references: 'service_providers(id)' },
        { table: 'market_share_data', column: 'estate_id', references: 'estates(id)' }
      ];

      for (const { table, column } of foreignKeyRelations) {
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

    test('should have unique constraints', async () => {
      const uniqueConstraints = [
        { table: 'demographics', constraint: 'demographics_unique' },
        { table: 'provider_coverage', constraint: 'provider_coverage_unique' },
        { table: 'market_share_data', constraint: 'market_share_unique' },
        { table: 'competitive_benchmarking', constraint: 'competitive_benchmarking_unique' }
      ];

      for (const { table, constraint } of uniqueConstraints) {
        const result = await pool.query(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_name = $1 AND constraint_name = $2
        `, [table, constraint]);
        
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Index Migration Validation', () => {
    test('should have performance indexes', async () => {
      const requiredIndexes = [
        { table: 'estates', pattern: 'idx_estates_area_id' },
        { table: 'estates', pattern: 'idx_estates_geometry' },
        { table: 'demographics', pattern: 'idx_demographics_estate_id' },
        { table: 'service_providers', pattern: 'idx_service_providers_metadata' },
        { table: 'local_businesses', pattern: 'idx_local_businesses_estate' },
        { table: 'customer_profiles', pattern: 'idx_customer_profiles_estate' }
      ];

      for (const { table, pattern } of requiredIndexes) {
        const result = await pool.query(`
          SELECT indexname
          FROM pg_indexes
          WHERE tablename = $1 AND indexname LIKE $2
        `, [table, pattern]);
        
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    // test('should have spatial indexes for PostGIS', async () => {
    //   const spatialTables = ['areas', 'estates', 'local_businesses', 'network_infrastructure'];

    //   for (const table of spatialTables) {
    //     const result = await pool.query(`
    //       SELECT indexname
    //       FROM pg_indexes
    //       WHERE tablename = $1 AND indexdef LIKE '%gist%'
    //     `, [table]);
        
    //     expect(result.rows.length).toBeGreaterThan(0);
    //   }
    // });

    // test('should have JSONB indexes for metadata', async () => {
    //   const jsonbIndexes = [
    //     { table: 'estates', pattern: 'economic_indicators' },
    //     { table: 'local_businesses', pattern: 'business_metrics' },
    //     { table: 'customer_profiles', pattern: 'preferences' }
    //   ];

    //   for (const { table, pattern } of jsonbIndexes) {
    //     const result = await pool.query(`
    //       SELECT indexname
    //       FROM pg_indexes
    //       WHERE tablename = $1 AND indexdef LIKE '%' || $2 || '%'
    //     `, [table, pattern]);
        
    //     expect(result.rows.length).toBeGreaterThan(0);
    //   }
    // });
  });

  describe('Migration Rollback Safety', () => {
    test('should maintain data integrity after migrations', async () => {
      // Check that foreign key relationships are intact
      const relationships = [
        { child: 'estates', parent: 'areas', fk: 'area_id' },
        { child: 'demographics', parent: 'estates', fk: 'estate_id' },
        { child: 'local_businesses', parent: 'estates', fk: 'estate_id' },
        { child: 'customer_profiles', parent: 'estates', fk: 'estate_id' }
      ];

      for (const { child, parent, fk } of relationships) {
        const result = await pool.query(`
          SELECT COUNT(*) as orphaned_records
          FROM ${child} c
          LEFT JOIN ${parent} p ON c.${fk} = p.id
          WHERE p.id IS NULL
        `);
        
        const orphanedCount = parseInt(result.rows[0].orphaned_records);
        expect(orphanedCount).toBe(0);
      }
    });

    test('should have consistent data types', async () => {
      const numericColumns = [
        { table: 'estates', column: 'unit_count', expected: 'integer' },
        { table: 'demographics', column: 'total_population', expected: 'integer' },
        { table: 'demographics', column: 'avg_household_income', expected: 'numeric' },
        { table: 'market_share_data', column: 'market_share_percentage', expected: 'numeric' },
        { table: 'cross_platform_revenue', column: 'revenue', expected: 'numeric' }
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

  describe('Materialized View Validation', () => {
    test('should have estate analytics materialized view', async () => {
      const result = await pool.query(`
        SELECT matviewname
        FROM pg_matviews
        WHERE matviewname = 'estate_analytics'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });

    // test('should have data in materialized view', async () => {
    //   const result = await pool.query(`
    //     SELECT COUNT(*) FROM estate_analytics
    //   `);
      
    //   const count = parseInt(result.rows[0].count);
    //   expect(count).toBeGreaterThan(0);
    // });
  });
});