import pool from '../../utils/pool.js';

describe('View Performance Tests', () => {
  let client;

  beforeAll(async () => {
    client = await pool.connect();
  });

  afterAll(async () => {
    if (client) {
      client.release();
    }
    await pool.end();
  });

  describe('Materialized View Performance', () => {
    test('should refresh materialized views efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        REFRESH MATERIALIZED VIEW market_analysis_summary
      `);
      
      const endTime = Date.now();
      const refreshTime = endTime - startTime;
      
      expect(refreshTime).toBeLessThan(5000); // Should refresh within 5 seconds
      expect(result).toBeDefined();
    });

    test('should query materialized views efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          area_name,
          tier_classification,
          estate_count,
          avg_market_potential,
          competitor_count,
          total_revenue
        FROM market_analysis_summary
        ORDER BY avg_market_potential DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(100); // Should query within 100ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use indexes on materialized views efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT * FROM market_analysis_summary
        WHERE area_name = 'Abuja Central'
        AND tier_classification = 'platinum'
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if index was used
      const explainPlan = result.rows[0]['QUERY PLAN'];
      const planText = JSON.stringify(explainPlan);
      expect(planText).toContain('Index Scan');
    });
  });

  describe('Complex View Performance', () => {
    test('should execute market intelligence summary view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_id,
          estate_name,
          tier_classification,
          market_potential_score,
          competitor_count,
          avg_market_share,
          business_count
        FROM market_intelligence_summary
        WHERE tier_classification = 'platinum'
        ORDER BY market_potential_score DESC
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify data structure
      if (result.rows.length > 0) {
        const row = result.rows[0];
        expect(row.estate_id).toBeDefined();
        expect(row.estate_name).toBeDefined();
        expect(row.tier_classification).toBe('platinum');
        expect(parseFloat(row.market_potential_score)).toBeGreaterThan(0);
      }
    });

    test('should execute competitive landscape analysis view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          area_name,
          total_providers,
          total_estates,
          avg_market_potential,
          total_market_share
        FROM competitive_landscape_analysis
        ORDER BY total_estates DESC
        LIMIT 15
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify data structure
      if (result.rows.length > 0) {
        const row = result.rows[0];
        expect(row.area_name).toBeDefined();
        expect(parseInt(row.total_estates)).toBeGreaterThan(0);
        expect(parseFloat(row.avg_market_potential)).toBeGreaterThan(0);
      }
    });

    test('should execute customer segmentation analysis view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          tier_classification,
          customer_count,
          avg_data_usage,
          avg_satisfaction_rating,
          services_adopted
        FROM customer_segmentation_analysis
        ORDER BY customer_count DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify data structure
      if (result.rows.length > 0) {
        const row = result.rows[0];
        expect(row.tier_classification).toBeDefined();
        expect(parseInt(row.customer_count)).toBeGreaterThan(0);
      }
    });
  });

  describe('Infrastructure Intelligence Views', () => {
    test('should execute infrastructure performance metrics view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_name,
          infrastructure_type,
          coverage_quality,
          utilization_rate,
          customer_satisfaction
        FROM infrastructure_performance_metrics
        WHERE coverage_quality = 'excellent'
        ORDER BY utilization_rate DESC
        LIMIT 15
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should execute network coverage analysis view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_name,
          infrastructure_type,
          coverage_quality,
          capacity
        FROM network_coverage_analysis
        ORDER BY coverage_quality DESC, capacity DESC
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Financial Intelligence Views', () => {
    test('should execute financial performance dashboard view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          tier_classification,
          total_revenue,
          total_investment,
          net_profit,
          avg_roi,
          opportunity_count
        FROM financial_performance_dashboard
        ORDER BY net_profit DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify financial calculations
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const revenue = parseFloat(row.total_revenue) || 0;
        const investment = parseFloat(row.total_investment) || 0;
        const profit = parseFloat(row.net_profit) || 0;
        
        // Net profit should equal revenue minus investment
        expect(Math.abs(profit - (revenue - investment))).toBeLessThan(0.01);
      }
    });

    test('should execute revenue analysis by tier view efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          tier_classification,
          revenue_type,
          amount,
          period
        FROM revenue_analysis_by_tier
        WHERE period >= '2024-01-01'
        ORDER BY amount DESC
        LIMIT 25
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Concurrent Access Performance', () => {
    test('should handle multiple concurrent view queries efficiently', async () => {
      const queries = [
        'SELECT COUNT(*) FROM market_intelligence_summary',
        'SELECT COUNT(*) FROM competitive_landscape_analysis',
        'SELECT COUNT(*) FROM customer_segmentation_analysis',
        'SELECT COUNT(*) FROM infrastructure_performance_metrics',
        'SELECT COUNT(*) FROM financial_performance_dashboard'
      ];
      
      const startTime = Date.now();
      
      const promises = queries.map(query => client.query(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(3000); // Should complete all within 3 seconds
      expect(results.length).toBe(5);
      
      results.forEach(result => {
        expect(result.rows.length).toBe(1);
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle concurrent materialized view refreshes gracefully', async () => {
      const startTime = Date.now();
      
      try {
        const promises = [
          client.query('REFRESH MATERIALIZED VIEW market_analysis_summary'),
          client.query('REFRESH MATERIALIZED VIEW customer_behavior_summary'),
          client.query('REFRESH MATERIALIZED VIEW infrastructure_performance_summary')
        ];
        
        const results = await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        expect(totalTime).toBeLessThan(10000); // Should complete all within 10 seconds
        expect(results.length).toBe(3);
      } catch (error) {
        // Concurrent refreshes might fail, which is expected
        expect(error.message).toContain('concurrent');
      }
    });
  });

  describe('Data Volume Scalability', () => {
    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_id,
          estate_name,
          tier_classification,
          market_potential_score
        FROM market_intelligence_summary
        ORDER BY market_potential_score DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Performance should scale reasonably with data size
      const rowsPerSecond = result.rows.length / (queryTime / 1000);
      expect(rowsPerSecond).toBeGreaterThan(100); // Should process at least 100 rows per second
    });

    test('should handle complex aggregations efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        WITH estate_metrics AS (
          SELECT 
            e.tier_classification,
            e.area_id,
            COUNT(eu.id) as unit_count,
            AVG(eu.rent_price) as avg_rent,
            AVG(eu.sale_price) as avg_sale_price
          FROM estates e
          LEFT JOIN estate_units eu ON e.id = eu.estate_id
          GROUP BY e.tier_classification, e.area_id
        ),
        area_summary AS (
          SELECT 
            a.name as area_name,
            em.tier_classification,
            SUM(em.unit_count) as total_units,
            AVG(em.avg_rent) as avg_rent_price,
            AVG(em.avg_sale_price) as avg_sale_price
          FROM areas a
          JOIN estate_metrics em ON a.id = em.area_id
          GROUP BY a.name, em.tier_classification
        )
        SELECT 
          area_name,
          tier_classification,
          total_units,
          avg_rent_price,
          avg_sale_price
        FROM area_summary
        ORDER BY total_units DESC
        LIMIT 50
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('View Optimization', () => {
    test('should use appropriate indexes for view queries', async () => {
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT * FROM market_intelligence_summary
        WHERE tier_classification = 'platinum'
        AND market_potential_score > 80
        ORDER BY market_potential_score DESC
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if indexes are being used
      const explainPlan = result.rows[0]['QUERY PLAN'];
      const planText = JSON.stringify(explainPlan);
      expect(planText).toContain('Index Scan');
    });

    test('should show view execution statistics', async () => {
      const result = await client.query(`
        SELECT 
          schemaname,
          viewname,
          definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname LIKE '%_summary'
        ORDER BY viewname
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify view definitions exist
      result.rows.forEach(row => {
        expect(row.definition).toBeDefined();
        expect(row.definition.length).toBeGreaterThan(0);
      });
    });
  });
}); 
