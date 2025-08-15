import pool from '../../utils/pool.js';

describe('Unit Tests: Database Constraints', () => {
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

  describe('CHECK Constraints', () => {
    test('should enforce tier_classification CHECK constraint', async () => {
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

    test('should enforce market_share CHECK constraint', async () => {
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

    test('should enforce rating CHECK constraint', async () => {
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

    test('should accept valid tier_classification values', async () => {
      const validTiers = ['platinum', 'gold', 'silver', 'bronze'];
      
      for (const tier of validTiers) {
        try {
          await client.query(`
            UPDATE estates 
            SET tier_classification = $1 
            WHERE id = 1
          `, [tier]);
          
          // Verify the update was successful
          const result = await client.query(`
            SELECT tier_classification FROM estates WHERE id = 1
          `);
          expect(result.rows[0].tier_classification).toBe(tier);
        } catch (error) {
          throw new Error(`Valid tier ${tier} should not fail: ${error.message}`);
        }
      }
    });

    test('should accept valid market_share values', async () => {
      const validShares = [0, 25, 50, 75, 100];
      
      for (const share of validShares) {
        try {
          await client.query(`
            INSERT INTO market_share_data (estate_id, provider_id, market_share, period)
            VALUES (1, 1, $1, '2024-01')
          `, [share]);
          
          // Clean up
          await client.query(`
            DELETE FROM market_share_data 
            WHERE estate_id = 1 AND provider_id = 1 AND market_share = $1
          `, [share]);
        } catch (error) {
          throw new Error(`Valid market share ${share} should not fail: ${error.message}`);
        }
      }
    });

    test('should accept valid rating values', async () => {
      const validRatings = [1, 2, 3, 4, 5];
      
      for (const rating of validRatings) {
        try {
          await client.query(`
            INSERT INTO customer_feedback (customer_id, service_type, rating, feedback_text)
            VALUES (1, 'internet', $1, 'Test feedback')
          `, [rating]);
          
          // Clean up
          await client.query(`
            DELETE FROM customer_feedback 
            WHERE customer_id = 1 AND service_type = 'internet' AND rating = $1
          `, [rating]);
        } catch (error) {
          throw new Error(`Valid rating ${rating} should not fail: ${error.message}`);
        }
      }
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should enforce estate_id foreign key in demographics', async () => {
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

    test('should enforce provider_id foreign key in provider_coverage', async () => {
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

    test('should enforce estate_id foreign key in customer_profiles', async () => {
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

    test('should accept valid foreign key references', async () => {
      // Get valid estate_id
      const estateResult = await client.query(`
        SELECT id FROM estates LIMIT 1
      `);
      const validEstateId = estateResult.rows[0].id;

      // Get valid provider_id
      const providerResult = await client.query(`
        SELECT id FROM service_providers LIMIT 1
      `);
      const validProviderId = providerResult.rows[0].id;

      try {
        // Test valid foreign key insert
        await client.query(`
          INSERT INTO provider_coverage (provider_id, estate_id, coverage_status, quality_metrics)
          VALUES ($1, $2, 'active', '{"speed": "100mbps"}')
        `, [validProviderId, validEstateId]);

        // Clean up
        await client.query(`
          DELETE FROM provider_coverage 
          WHERE provider_id = $1 AND estate_id = $2
        `, [validProviderId, validEstateId]);
      } catch (error) {
        throw new Error(`Valid foreign key should not fail: ${error.message}`);
      }
    });
  });

  describe('Data Type Constraints', () => {
    test('should enforce numeric constraints on market_potential_score', async () => {
      try {
        await client.query(`
          UPDATE estates 
          SET market_potential_score = -10 
          WHERE id = 1
        `);
        throw new Error('Should have failed due to numeric constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }

      try {
        await client.query(`
          UPDATE estates 
          SET market_potential_score = 150 
          WHERE id = 1
        `);
        throw new Error('Should have failed due to numeric constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }
    });

    test('should enforce numeric constraints on competitive_intensity', async () => {
      try {
        await client.query(`
          UPDATE estates 
          SET competitive_intensity = 0 
          WHERE id = 1
        `);
        throw new Error('Should have failed due to numeric constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }

      try {
        await client.query(`
          UPDATE estates 
          SET competitive_intensity = 15 
          WHERE id = 1
        `);
        throw new Error('Should have failed due to numeric constraint');
      } catch (error) {
        expect(error.message).toContain('check constraint');
      }
    });

    test('should accept valid numeric values', async () => {
      try {
        await client.query(`
          UPDATE estates 
          SET market_potential_score = 75,
              competitive_intensity = 5
          WHERE id = 1
        `);

        // Verify the update was successful
        const result = await client.query(`
          SELECT market_potential_score, competitive_intensity 
          FROM estates WHERE id = 1
        `);
        
        expect(parseFloat(result.rows[0].market_potential_score)).toBe(75);
        expect(parseInt(result.rows[0].competitive_intensity)).toBe(5);
      } catch (error) {
        throw new Error(`Valid numeric values should not fail: ${error.message}`);
      }
    });
  });

  describe('JSON Schema Constraints', () => {
    test('should validate estates metadata JSON structure', async () => {
      const validMetadata = {
        market_potential_score: 85,
        competitive_intensity: 7,
        tier_classification: 'platinum',
        amenities: ['pool', 'gym', 'security']
      };

      try {
        await client.query(`
          UPDATE estates 
          SET metadata = $1 
          WHERE id = 1
        `, [JSON.stringify(validMetadata)]);

        // Verify the update was successful
        const result = await client.query(`
          SELECT metadata FROM estates WHERE id = 1
        `);
        
        expect(result.rows[0].metadata).toEqual(validMetadata);
      } catch (error) {
        throw new Error(`Valid JSON metadata should not fail: ${error.message}`);
      }
    });

    test('should validate products features JSON structure', async () => {
      const validFeatures = {
        service_category: 'internet',
        pricing_tier: 'premium',
        base_price: 5000,
        speed: '100mbps',
        data_cap: 'unlimited'
      };

      try {
        await client.query(`
          UPDATE products 
          SET features = $1 
          WHERE id = 1
        `, [JSON.stringify(validFeatures)]);

        // Verify the update was successful
        const result = await client.query(`
          SELECT features FROM products WHERE id = 1
        `);
        
        expect(result.rows[0].features).toEqual(validFeatures);
      } catch (error) {
        throw new Error(`Valid JSON features should not fail: ${error.message}`);
      }
    });
  });

  describe('Geospatial Constraints', () => {
    test('should validate geometry field constraints', async () => {
      const validPoint = 'POINT(7.4916 9.0820)'; // Abuja coordinates
      const invalidPoint = 'POINT(200 200)'; // Invalid coordinates

      try {
        // Test valid geometry
        await client.query(`
          UPDATE areas 
          SET geometry = ST_GeomFromText($1, 4326)
          WHERE id = 1
        `, [validPoint]);

        // Verify the update was successful
        const result = await client.query(`
          SELECT ST_AsText(geometry) as geom_text FROM areas WHERE id = 1
        `);
        
        expect(result.rows[0].geom_text).toBe(validPoint);
      } catch (error) {
        throw new Error(`Valid geometry should not fail: ${error.message}`);
      }
    });

    test('should enforce coordinate range constraints', async () => {
      const nigeriaBounds = {
        minLon: 2.69,
        maxLon: 14.58,
        minLat: 4.32,
        maxLat: 13.89
      };

      // Test coordinates within Nigeria bounds
      const validCoordinates = [
        'POINT(7.4916 9.0820)', // Abuja
        'POINT(3.3792 6.5244)', // Lagos
        'POINT(11.1861 9.0820)' // Kano
      ];

      for (const coord of validCoordinates) {
        try {
          await client.query(`
            UPDATE areas 
            SET geometry = ST_GeomFromText($1, 4326)
            WHERE id = 1
          `, [coord]);

          // Verify coordinates are within bounds
          const result = await client.query(`
            SELECT 
              ST_X(geometry) as longitude,
              ST_Y(geometry) as latitude
            FROM areas WHERE id = 1
          `);
          
          const lon = parseFloat(result.rows[0].longitude);
          const lat = parseFloat(result.rows[0].latitude);
          
          expect(lon).toBeGreaterThanOrEqual(nigeriaBounds.minLon);
          expect(lon).toBeLessThanOrEqual(nigeriaBounds.maxLon);
          expect(lat).toBeGreaterThanOrEqual(nigeriaBounds.minLat);
          expect(lat).toBeLessThanOrEqual(nigeriaBounds.maxLat);
        } catch (error) {
          throw new Error(`Valid coordinate ${coord} should not fail: ${error.message}`);
        }
      }
    });
  });

  describe('Constraint Performance', () => {
    test('should handle constraint validation efficiently', async () => {
      const startTime = Date.now();
      
      // Perform multiple constraint validations
      for (let i = 0; i < 10; i++) {
        try {
          await client.query(`
            UPDATE estates 
            SET tier_classification = 'gold',
                market_potential_score = 75,
                competitive_intensity = 5
            WHERE id = 1
          `);
        } catch (error) {
          throw new Error(`Constraint validation should not fail: ${error.message}`);
        }
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle bulk constraint validation efficiently', async () => {
      const startTime = Date.now();
      
      // Get multiple estate IDs
      const estatesResult = await client.query(`
        SELECT id FROM estates LIMIT 5
      `);
      
      // Update multiple estates with valid constraints
      for (const estate of estatesResult.rows) {
        try {
          await client.query(`
            UPDATE estates 
            SET tier_classification = 'silver',
                market_potential_score = 60,
                competitive_intensity = 6
            WHERE id = $1
          `, [estate.id]);
        } catch (error) {
          throw new Error(`Bulk constraint validation should not fail: ${error.message}`);
        }
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds
    });
  });
});
