import { pool } from '../utils/index.js';

/**
 * Schema Validation Test Suite
 * Tests all database tables, constraints, and relationships using Jest
 */
describe('Database Schema Validation', () => {
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

  describe('Core Tables Existence', () => {
    const requiredTables = [
      'products',
      'areas', 
      'estates',
      'estate_units',
      'price_trends'
    ];

    test.each(requiredTables)('should have table %s', async (tableName) => {
      const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_name = $1
      `, [tableName]);
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].table_name).toBe(tableName);
    });
  });

  describe('Table Structure Validation', () => {
    describe('products table', () => {
      test('should have correct columns with proper constraints', async () => {
        const result = await pool.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'products'
          ORDER BY ordinal_position
        `);

        const columns = result.rows.map(row => row.column_name);
        
        expect(columns).toContain('id');
        expect(columns).toContain('name');
        expect(columns).toContain('slug');
        expect(columns).toContain('description');
        expect(columns).toContain('status');
        expect(columns).toContain('created_at');
        expect(columns).toContain('updated_at');

        // Check specific constraints
        const nameColumn = result.rows.find(row => row.column_name === 'name');
        expect(nameColumn.is_nullable).toBe('NO');
        expect(nameColumn.data_type).toBe('character varying');
      });

      test('should have proper constraints and indexes', async () => {
        // Check primary key
        const pkResult = await pool.query(`
          SELECT constraint_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_name = 'products' AND constraint_type = 'PRIMARY KEY'
        `);
        expect(pkResult.rows.length).toBeGreaterThan(0);

        // Check unique constraint on slug
        const uniqueResult = await pool.query(`
          SELECT constraint_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_name = 'products' AND constraint_type = 'UNIQUE'
        `);
        expect(uniqueResult.rows.length).toBeGreaterThan(0);
      });
    });

    describe('areas table', () => {
      test('should have PostGIS geometry support', async () => {
        const result = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = 'areas' AND column_name = 'geometry'
        `);
        
        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.rows[0].data_type).toBe('USER-DEFINED');
      });

      test('should have required columns', async () => {
        const result = await pool.query(`
          SELECT column_name
          FROM information_schema.columns 
          WHERE table_name = 'areas'
        `);

        const columns = result.rows.map(row => row.column_name);
        expect(columns).toContain('id');
        expect(columns).toContain('name');
        expect(columns).toContain('state');
        expect(columns).toContain('geo_code');
        expect(columns).toContain('geometry');
      });
    });

    describe('estates table', () => {
      test('should have proper foreign key relationships', async () => {
        const result = await pool.query(`
          SELECT 
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'estates'
        `);

        expect(result.rows.length).toBeGreaterThanOrEqual(2);
        
        const foreignKeys = result.rows.map(row => ({
          column: row.column_name,
          references: `${row.foreign_table_name}.${row.foreign_column_name}`
        }));

        expect(foreignKeys).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ column: 'product_id', references: 'products.id' }),
            expect.objectContaining({ column: 'area_id', references: 'areas.id' })
          ])
        );
      });

      test('should have proper enum constraints', async () => {
        const result = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns 
          WHERE table_name = 'estates' 
            AND column_name IN ('estate_type', 'occupancy_status', 'classification')
        `);

        expect(result.rows.length).toBe(3);
        
        result.rows.forEach(row => {
          expect(row.data_type).toBe('USER-DEFINED');
        });
      });
    });
  });

  describe('Enum Types Validation', () => {
    test('should have all required enum types', async () => {
      const result = await pool.query(`
        SELECT typname
        FROM pg_type
        WHERE typtype = 'e'
      `);

      const enumTypes = result.rows.map(row => row.typname);
      
      expect(enumTypes).toContain('product_status');
      expect(enumTypes).toContain('estate_type');
      expect(enumTypes).toContain('occupancy_status');
      expect(enumTypes).toContain('estate_classification');
      expect(enumTypes).toContain('unit_status');
      expect(enumTypes).toContain('price_type');
    });

    test('should have correct enum values for estate_classification', async () => {
      const result = await pool.query(`
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'estate_classification')
        ORDER BY enumsortorder
      `);

      const values = result.rows.map(row => row.enumlabel);
      expect(values).toEqual(['luxury', 'middle_income', 'low_income']);
    });
  });

  describe('Indexes Validation', () => {
    test('should have proper indexes on foreign keys', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'estates'
      `);

      const indexNames = result.rows.map(row => row.indexname);
      
      // Should have indexes on foreign key columns
      expect(indexNames.some(name => name.includes('product_id'))).toBe(true);
      expect(indexNames.some(name => name.includes('area_id'))).toBe(true);
    });

    test('should have spatial indexes for PostGIS data', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'areas' AND indexdef LIKE '%gist%'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Triggers Validation', () => {
    test('should have updated_at triggers on all tables', async () => {
      const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
      
      for (const table of tables) {
        const result = await pool.query(`
          SELECT trigger_name, event_manipulation
          FROM information_schema.triggers
          WHERE event_object_table = $1
            AND trigger_name LIKE '%updated_at%'
        `, [table]);

        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.rows[0].event_manipulation).toBe('UPDATE');
      }
    });
  });

  describe('Data Integrity', () => {
    test('should have data in all core tables', async () => {
      const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
      
      for (const table of tables) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        
        expect(count).toBeGreaterThan(0);
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    test('should maintain referential integrity', async () => {
      // Test that all estates have valid product_id and area_id
      const result = await pool.query(`
        SELECT COUNT(*) as invalid_count
        FROM estates e
        LEFT JOIN products p ON e.product_id = p.id
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE p.id IS NULL OR a.id IS NULL
      `);

      const invalidCount = parseInt(result.rows[0].invalid_count);
      expect(invalidCount).toBe(0);
    });
  });
});
