import pool from '../../utils/pool.js';

describe('Database Performance Tests', () => {
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
    test('should perform spatial queries efficiently using GIST indexes', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          e.name as estate_name,
          e.tier_classification,
          ST_Distance(
            a.geometry, 
            ST_GeomFromText('POINT(7.4916 9.0820)', 4326)
          ) as distance_from_abuja
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        WHERE a.geometry IS NOT NULL
        ORDER BY distance_from_abuja
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(result.rows.length).toBeGreaterThan(0);
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
      
      // Verify spatial ordering
      if (result.rows.length > 1) {
        const firstDistance = parseFloat(result.rows[0].distance_from_abuja);
        const lastDistance = parseFloat(result.rows[result.rows.length - 1].distance_from_abuja);
        expect(firstDistance).toBeLessThanOrEqual(lastDistance);
      }
    });

    test('should perform spatial range queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as estates_in_range
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        WHERE ST_DWithin(
          a.geometry,
          ST_GeomFromText('POINT(7.4916 9.0820)', 4326),
          0.1
        )
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(parseInt(result.rows[0].estates_in_range)).toBeGreaterThanOrEqual(0);
    });

    test('should perform spatial aggregation queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          a.state,
          COUNT(e.id) as estate_count,
          AVG(e.market_potential_score) as avg_market_potential
        FROM areas a
        JOIN estates e ON a.id = e.area_id
        WHERE a.geometry IS NOT NULL
        GROUP BY a.state
        ORDER BY estate_count DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Index Performance', () => {
    test('should perform JSON field queries efficiently using GIN indexes', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          metadata->>'market_potential_score' as score,
          metadata->>'competitive_intensity' as intensity
        FROM estates
        WHERE metadata @> '{"tier_classification": "platinum"}'
        AND metadata->>'market_potential_score'::numeric > 80
        ORDER BY (metadata->>'market_potential_score')::numeric DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify JSON filtering worked
      result.rows.forEach(row => {
        expect(parseFloat(row.score)).toBeGreaterThan(80);
      });
    });

    test('should perform complex JSON path queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          features->>'service_category' as category,
          features->>'pricing_tier' as tier
        FROM products
        WHERE features @> '{"service_category": "internet"}'
        AND features->>'pricing_tier' IN ('premium', 'standard')
        AND (features->>'base_price')::numeric BETWEEN 1000 AND 10000
        ORDER BY (features->>'base_price')::numeric DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should perform JSON aggregation queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          features->>'service_category' as category,
          COUNT(*) as product_count,
          AVG((features->>'base_price')::numeric) as avg_price,
          MIN((features->>'base_price')::numeric) as min_price,
          MAX((features->>'base_price')::numeric) as max_price
        FROM products
        WHERE features IS NOT NULL
        GROUP BY features->>'service_category'
        ORDER BY avg_price DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Compound Index Performance', () => {
    test('should perform multi-column queries efficiently using compound indexes', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          tier_classification,
          market_potential_score
        FROM estates
        WHERE tier_classification = 'platinum'
        AND area_id IN (1, 2, 3)
        AND market_potential_score > 70
        ORDER BY market_potential_score DESC, name
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify filtering worked
      result.rows.forEach(row => {
        expect(row.tier_classification).toBe('platinum');
        expect(parseFloat(row.market_potential_score)).toBeGreaterThan(70);
      });
    });

    test('should perform classification and type queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          classification,
          estate_type,
          unit_count
        FROM estates
        WHERE classification = 'luxury'
        AND estate_type = 'residential'
        AND unit_count BETWEEN 50 AND 500
        ORDER BY unit_count DESC, name
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should perform market share period queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          estate_id,
          provider_id,
          market_share,
          period
        FROM market_share_data
        WHERE estate_id IN (1, 2, 3, 4, 5)
        AND period >= '2024-01-01'
        AND market_share > 10
        ORDER BY period DESC, market_share DESC
        LIMIT 50
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Full-Text Search Performance', () => {
    test('should perform full-text search queries efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          ts_rank(
            to_tsvector('english', name || ' ' || COALESCE(description, '')),
            plainto_tsquery('english', 'luxury residential')
          ) as rank
        FROM estates
        WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ 
              plainto_tsquery('english', 'luxury residential')
        ORDER BY rank DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should perform business name search efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          business_type,
          ts_rank(
            to_tsvector('english', name),
            plainto_tsquery('english', 'restaurant')
          ) as rank
        FROM local_businesses
        WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'restaurant')
        ORDER BY rank DESC
        LIMIT 20
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    test('should perform provider name search efficiently', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        SELECT 
          id,
          name,
          service_type,
          ts_rank(
            to_tsvector('english', name),
            plainto_tsquery('english', 'internet')
          ) as rank
        FROM service_providers
        WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'internet')
        ORDER BY rank DESC
        LIMIT 15
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Benchmarks', () => {
    test('should complete complex analytical queries within acceptable time', async () => {
      const startTime = Date.now();
      
      const result = await client.query(`
        WITH estate_metrics AS (
          SELECT 
            e.id,
            e.name,
            e.tier_classification,
            e.market_potential_score,
            COUNT(eu.id) as unit_count,
            AVG(eu.rent_price) as avg_rent,
            AVG(eu.sale_price) as avg_sale_price
          FROM estates e
          LEFT JOIN estate_units eu ON e.id = eu.estate_id
          GROUP BY e.id, e.name, e.tier_classification, e.market_potential_score
        ),
        market_analysis AS (
          SELECT 
            em.tier_classification,
            COUNT(*) as estate_count,
            AVG(em.market_potential_score) as avg_potential,
            AVG(em.avg_rent) as avg_rent_price,
            AVG(em.avg_sale_price) as avg_sale_price
          FROM estate_metrics em
          GROUP BY em.tier_classification
        )
        SELECT * FROM market_analysis
        ORDER BY avg_potential DESC
      `);
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test('should handle concurrent queries efficiently', async () => {
      const queries = [
        'SELECT COUNT(*) FROM estates WHERE tier_classification = \'platinum\'',
        'SELECT COUNT(*) FROM estates WHERE tier_classification = \'gold\'',
        'SELECT COUNT(*) FROM estates WHERE tier_classification = \'silver\'',
        'SELECT COUNT(*) FROM estates WHERE tier_classification = \'bronze\''
      ];
      
      const startTime = Date.now();
      
      const promises = queries.map(query => client.query(query));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Should complete all within 1 second
      expect(results.length).toBe(4);
      
      results.forEach(result => {
        expect(result.rows.length).toBe(1);
        expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(0);
      });
    });
  });
}); 
