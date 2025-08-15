import pool from '../../utils/pool.js';

describe('Database Constraint Tests', () => {
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

  describe('Foreign Key Constraints', () => {
    test('should enforce estate_id foreign key in demographics table', async () => {
      try {
        await client.query(`
          INSERT INTO demographics (estate_id, population, age_groups, income_levels, geometry)
          VALUES (99999, 1000, '{"18-25": 20}', '{"low": 30}', ST_GeomFromText('POINT(7.4916 9.0820)'))
        `);
        throw new Error('Should have failed due to foreign key constraint');
      } catch (error) {
        expect(error.message).toContain('violates foreign key constraint');
      }
    });

    test('should enforce provider_id foreign key in provider_coverage table', async () => {
      try {
        await client.query(`
          INSERT INTO provider_coverage (provider_id, estate_id, coverage_status, quality_metrics)
          VALUES (99999, 1, 'active', '{"speed": "100mbps"}')
        `);
        throw new Error('Should have failed due to foreign key constraint');
      } catch (error) {
        expect(error.message).toContain('violates foreign key constraint');
      }
    });

    test('should enforce estate_id foreign key in customer_profiles table', async () => {
      try {
        await client.query(`
          INSERT INTO customer_profiles (estate_id, demographics, lifestyle_indicators)
          VALUES (99999, '{"age": 30}', '{"internet_usage": "high"}')
        `);
        throw new Error('Should have failed due to foreign key constraint');
      } catch (error) {
        expect(error.message).toContain('violates foreign key constraint');
      }
    });
  });

  describe('CHECK Constraints', () => {
    test('should enforce tier_classification CHECK constraint in estates table', async () => {
      try {
        await client.query(`
          UPDATE estates 
          SET tier_classification = 'invalid_tier' 
          WHERE id = 1
        `);
        throw new Error('Should have failed due to CHECK constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }
    });

    test('should enforce market_share CHECK constraint in market_share_data table', async () => {
      try {
        await client.query(`
          INSERT INTO market_share_data (estate_id, provider_id, market_share, period)
          VALUES (1, 1, 150, '2024-01')
        `);
        throw new Error('Should have failed due to CHECK constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }
    });

    test('should enforce rating CHECK constraint in customer_feedback table', async () => {
      try {
        await client.query(`
          INSERT INTO customer_feedback (customer_id, service_type, rating, feedback_text)
          VALUES (1, 'internet', 6, 'Great service')
        `);
        throw new Error('Should have failed due to CHECK constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }
    });
  });

  describe('JSON Schema Validation', () => {
    test('should validate estates metadata JSON structure', async () => {
      const result = await client.query(`
        SELECT metadata->>'market_potential_score' as score
        FROM estates 
        WHERE metadata IS NOT NULL 
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        expect(result.rows[0].score).toBeDefined();
      }
    });

    test('should validate products features JSON structure', async () => {
      const result = await client.query(`
        SELECT features->>'service_category' as category
        FROM products 
        WHERE features IS NOT NULL 
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        expect(result.rows[0].category).toBeDefined();
      }
    });

    test('should validate customer_profiles lifestyle_indicators JSON structure', async () => {
      const result = await client.query(`
        SELECT lifestyle_indicators->>'internet_usage' as usage
        FROM customer_profiles 
        WHERE lifestyle_indicators IS NOT NULL 
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        expect(result.rows[0].usage).toBeDefined();
      }
    });
  });

  describe('Geospatial Validation', () => {
    test('should validate areas geometry field', async () => {
      const result = await client.query(`
        SELECT ST_AsText(geometry) as geom_text
        FROM areas 
        WHERE geometry IS NOT NULL 
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        expect(result.rows[0].geom_text).toMatch(/^POINT\(/);
      }
    });

    test('should validate demographics geometry field', async () => {
      const result = await client.query(`
        SELECT ST_AsText(geometry) as geom_text
        FROM demographics 
        WHERE geometry IS NOT NULL 
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        expect(result.rows[0].geom_text).toMatch(/^POINT\(/);
      }
    });

    test('should validate coordinate ranges for Nigeria', async () => {
      const result = await client.query(`
        SELECT 
          ST_X(geometry) as longitude,
          ST_Y(geometry) as latitude
        FROM areas 
        WHERE geometry IS NOT NULL 
        LIMIT 5
      `);
      
      result.rows.forEach(row => {
        // Nigeria longitude: 2.69°E to 14.58°E, latitude: 4.32°N to 13.89°N
        expect(row.longitude).toBeGreaterThanOrEqual(2.69);
        expect(row.longitude).toBeLessThanOrEqual(14.58);
        expect(row.latitude).toBeGreaterThanOrEqual(4.32);
        expect(row.latitude).toBeLessThanOrEqual(13.89);
      });
    });
  });
}); 
