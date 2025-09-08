import { pool } from '../utils/index.js';

/**
 * Query Performance Testing Suite for Market Intelligence Database
 * Tests query optimization, indexing, and performance metrics
 */
describe('Query Performance Tests - Market Intelligence Schema', () => {
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

  describe('Basic Query Performance', () => {
    const basicQueries = [
      { name: 'Areas Count', query: 'SELECT COUNT(id) FROM areas', maxDuration: 50 },
      { name: 'Estates Count', query: 'SELECT COUNT(id) FROM estates', maxDuration: 50 },
      { name: 'Service Providers Count', query: 'SELECT COUNT(id) FROM service_providers', maxDuration: 50 },
      { name: 'Customer Profiles Count', query: 'SELECT COUNT(id) FROM customer_profiles', maxDuration: 50 },
      { name: 'Local Businesses Count', query: 'SELECT COUNT(id) FROM local_businesses', maxDuration: 50 }
    ];

    test.each(basicQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Join Query Performance', () => {
    const joinQueries = [
      {
        name: 'Estates with Areas',
        query: `
          SELECT e.name, a.name as area_name, e.tier
          FROM estates e
          JOIN areas a ON e.area_id = a.id
          LIMIT 100
        `,
        maxDuration: 150
      },
      {
        name: 'Service Offerings with Providers',
        query: `
          SELECT so.name, sp.name as provider_name, so.price
          FROM service_offerings so
          JOIN service_providers sp ON so.provider_id = sp.id
          LIMIT 100
        `,
        maxDuration: 150
      },
      {
        name: 'Local Businesses with Estates',
        query: `
          SELECT lb.name, e.name as estate_name, lb.business_type
          FROM local_businesses lb
          JOIN estates e ON lb.estate_id = e.id
          LIMIT 100
        `,
        maxDuration: 150
      },
      {
        name: 'Customer Profiles with Estates',
        query: `
          SELECT cp.customer_type, e.name as estate_name, cp.income_bracket
          FROM customer_profiles cp
          JOIN estates e ON cp.estate_id = e.id
          LIMIT 100
        `,
        maxDuration: 150
      }
    ];

    test.each(joinQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Aggregation Query Performance', () => {
    const aggregationQueries = [
      {
        name: 'Estate Tier Distribution',
        query: `
          SELECT 
            tier,
            COUNT(*) as count,
            AVG(unit_count) as avg_units
          FROM estates
          GROUP BY tier
        `,
        maxDuration: 200
      },
      {
        name: 'Market Share by Provider',
        query: `
          SELECT 
            sp.name as provider,
            AVG(ms.market_share_percentage) as avg_market_share,
            SUM(ms.total_customers) as total_customers
          FROM market_share_data ms
          JOIN service_providers sp ON ms.provider_id = sp.id
          WHERE ms.period = (SELECT MAX(period) FROM market_share_data)
          GROUP BY sp.name
        `,
        maxDuration: 300
      },
      {
        name: 'Revenue by Service Category',
        query: `
          SELECT 
            service_category,
            SUM(revenue) as total_revenue,
            SUM(customer_count) as total_customers
          FROM cross_platform_revenue
          WHERE period = (SELECT MAX(period) FROM cross_platform_revenue)
          GROUP BY service_category
        `,
        maxDuration: 250
      },
      {
        name: 'Customer Demographics',
        query: `
          SELECT 
            age_bracket,
            income_bracket,
            COUNT(*) as customer_count
          FROM customer_profiles
          GROUP BY age_bracket, income_bracket
        `,
        maxDuration: 200
      }
    ];

    test.each(aggregationQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Complex Query Performance', () => {
    const complexQueries = [
      {
        name: 'Market Intelligence Dashboard',
        query: `
          SELECT 
            e.name as estate_name,
            e.tier,
            d.total_population,
            d.avg_household_income,
            COUNT(DISTINCT lb.id) as business_count,
            COUNT(DISTINCT cp.id) as customer_count,
            COALESCE(ms.market_share_percentage, 0) as market_share
          FROM estates e
          JOIN demographics d ON e.id = d.estate_id
          LEFT JOIN local_businesses lb ON e.id = lb.estate_id
          LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
          LEFT JOIN market_share_data ms ON e.id = ms.estate_id 
            AND ms.period = (SELECT MAX(period) FROM market_share_data)
          GROUP BY e.id, e.name, e.tier, d.total_population, d.avg_household_income, ms.market_share_percentage
          ORDER BY e.tier, e.name
        `,
        maxDuration: 800
      },
      {
        name: 'Service Quality Analysis',
        query: `
          SELECT 
            e.name as estate_name,
            sqm.service_type,
            AVG(sqm.uptime_percentage) as avg_uptime,
            AVG(sqm.avg_response_time) as avg_response_time,
            AVG(sqm.customer_satisfaction_score) as avg_satisfaction
          FROM service_quality_metrics sqm
          JOIN estates e ON sqm.estate_id = e.id
          WHERE sqm.period >= CURRENT_DATE - INTERVAL '3 months'
          GROUP BY e.id, e.name, sqm.service_type
          ORDER BY e.name, sqm.service_type
        `,
        maxDuration: 600
      },
      {
        name: 'Competitive Benchmarking',
        query: `
          SELECT 
            sp1.name as our_provider,
            sp2.name as competitor,
            AVG(cb.price_difference) as avg_price_diff,
            AVG(cb.market_positioning_score) as positioning_score
          FROM competitive_benchmarking cb
          JOIN service_offerings so1 ON cb.our_service_id = so1.id
          JOIN service_providers sp1 ON so1.provider_id = sp1.id
          JOIN service_offerings so2 ON cb.competitor_service_id = so2.id
          JOIN service_providers sp2 ON so2.provider_id = sp2.id
          GROUP BY sp1.name, sp2.name
          ORDER BY sp1.name, sp2.name
        `,
        maxDuration: 700
      }
    ];

    test.each(complexQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Spatial Query Performance', () => {
    const spatialQueries = [
      {
        name: 'Nearby Estates Query',
        query: `
          SELECT 
            e1.name,
            e1.tier,
            ST_Distance(
              e1.geometry,
              ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)
            ) as distance_meters
          FROM estates e1
          WHERE ST_DWithin(
            e1.geometry,
            ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326),
            0.1
          )
          ORDER BY distance_meters
          LIMIT 20
        `,
        maxDuration: 300
      },
      {
        name: 'Area Coverage Analysis',
        query: `
          SELECT 
            a.name as area_name,
            COUNT(e.id) as estate_count,
            SUM(e.unit_count) as total_units
          FROM areas a
          LEFT JOIN estates e ON a.id = e.area_id
          WHERE ST_Intersects(
            a.geometry,
            ST_MakeEnvelope(3.3, 6.4, 3.5, 6.6, 4326)
          )
          GROUP BY a.id, a.name
        `,
        maxDuration: 400
      }
    ];

    test.each(spatialQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('JSONB Query Performance', () => {
    const jsonbQueries = [
      {
        name: 'Economic Indicators Analysis',
        query: `
          SELECT 
            tier,
            AVG((economic_indicators->>'property_value')::numeric) as avg_property_value,
            AVG((economic_indicators->>'average_rent')::numeric) as avg_rent
          FROM estates
          WHERE economic_indicators IS NOT NULL
          GROUP BY tier
        `,
        maxDuration: 250
      },
      {
        name: 'Business Metrics Analysis',
        query: `
          SELECT 
            business_type,
            AVG((business_metrics->>'monthly_revenue')::numeric) as avg_revenue,
            AVG((business_metrics->>'employee_count')::numeric) as avg_employees
          FROM local_businesses
          WHERE business_metrics IS NOT NULL
          GROUP BY business_type
        `,
        maxDuration: 250
      }
    ];

    test.each(jsonbQueries)('$name should execute in under $maxDuration ms', async ({ name, query, maxDuration }) => {
      const startTime = Date.now();
      await pool.query(query);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(maxDuration);
    });
  });

  describe('Concurrent Query Performance', () => {
    test('should handle multiple concurrent queries efficiently', async () => {
      const queries = [
        'SELECT COUNT(*) FROM estates',
        'SELECT COUNT(*) FROM service_providers',
        'SELECT COUNT(*) FROM customer_profiles',
        'SELECT COUNT(*) FROM local_businesses',
        'SELECT COUNT(*) FROM market_share_data'
      ];

      const startTime = Date.now();
      
      // Execute all queries concurrently
      const promises = queries.map(query => pool.query(query));
      const results = await Promise.all(promises);
      
      const totalDuration = Date.now() - startTime;
      
      // Verify all queries returned results
      results.forEach((result, index) => {
        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBeGreaterThan(0);
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
      });
      
      // Total time should be reasonable
      expect(totalDuration).toBeLessThan(1000);
      
      console.log(`Concurrent queries completed in ${totalDuration}ms`);
    });
  });

  describe('Data Volume Performance', () => {
    test('should maintain performance with market intelligence data volumes', async () => {
      const startTime = Date.now();
      
      const result = await pool.query(`
        SELECT 
          e.name as estate_name,
          e.tier,
          a.name as area_name,
          d.total_population,
          d.avg_household_income,
          COUNT(DISTINCT lb.id) as business_count,
          COUNT(DISTINCT cp.id) as customer_count,
          COALESCE(AVG(sqm.uptime_percentage), 0) as avg_uptime
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        JOIN demographics d ON e.id = d.estate_id
        LEFT JOIN local_businesses lb ON e.id = lb.estate_id
        LEFT JOIN customer_profiles cp ON e.id = cp.estate_id
        LEFT JOIN service_quality_metrics sqm ON e.id = sqm.estate_id
        GROUP BY e.id, e.name, e.tier, a.name, d.total_population, d.avg_household_income
        ORDER BY e.tier, e.name
      `);
      
      const duration = Date.now() - startTime;
      
      // Should have data
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Should execute in reasonable time
      expect(duration).toBeLessThan(1500);
      
      console.log(`Complex market intelligence query completed in ${duration}ms with ${result.rows.length} rows`);
    });
  });

  // describe('Materialized View Performance', () => {
  //   test('should have fast access to estate analytics view', async () => {
  //     const startTime = Date.now();
      
  //     const result = await pool.query(`
  //       SELECT 
  //         estate_name,
  //         tier,
  //         total_population,
  //         market_share_percentage,
  //         total_revenue
  //       FROM estate_analytics
  //       ORDER BY total_revenue DESC
  //       LIMIT 20
  //     `);
      
  //     const duration = Date.now() - startTime;
      
  //     // Should have data
  //     expect(result.rows.length).toBeGreaterThan(0);
      
  //     // Materialized view should be very fast
  //     expect(duration).toBeLessThan(100);
      
  //     console.log(`Materialized view query completed in ${duration}ms`);
  //   });
  // });
});