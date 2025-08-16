import { pool } from '../utils/index.js';

/**
 * Query Performance Testing Suite
 * Tests query optimization, indexing, and performance metrics using Jest
 */
describe('Query Performance Tests', () => {
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

  describe('Basic Query Performance', () => {
    const basicQueries = [
      { name: 'Products Count', query: 'SELECT COUNT(*) FROM products' },
      { name: 'Areas Count', query: 'SELECT COUNT(*) FROM areas' },
      { name: 'Estates Count', query: 'SELECT COUNT(*) FROM estates' },
      { name: 'Estate Units Count', query: 'SELECT COUNT(*) FROM estate_units' },
      { name: 'Price Trends Count', query: 'SELECT COUNT(*) FROM price_trends' }
    ];

    test.each(basicQueries)('$name should execute in under 100ms', async ({ name, query }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      // This will FAIL if performance criteria is not met
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Join Query Performance', () => {
    const joinQueries = [
      {
        name: 'Estates with Areas',
        query: `
          SELECT e.name, a.name as area_name
          FROM estates e
          JOIN areas a ON e.area_id = a.id
          LIMIT 100
        `,
        maxDuration: 200
      },
      {
        name: 'Estates with Products',
        query: `
          SELECT e.name, p.name as product_name
          FROM estates e
          JOIN products p ON e.product_id = p.id
          LIMIT 100
        `,
        maxDuration: 200
      },
      {
        name: 'Estate Units with Estates',
        query: `
          SELECT eu.unit_type, e.name as estate_name
          FROM estate_units eu
          JOIN estates e ON eu.estate_id = e.id
          LIMIT 100
        `,
        maxDuration: 200
      }
    ];

    test.each(joinQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      // This will FAIL if performance criteria is not met
      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Aggregation Query Performance', () => {
    const aggregationQueries = [
      {
        name: 'Estate Classification Distribution',
        query: `
          SELECT 
            classification,
            COUNT(*) as count,
            AVG(unit_count) as avg_units
          FROM estates
          GROUP BY classification
        `,
        maxDuration: 500
      },
      {
        name: 'Price Trends by Area',
        query: `
          SELECT 
            a.name as area_name,
            COUNT(pt.id) as trend_count,
            AVG(pt.price) as avg_price
          FROM price_trends pt
          JOIN areas a ON pt.area_id = a.id
          GROUP BY a.id, a.name
        `,
        maxDuration: 500
      },
      {
        name: 'Unit Status Summary',
        query: `
          SELECT 
            status,
            COUNT(*) as count,
            AVG(CASE WHEN rent_price IS NOT NULL THEN rent_price END) as avg_rent
          FROM estate_units
          GROUP BY status
        `,
        maxDuration: 500
      }
    ];

    test.each(aggregationQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      // This will FAIL if performance criteria is not met
      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Complex Query Performance', () => {
    const complexQueries = [
      {
        name: 'Market Analysis Query',
        query: `
          SELECT 
            a.name as area_name,
            e.classification,
            COUNT(e.id) as estate_count,
            AVG(e.unit_count) as avg_units,
            COUNT(eu.id) as total_units,
            COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END) as occupied_units,
            ROUND(
              COUNT(CASE WHEN eu.status = 'occupied' THEN 1 END)::DECIMAL / 
              COUNT(eu.id)::DECIMAL * 100, 2
            ) as occupancy_rate
          FROM areas a
          LEFT JOIN estates e ON a.id = e.area_id
          LEFT JOIN estate_units eu ON e.id = eu.estate_id
          GROUP BY a.id, a.name, e.classification
          ORDER BY a.name, e.classification
        `,
        maxDuration: 1000
      },
      {
        name: 'Price Trend Analysis',
        query: `
          SELECT 
            p.name as product_name,
            a.name as area_name,
            pt.unit_type,
            pt.price_type,
            AVG(pt.price) as avg_price,
            MIN(pt.price) as min_price,
            MAX(pt.price) as max_price,
            COUNT(pt.id) as data_points
          FROM price_trends pt
          JOIN products p ON pt.product_id = p.id
          JOIN areas a ON pt.area_id = a.id
          WHERE pt.period >= CURRENT_DATE - INTERVAL '6 months'
          GROUP BY p.id, p.name, a.id, a.name, pt.unit_type, pt.price_type
          ORDER BY p.name, a.name, pt.unit_type
        `,
        maxDuration: 1000
      }
    ];

    test.each(complexQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      // This will FAIL if performance criteria is not met
      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Index Effectiveness', () => {
    test('should use indexes for estate classification queries', async () => {
      const result = await pool.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT * FROM estates WHERE classification = 'luxury'
      `);

      const plan = result.rows[0]['QUERY PLAN'][0];
      
      // Check if index scan is used
      expect(plan['Node Type']).toMatch(/Index Scan|Bitmap Index Scan/);
      
      // Check execution time
      expect(plan['Execution Time']).toBeLessThan(10); // Should be very fast with index
    });

    test('should use spatial indexes for geometry queries', async () => {
      const result = await pool.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT * FROM areas 
        WHERE ST_DWithin(
          geometry, 
          ST_SetSRID(ST_MakePoint(7.4916, 9.0765), 4326), 
          0.1
        )
      `);

      const plan = result.rows[0]['QUERY PLAN'][0];
      
      // Check if spatial index is used
      expect(plan['Node Type']).toMatch(/Index Scan|Bitmap Index Scan/);
    });
  });

  describe('Concurrent Query Performance', () => {
    test('should handle multiple concurrent queries efficiently', async () => {
      const queries = [
        'SELECT COUNT(*) FROM estates',
        'SELECT COUNT(*) FROM areas',
        'SELECT COUNT(*) FROM products',
        'SELECT COUNT(*) FROM estate_units',
        'SELECT COUNT(*) FROM price_trends'
      ];

      const startTime = Date.now();
      
      // Execute all queries concurrently
      const promises = queries.map(query => pool.query(query));
      await Promise.all(promises);
      
      const totalDuration = Date.now() - startTime;
      
      // Total time should be reasonable (concurrent execution)
      expect(totalDuration).toBeLessThan(500);
    });
  });

  describe('Data Volume Performance', () => {
    test('should maintain performance with realistic data volumes', async () => {
      // Test with larger result sets
      const startTime = Date.now();
      
      const result = await pool.query(`
        SELECT 
          e.name as estate_name,
          a.name as area_name,
          e.classification,
          e.unit_count,
          COUNT(eu.id) as actual_units
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        LEFT JOIN estate_units eu ON e.id = eu.estate_id
        GROUP BY e.id, e.name, a.name, e.classification, e.unit_count
        ORDER BY e.name
      `);
      
      const duration = Date.now() - startTime;
      
      // Should have data
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Should execute in reasonable time
      expect(duration).toBeLessThan(1000);
    });
  });
});
