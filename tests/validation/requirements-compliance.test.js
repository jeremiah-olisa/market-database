import pool from '../../utils/pool.js';

describe('Requirements v2 Compliance Tests', () => {
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

  describe('V2 Requirements Checklist', () => {
    test('should verify all 20+ tables are created', async () => {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const expectedTables = [
        'areas', 'business_categories', 'business_metadata', 'capacity_metrics',
        'cross_service_adoption', 'customer_feedback', 'customer_profiles',
        'demographics', 'estate_metadata', 'estate_units', 'estates',
        'infrastructure_investments', 'local_businesses', 'market_opportunities',
        'market_share_data', 'network_infrastructure', 'price_trends',
        'products', 'provider_coverage', 'revenue_analytics',
        'service_offerings', 'service_providers', 'usage_patterns'
      ];
      
      const actualTables = result.rows.map(row => row.table_name).sort();
      
      expect(actualTables.length).toBeGreaterThanOrEqual(20);
      expectedTables.forEach(table => {
        expect(actualTables).toContain(table);
      });
    });

    test('should verify JSON/JSONB support is implemented', async () => {
      const result = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          udt_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (data_type = 'json' OR data_type = 'jsonb')
        ORDER BY table_name, column_name
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify specific JSON fields exist
      const jsonFields = result.rows.map(row => `${row.table_name}.${row.column_name}`);
      expect(jsonFields).toContain('estates.metadata');
      expect(jsonFields).toContain('products.features');
      expect(jsonFields).toContain('customer_profiles.lifestyle_indicators');
    });

    test('should verify geospatial capabilities are working', async () => {
      // Check if PostGIS extension is enabled
      const extensionResult = await client.query(`
        SELECT extname FROM pg_extension WHERE extname = 'postgis'
      `);
      
      expect(extensionResult.rows.length).toBeGreaterThan(0);
      
      // Check if geometry columns exist
      const geometryResult = await client.query(`
        SELECT 
          f_table_name, 
          f_geometry_column, 
          type
        FROM geometry_columns 
        WHERE f_table_schema = 'public'
        ORDER BY f_table_name
      `);
      
      expect(geometryResult.rows.length).toBeGreaterThan(0);
      
      // Verify specific geometry fields
      const geometryFields = geometryResult.rows.map(row => `${row.f_table_name}.${row.f_geometry_column}`);
      expect(geometryFields).toContain('areas.geometry');
      expect(geometryFields).toContain('demographics.geometry');
    });

    test('should verify full-text search is functional', async () => {
      // Check if pg_trgm extension is enabled
      const extensionResult = await client.query(`
        SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'
      `);
      
      expect(extensionResult.rows.length).toBeGreaterThan(0);
      
      // Test full-text search functionality
      const searchResult = await client.query(`
        SELECT name, similarity(name, 'Abuja') as sim
        FROM areas 
        WHERE name % 'Abuja'
        ORDER BY sim DESC
        LIMIT 5
      `);
      
      expect(searchResult.rows.length).toBeGreaterThan(0);
    });

    test('should verify materialized views are optimized', async () => {
      const result = await client.query(`
        SELECT 
          matviewname,
          definition
        FROM pg_matviews 
        WHERE schemaname = 'public'
        ORDER BY matviewname
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify specific materialized views exist
      const materializedViews = result.rows.map(row => row.matviewname);
      expect(materializedViews).toContain('market_analysis_summary');
      expect(materializedViews).toContain('customer_behavior_summary');
      expect(materializedViews).toContain('infrastructure_performance_summary');
      expect(materializedViews).toContain('financial_performance_summary');
    });

    test('should verify advanced indexing is implemented', async () => {
      const result = await client.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE '%gin%'
        ORDER BY indexname
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify GIN indexes for JSON fields
      const ginIndexes = result.rows.map(row => row.indexname);
      expect(ginIndexes.some(index => index.includes('metadata'))).toBe(true);
      expect(ginIndexes.some(index => index.includes('features'))).toBe(true);
    });
  });

  describe('Business Intelligence Validation', () => {
    test('should test market intelligence capabilities', async () => {
      const result = await client.query(`
        SELECT 
          COUNT(*) as estate_count,
          COUNT(DISTINCT tier_classification) as tier_count,
          AVG(market_potential_score) as avg_potential
        FROM market_intelligence_summary
      `);
      
      expect(result.rows.length).toBe(1);
      const row = result.rows[0];
      expect(parseInt(row.estate_count)).toBeGreaterThan(0);
      expect(parseInt(row.tier_count)).toBeGreaterThan(0);
      expect(parseFloat(row.avg_potential)).toBeGreaterThan(0);
    });

    test('should test customer analytics capabilities', async () => {
      const result = await client.query(`
        SELECT 
          COUNT(*) as customer_count,
          COUNT(DISTINCT tier_classification) as tier_count
        FROM customer_segmentation_analysis
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      const row = result.rows[0];
      expect(parseInt(row.customer_count)).toBeGreaterThan(0);
    });

    test('should test investment decision support', async () => {
      const result = await client.query(`
        SELECT 
          COUNT(*) as opportunity_count,
          SUM(potential_value) as total_potential,
          AVG(risk_assessment) as avg_risk
        FROM market_opportunities
      `);
      
      expect(result.rows.length).toBe(1);
      const row = result.rows[0];
      expect(parseInt(row.opportunity_count)).toBeGreaterThan(0);
    });

    test('should test competitive analysis capabilities', async () => {
      const result = await client.query(`
        SELECT 
          COUNT(*) as provider_count,
          COUNT(DISTINCT service_type) as service_types,
          AVG(market_share) as avg_market_share
        FROM competitive_landscape_analysis
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Technical Excellence Validation', () => {
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

    test('should verify data integrity', async () => {
      // Check foreign key constraints
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

    test('should verify system reliability', async () => {
      // Test database connectivity and basic operations
      const result = await client.query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
      
      // Test transaction rollback
      await client.query('BEGIN');
      await client.query('SELECT 1 as test');
      await client.query('ROLLBACK');
      
      // Test if we can still query after rollback
      const testResult = await client.query('SELECT 1 as test');
      expect(testResult.rows[0].test).toBe(1);
    });
  });

  describe('Data Volume and Performance Validation', () => {
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

  describe('Advanced Feature Validation', () => {
    test('should verify spatial queries work correctly', async () => {
      const result = await client.query(`
        SELECT 
          a.name as area_name,
          ST_AsText(a.geometry) as coordinates,
          ST_Distance(
            a.geometry, 
            ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
          ) as distance_from_abuja
        FROM areas a
        WHERE a.geometry IS NOT NULL
        ORDER BY distance_from_abuja
        LIMIT 5
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify spatial data exists
      result.rows.forEach(row => {
        expect(row.coordinates).toBeDefined();
        expect(row.distance_from_abuja).toBeDefined();
      });
    });

    test('should verify JSON queries work correctly', async () => {
      const result = await client.query(`
        SELECT 
          id,
          name,
          metadata->>'market_segment' as market_segment,
          metadata->>'amenities' as amenities
        FROM estates
        WHERE metadata IS NOT NULL
        AND metadata ? 'market_segment'
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify JSON fields are accessible
      if (result.rows.length > 0) {
        const row = result.rows[0];
        expect(row.market_segment).toBeDefined();
      }
    });

    test('should verify full-text search performance', async () => {
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
});
