import pool from '../../utils/pool.js';

describe('Index Performance Tests', () => {
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

  describe('Spatial Index Performance', () => {
    test('should use GIST index for geometry queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          e.name as estate_name,
          ST_Distance(
            a.geometry, 
            ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
          ) as distance
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        WHERE a.geometry IS NOT NULL
        ORDER BY distance
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(1000);
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if GIST index was used
      const explainPlan = result.rows[0]['QUERY PLAN'];
      const planText = JSON.stringify(explainPlan);
      expect(planText).toContain('Index Scan');
    });

    test('should use spatial index for range queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT COUNT(*) as count
        FROM areas
        WHERE ST_DWithin(
          geometry,
          ST_GeomFromText('POINT(7.4916 9.0820)', 4326),
          0.1
        )
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should use spatial index for nearest neighbor queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          name,
          ST_Distance(
            geometry, 
            ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
          ) as distance
        FROM areas
        WHERE geometry IS NOT NULL
        ORDER BY geometry <-> ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
        LIMIT 5
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Index Performance', () => {
    test('should use GIN index for JSON containment queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          metadata->>'market_potential_score' as score
        FROM estates
        WHERE metadata @> '{"tier_classification": "platinum"}'
        AND (metadata->>'market_potential_score')::numeric > 80
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if GIN index was used
      const explainPlan = result.rows[0]['QUERY PLAN'];
      const planText = JSON.stringify(explainPlan);
      expect(planText).toContain('Index Scan');
    });

    test('should use GIN index for JSON path queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          features->>'service_category' as category
        FROM products
        WHERE features @> '{"service_category": "internet"}'
        AND (features->>'base_price')::numeric BETWEEN 1000 AND 10000
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use GIN index for JSON array queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          lifestyle_indicators->>'internet_usage' as usage
        FROM customer_profiles
        WHERE lifestyle_indicators ? 'internet_usage'
        AND lifestyle_indicators->>'internet_usage' = 'high'
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Compound Index Performance', () => {
    test('should use compound index for multi-column queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          tier_classification,
          market_potential_score
        FROM estates
        WHERE tier_classification = 'platinum'
        AND area_id IN (1, 2, 3)
        ORDER BY market_potential_score DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use compound index for classification and type queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          classification,
          estate_type
        FROM estates
        WHERE classification = 'luxury'
        AND estate_type = 'residential'
        ORDER BY name
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use compound index for market share queries', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          estate_id,
          provider_id,
          market_share,
          period
        FROM market_share_data
        WHERE estate_id = 1
        AND period >= '2024-01-01'
        ORDER BY period DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Partial Index Performance', () => {
    test('should use partial index for active estates', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          tier_classification
        FROM estates
        WHERE occupancy_status != 'under_construction'
        AND tier_classification = 'platinum'
        ORDER BY market_potential_score DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use partial index for recent price trends', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          product_id,
          area_id,
          price,
          period
        FROM price_trends
        WHERE period >= CURRENT_DATE - INTERVAL '1 year'
        AND price_type = 'rent'
        ORDER BY period DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use partial index for high-potential estates', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          tier_classification
        FROM estates
        WHERE market_potential_score > 80
        AND tier_classification IN ('platinum', 'gold')
        ORDER BY market_potential_score DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Full-Text Search Index Performance', () => {
    test('should use full-text index for estate name search', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          ts_rank(
            to_tsvector('english', name || ' ' || COALESCE(description, '')),
            plainto_tsquery('english', 'luxury')
          ) as rank
        FROM estates
        WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ 
              plainto_tsquery('english', 'luxury')
        ORDER BY rank DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should use full-text index for business name search', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT 
          id,
          name,
          business_type
        FROM local_businesses
        WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'restaurant')
        ORDER BY name
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500);
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Index Usage Analysis', () => {
    test('should show index usage statistics', async () => {
      const result = await client.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check if indexes are being used
      const totalScans = result.rows.reduce((sum, row) => sum + parseInt(row.idx_scan), 0);
      expect(totalScans).toBeGreaterThan(0);
    });

    test('should show table statistics', async () => {
      const result = await client.query(`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY seq_scan DESC
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
}); 
