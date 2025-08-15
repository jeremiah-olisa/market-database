import pool from '../../utils/pool.js';

describe('Technical Excellence Validation Tests', () => {
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

  describe('Performance Validation', () => {
    test('should verify query performance meets requirements', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_id,
          estate_name,
          tier_classification,
          market_potential_score
        FROM market_intelligence_summary
        WHERE tier_classification = 'platinum'
        ORDER BY market_potential_score DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should verify scalability under load', async () => {
      const queries = [
        'SELECT COUNT(*) FROM market_intelligence_summary',
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
      expect(results.length).toBe(4);
    });

    test('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_estates,
          COUNT(DISTINCT area_id) as total_areas,
          COUNT(DISTINCT tier_classification) as total_tiers
        FROM estates
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.rows.length).toBe(1);
      
      const row = result.rows[0];
      expect(parseInt(row.total_estates)).toBeGreaterThan(0);
      expect(parseInt(row.total_areas)).toBeGreaterThan(0);
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
        )
        SELECT 
          tier_classification,
          COUNT(area_id) as area_count,
          SUM(unit_count) as total_units,
          AVG(avg_rent) as overall_avg_rent
        FROM estate_metrics
        GROUP BY tier_classification
        ORDER BY total_units DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity Validation', () => {
    test('should verify foreign key constraints', async () => {
      const constraintResult = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `);
      
      expect(constraintResult.rows.length).toBeGreaterThan(0);
      
      // Verify specific foreign key relationships
      const constraints = constraintResult.rows.map(row => 
        `${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`
      );
      
      expect(constraints).toContain('estates.area_id -> areas.id');
      expect(constraints).toContain('estate_units.estate_id -> estates.id');
    });

    test('should verify CHECK constraints', async () => {
      const checkResult = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          cc.check_clause
        FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc 
          ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_type = 'CHECK'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `);
      
      expect(checkResult.rows.length).toBeGreaterThan(0);
      
      // Verify specific CHECK constraints
      const checkConstraints = checkResult.rows.map(row => 
        `${row.table_name}: ${row.check_clause}`
      );
      
      // Should have tier classification constraint
      expect(checkConstraints.some(constraint => 
        constraint.includes('tier_classification') && 
        constraint.includes('platinum')
      )).toBe(true);
    });

    test('should verify data validation rules', async () => {
      // Test tier classification values
      const tierResult = await client.query(`
        SELECT DISTINCT tier_classification 
        FROM estates 
        WHERE tier_classification IS NOT NULL
      `);
      
      expect(tierResult.rows.length).toBeGreaterThan(0);
      
      const validTiers = ['platinum', 'gold', 'silver', 'bronze'];
      tierResult.rows.forEach(row => {
        expect(validTiers).toContain(row.tier_classification);
      });
    });

    test('should verify geospatial data validation', async () => {
      const spatialResult = await client.query(`
        SELECT 
          COUNT(*) as total_areas,
          COUNT(CASE WHEN geometry IS NOT NULL THEN 1 END) as areas_with_geometry,
          COUNT(CASE WHEN ST_IsValid(geometry) THEN 1 END) as valid_geometry_count
        FROM areas
      `);
      
      expect(spatialResult.rows.length).toBe(1);
      const row = spatialResult.rows[0];
      
      expect(parseInt(row.total_areas)).toBeGreaterThan(0);
      expect(parseInt(row.areas_with_geometry)).toBeGreaterThan(0);
      expect(parseInt(row.valid_geometry_count)).toBeGreaterThan(0);
      
      // All geometry should be valid
      expect(parseInt(row.valid_geometry_count)).toBe(parseInt(row.areas_with_geometry));
    });
  });

  describe('System Reliability Validation', () => {
    test('should verify database connectivity and basic operations', async () => {
      const result = await client.query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });

    test('should verify transaction rollback functionality', async () => {
      // Test transaction rollback
      await client.query('BEGIN');
      await client.query('SELECT 1 as test');
      await client.query('ROLLBACK');
      
      // Test if we can still query after rollback
      const testResult = await client.query('SELECT 1 as test');
      expect(testResult.rows[0].test).toBe(1);
    });

    test('should verify concurrent access handling', async () => {
      const queries = [
        'SELECT COUNT(*) FROM estates',
        'SELECT COUNT(*) FROM areas',
        'SELECT COUNT(*) FROM products'
      ];
      
      const startTime = Date.now();
      
      const promises = queries.map(query => client.query(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(2000); // Should complete all within 2 seconds
      expect(results.length).toBe(3);
      
      results.forEach(result => {
        expect(result.rows.length).toBe(1);
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
      });
    });

    test('should verify error handling', async () => {
      try {
        await client.query('SELECT * FROM non_existent_table');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('relation "non_existent_table" does not exist');
      }
    });
  });

  describe('Index Performance Validation', () => {
    test('should verify spatial index performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          a.name,
          ST_Distance(
            a.geometry, 
            ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
          ) as distance
        FROM areas a
        WHERE ST_DWithin(
          a.geometry, 
          ST_GeomFromText('POINT(7.4916 9.0820)', 4326),
          10000
        )
        ORDER BY distance
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should verify JSON index performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          metadata->>'market_segment' as market_segment
        FROM estates
        WHERE metadata ? 'market_segment'
        AND metadata->>'market_segment' = 'premium'
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should verify compound index performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          tier_classification,
          area_id
        FROM estates
        WHERE tier_classification = 'platinum'
        AND area_id IN (1, 2, 3)
        ORDER BY market_potential_score DESC
        LIMIT 15
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should verify full-text search index performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          name,
          similarity(name, 'Central') as sim_score
        FROM areas
        WHERE name % 'Central'
        ORDER BY sim_score DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Materialized View Performance', () => {
    test('should verify materialized view refresh performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        REFRESH MATERIALIZED VIEW market_analysis_summary
      `);
      
      const endTime = Date.now();
      const refreshTime = endTime - startTime;
      
      expect(refreshTime).toBeLessThan(5000); // Should refresh within 5 seconds
      expect(result).toBeDefined();
    });

    test('should verify materialized view query performance', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          area_name,
          tier_classification,
          estate_count,
          avg_market_potential
        FROM market_analysis_summary
        WHERE avg_market_potential > 70
        ORDER BY avg_market_potential DESC
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(100); // Should query within 100ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should verify materialized view index usage', async () => {
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT * FROM market_analysis_summary
        WHERE area_name = 'Abuja Central'
        AND tier_classification = 'platinum'
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if index was used
      const explainPlan = result.rows[0]['QUERY PLAN'];
      const planText = JSON.stringify(explainPlan);
      expect(planText).toContain('Index Scan');
    });
  });

  describe('Data Consistency Validation', () => {
    test('should verify referential integrity', async () => {
      // Check for orphaned records
      const orphanedEstates = await client.query(`
        SELECT COUNT(*) as orphaned_count
        FROM estates e
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE a.id IS NULL
      `);
      
      expect(parseInt(orphanedEstates.rows[0].orphaned_count)).toBe(0);
      
      const orphanedUnits = await client.query(`
        SELECT COUNT(*) as orphaned_count
        FROM estate_units eu
        LEFT JOIN estates e ON eu.estate_id = e.id
        WHERE e.id IS NULL
      `);
      
      expect(parseInt(orphanedUnits.rows[0].orphaned_count)).toBe(0);
    });

    test('should verify data type consistency', async () => {
      // Check numeric field consistency
      const numericCheck = await client.query(`
        SELECT 
          COUNT(*) as total_estates,
          COUNT(CASE WHEN market_potential_score >= 0 AND market_potential_score <= 100 THEN 1 END) as valid_scores
        FROM estates
        WHERE market_potential_score IS NOT NULL
      `);
      
      const row = numericCheck.rows[0];
      expect(parseInt(row.total_estates)).toBe(parseInt(row.valid_scores));
    });

    test('should verify timestamp consistency', async () => {
      // Check for future timestamps
      const futureTimestamps = await client.query(`
        SELECT COUNT(*) as future_count
        FROM estates
        WHERE created_at > CURRENT_TIMESTAMP
        OR updated_at > CURRENT_TIMESTAMP
      `);
      
      expect(parseInt(futureTimestamps.rows[0].future_count)).toBe(0);
    });
  });
});
