import { pool } from '../utils/index.js';

/**
 * Migration Testing Suite
 * Tests database migration system and schema updates using Jest
 */
describe('Database Migration Tests', () => {
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

  describe('Migration System', () => {
    test('should have migrations table', async () => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_name = 'migrations'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].table_name).toBe('migrations');
    });

    test('should track migration history', async () => {
      const result = await pool.query(`
        SELECT 
          id,
          name,
          executed_at,
          checksum
        FROM migrations
        ORDER BY id
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check that migrations have proper structure
      result.rows.forEach(row => {
        expect(row.id).toBeDefined();
        expect(row.name).toBeDefined();
        expect(row.executed_at).toBeDefined();
        expect(row.checksum).toBeDefined();
      });
    });
  });

  describe('Schema Migration Validation', () => {
    test('should have all required base tables', async () => {
      const requiredTables = [
        'products',
        'areas',
        'estates',
        'estate_units',
        'price_trends'
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

    test('should have extended intelligence tables', async () => {
      const extendedTables = [
        'service_providers',
        'provider_coverage',
        'service_offerings',
        'market_share_data',
        'business_categories',
        'local_businesses',
        'customer_profiles',
        'usage_patterns',
        'customer_feedback',
        'network_infrastructure',
        'capacity_metrics',
        'demographics',
        'revenue_analytics',
        'market_opportunities'
      ];

      for (const tableName of extendedTables) {
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
        'product_status',
        'estate_type',
        'occupancy_status',
        'estate_classification',
        'unit_status',
        'price_type'
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
        { table: 'products', minCount: 4 },
        { table: 'areas', minCount: 12 },
        { table: 'estates', minCount: 30 },
        { table: 'estate_units', minCount: 100 },
        { table: 'price_trends', minCount: 150 }
      ];

      for (const { table, minCount } of coreTables) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        
        expect(count).toBeGreaterThanOrEqual(minCount);
      }
    });

    test('should have realistic Nigerian data', async () => {
      // Check areas have Nigerian state
      const result = await pool.query(`
        SELECT DISTINCT state
        FROM areas
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows.some(row => row.state === 'FCT')).toBe(true);
    });

    test('should have proper estate classifications', async () => {
      const result = await pool.query(`
        SELECT DISTINCT classification
        FROM estates
      `);
      
      const classifications = result.rows.map(row => row.classification);
      expect(classifications).toContain('luxury');
      expect(classifications).toContain('middle_income');
      expect(classifications).toContain('low_income');
    });
  });

  describe('Constraint Migration Validation', () => {
    test('should have proper foreign key constraints', async () => {
      const foreignKeyTables = [
        { table: 'estates', columns: ['product_id', 'area_id'] },
        { table: 'estate_units', columns: ['estate_id'] },
        { table: 'price_trends', columns: ['product_id', 'area_id'] }
      ];

      for (const { table, columns } of foreignKeyTables) {
        for (const column of columns) {
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
      }
    });

    test('should have proper check constraints', async () => {
      // Check price constraints
      const result = await pool.query(`
        SELECT 
          constraint_name,
          check_clause
        FROM information_schema.check_constraints
        WHERE constraint_name LIKE '%price%'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Index Migration Validation', () => {
    test('should have performance indexes', async () => {
      const requiredIndexes = [
        { table: 'estates', columns: ['area_id', 'classification'] },
        { table: 'estate_units', columns: ['estate_id', 'status'] },
        { table: 'price_trends', columns: ['area_id', 'unit_type', 'period'] }
      ];

      for (const { table, columns } of requiredIndexes) {
        const result = await pool.query(`
          SELECT indexname
          FROM pg_indexes
          WHERE tablename = $1
        `, [table]);
        
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });

    test('should have spatial indexes for PostGIS', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'areas' 
          AND indexdef LIKE '%gist%'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Trigger Migration Validation', () => {
    test('should have updated_at triggers', async () => {
      const tablesWithTriggers = [
        'products',
        'areas',
        'estates',
        'estate_units',
        'price_trends'
      ];

      for (const table of tablesWithTriggers) {
        const result = await pool.query(`
          SELECT trigger_name
          FROM information_schema.triggers
          WHERE event_object_table = $1
            AND trigger_name LIKE '%updated_at%'
        `, [table]);
        
        expect(result.rows.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Migration Rollback Safety', () => {
    test('should maintain data integrity after migrations', async () => {
      // Check that foreign key relationships are intact
      const result = await pool.query(`
        SELECT COUNT(*) as orphaned_records
        FROM estates e
        LEFT JOIN products p ON e.product_id = p.id
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE p.id IS NULL OR a.id IS NULL
      `);
      
      const orphanedCount = parseInt(result.rows[0].orphaned_records);
      expect(orphanedCount).toBe(0);
    });

    test('should have consistent data types', async () => {
      // Check that numeric fields have proper constraints
      const result = await pool.query(`
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE column_name IN ('unit_count', 'rent_price', 'sale_price', 'price')
          AND data_type NOT IN ('integer', 'decimal', 'numeric')
      `);
      
      expect(result.rows.length).toBe(0);
    });
  });
});
