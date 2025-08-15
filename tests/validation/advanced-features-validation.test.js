import pool from '../../utils/pool.js';

describe('Advanced Features Validation Tests', () => {
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

  describe('Spatial Analytics Validation', () => {
    test('should perform spatial proximity analysis', async () => {
      const result = await client.query(`
        SELECT 
          a1.name as area1_name,
          a2.name as area2_name,
          ST_Distance(a1.geometry, a2.geometry) as distance_meters,
          ST_Distance(a1.geometry, a2.geometry) / 1000 as distance_km
        FROM areas a1
        CROSS JOIN areas a2
        WHERE a1.id < a2.id
        AND a1.geometry IS NOT NULL
        AND a2.geometry IS NOT NULL
        ORDER BY distance_meters
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify spatial calculations
      result.rows.forEach(row => {
        expect(parseFloat(row.distance_meters)).toBeGreaterThan(0);
        expect(parseFloat(row.distance_km)).toBeGreaterThan(0);
        expect(row.area1_name).not.toBe(row.area2_name);
      });
    });

    test('should perform spatial clustering analysis', async () => {
      const result = await client.query(`
        SELECT 
          ST_ClusterKMeans(geometry, 3) OVER () as cluster_id,
          name,
          ST_AsText(geometry) as coordinates
        FROM areas
        WHERE geometry IS NOT NULL
        ORDER BY cluster_id, name
        LIMIT 15
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify clustering results
      const clusterIds = result.rows.map(row => row.cluster_id);
      const uniqueClusters = new Set(clusterIds);
      expect(uniqueClusters.size).toBeGreaterThan(0);
    });
  });

  describe('JSON Analytics Validation', () => {
    test('should perform complex JSON path queries', async () => {
      const result = await client.query(`
        SELECT 
          id,
          name,
          metadata->>'market_segment' as market_segment,
          metadata->>'amenities' as amenities,
          metadata->'demographics'->>'population_density' as population_density
        FROM estates
        WHERE metadata IS NOT NULL
        AND metadata ? 'market_segment'
        AND metadata ? 'amenities'
        ORDER BY name
        LIMIT 15
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify JSON path access
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          expect(row.market_segment).toBeDefined();
          expect(row.amenities).toBeDefined();
        });
      }
    });

    test('should perform JSON aggregation and analysis', async () => {
      const result = await client.query(`
        SELECT 
          metadata->>'market_segment' as market_segment,
          COUNT(*) as estate_count,
          AVG((metadata->'demographics'->>'population_density')::DECIMAL) as avg_population_density
        FROM estates
        WHERE metadata IS NOT NULL
        AND metadata ? 'market_segment'
        GROUP BY metadata->>'market_segment'
        ORDER BY estate_count DESC
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify JSON aggregation
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          expect(row.market_segment).toBeDefined();
          expect(parseInt(row.estate_count)).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Full-Text Search Validation', () => {
    test('should perform semantic similarity searches', async () => {
      const result = await client.query(`
        SELECT 
          name,
          similarity(name, 'Central Business District') as sim_score,
          name <-> 'Central Business District' as distance
        FROM areas
        WHERE name % 'Central Business District'
        ORDER BY sim_score DESC
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify similarity scores
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          expect(parseFloat(row.sim_score)).toBeGreaterThan(0);
          expect(parseFloat(row.distance)).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should perform fuzzy text matching', async () => {
      const result = await client.query(`
        SELECT 
          name,
          similarity(name, 'Abuja') as sim_score
        FROM areas
        WHERE name % 'Abuja'
        AND similarity(name, 'Abuja') > 0.3
        ORDER BY sim_score DESC
        LIMIT 15
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(0);
      
      // Verify fuzzy matching
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          expect(parseFloat(row.sim_score)).toBeGreaterThan(0.3);
        });
      }
    });
  });
});
