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
      
      expect(result.rows[0].current_database()).toBe('market_db');
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
        WHERE table_name = 'migrations'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should have all core business tables', async () => {
      const coreTables = [
        'products',
        'areas',
        'estates',
        'estate_units',
        'price_trends'
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

    test('should have extended intelligence tables', async () => {
      const extendedTables = [
        'service_providers',
        'business_categories',
        'local_businesses',
        'customer_profiles',
        'network_infrastructure'
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
  });

  describe('Data Seeding', () => {
    test('should have seeded products data', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM products');
      const count = parseInt(result.rows[0].count);
      
      expect(count).toBeGreaterThanOrEqual(4);
      
      // Check specific products
      const products = await pool.query('SELECT name FROM products');
      const productNames = products.rows.map(row => row.name);
      
      expect(productNames).toContain('MDU Data Collection Service');
      expect(productNames).toContain('Residential Internet Service');
      expect(productNames).toContain('Business Internet Solutions');
      expect(productNames).toContain('Smart Home Integration');
    });

    test('should have seeded areas data', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM areas');
      const count = parseInt(result.rows[0].count);
      
      expect(count).toBeGreaterThanOrEqual(12);
      
      // Check for Nigerian areas
      const areas = await pool.query('SELECT name, state FROM areas LIMIT 5');
      expect(areas.rows.length).toBeGreaterThan(0);
      expect(areas.rows.some(row => row.state === 'FCT')).toBe(true);
    });

    test('should have seeded estates data', async () => {
      const result = await pool.query('SELECT COUNT(*) FROM estates');
      const count = parseInt(result.rows[0].count);
      
      expect(count).toBeGreaterThanOrEqual(30);
      
      // Check estate classifications
      const classifications = await pool.query(`
        SELECT DISTINCT classification
        FROM estates
      `);
      
      const classTypes = classifications.rows.map(row => row.classification);
      expect(classTypes).toContain('luxury');
      expect(classTypes).toContain('middle_income');
      expect(classTypes).toContain('low_income');
    });

    test('should have realistic estate data', async () => {
      const result = await pool.query(`
        SELECT 
          e.name,
          e.classification,
          e.unit_count,
          a.name as area_name
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check data quality
      result.rows.forEach(row => {
        expect(row.name).toBeDefined();
        expect(row.classification).toBeDefined();
        expect(row.unit_count).toBeGreaterThan(0);
        expect(row.area_name).toBeDefined();
      });
    });
  });

  describe('Index Installation', () => {
    test('should have primary key indexes', async () => {
      const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
      
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
        { table: 'estates', column: 'product_id' },
        { table: 'estate_units', column: 'estate_id' }
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

    test('should have spatial indexes', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'areas' AND indexdef LIKE '%gist%'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Constraint Installation', () => {
    test('should have proper foreign key constraints', async () => {
      const foreignKeys = [
        { table: 'estates', column: 'product_id', references: 'products(id)' },
        { table: 'estates', column: 'area_id', references: 'areas(id)' },
        { table: 'estate_units', column: 'estate_id', references: 'estates(id)' }
      ];

      for (const { table, column, references } of foreignKeys) {
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

    test('should have check constraints', async () => {
      const result = await pool.query(`
        SELECT 
          table_name,
          constraint_name,
          check_clause
        FROM information_schema.check_constraints
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Trigger Installation', () => {
    test('should have updated_at triggers', async () => {
      const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
      
      for (const table of tables) {
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

  describe('System Health', () => {
    test('should have no orphaned records', async () => {
      const result = await pool.query(`
        SELECT COUNT(*) as orphaned_count
        FROM estates e
        LEFT JOIN products p ON e.product_id = p.id
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE p.id IS NULL OR a.id IS NULL
      `);
      
      const orphanedCount = parseInt(result.rows[0].orphaned_count);
      expect(orphanedCount).toBe(0);
    });

    test('should have consistent data types', async () => {
      const result = await pool.query(`
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE column_name IN ('unit_count', 'rent_price', 'sale_price')
          AND data_type NOT IN ('integer', 'decimal', 'numeric')
      `);
      
      expect(result.rows.length).toBe(0);
    });

    test('should have proper timestamps', async () => {
      const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
      
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
  });
});
