import pool from '../../utils/pool.js';

describe('Seeder Integration Tests', () => {
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

  describe('Seeder Data Consistency', () => {
    test('should have consistent data across all seeder files', async () => {
      // Check if all seeders have been run
      const tableChecks = [
        { table: 'products', minCount: 5 },
        { table: 'areas', minCount: 3 },
        { table: 'estates', minCount: 10 },
        { table: 'estate_units', minCount: 20 },
        { table: 'price_trends', minCount: 15 },
        { table: 'demographics', minCount: 5 },
        { table: 'service_providers', minCount: 5 },
        { table: 'local_businesses', minCount: 10 },
        { table: 'customer_profiles', minCount: 8 },
        { table: 'network_infrastructure', minCount: 5 }
      ];

      for (const check of tableChecks) {
        const result = await client.query(`
          SELECT COUNT(*) as count FROM ${check.table}
        `);
        
        const count = parseInt(result.rows[0].count);
        expect(count).toBeGreaterThanOrEqual(check.minCount);
        console.log(`${check.table}: ${count} records`);
      }
    });

    test('should maintain referential integrity across seeders', async () => {
      // Check estates -> areas relationship
      const estateAreaCheck = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM estates e
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE a.id IS NULL
      `);
      expect(parseInt(estateAreaCheck.rows[0].orphan_count)).toBe(0);

      // Check estate_units -> estates relationship
      const unitEstateCheck = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM estate_units eu
        LEFT JOIN estates e ON eu.estate_id = e.id
        WHERE e.id IS NULL
      `);
      expect(parseInt(unitEstateCheck.rows[0].orphan_count)).toBe(0);

      // Check price_trends -> products relationship
      const priceProductCheck = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM price_trends pt
        LEFT JOIN products p ON pt.product_id = p.id
        WHERE p.id IS NULL
      `);
      expect(parseInt(priceProductCheck.rows[0].orphan_count)).toBe(0);

      // Check demographics -> estates relationship
      const demoEstateCheck = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM demographics d
        LEFT JOIN estates e ON d.estate_id = e.id
        WHERE e.id IS NULL
      `);
      expect(parseInt(demoEstateCheck.rows[0].orphan_count)).toBe(0);
    });

    test('should have consistent tier classifications across seeders', async () => {
      const result = await client.query(`
        SELECT 
          tier_classification,
          COUNT(*) as count,
          AVG(market_potential_score) as avg_score
        FROM estates
        WHERE tier_classification IS NOT NULL
        GROUP BY tier_classification
        ORDER BY avg_score DESC
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify tier classifications are valid
      const validTiers = ['platinum', 'gold', 'silver', 'bronze'];
      result.rows.forEach(row => {
        expect(validTiers).toContain(row.tier_classification);
        expect(parseInt(row.count)).toBeGreaterThan(0);
        expect(parseFloat(row.avg_score)).toBeGreaterThan(0);
      });

      // Verify platinum has higher scores than bronze
      if (result.rows.length >= 2) {
        const platinum = result.rows.find(r => r.tier_classification === 'platinum');
        const bronze = result.rows.find(r => r.tier_classification === 'bronze');
        
        if (platinum && bronze) {
          expect(parseFloat(platinum.avg_score)).toBeGreaterThan(parseFloat(bronze.avg_score));
        }
      }
    });
  });

  describe('Geospatial Data Accuracy', () => {
    test('should have valid coordinates for Nigeria in areas table', async () => {
      const result = await client.query(`
        SELECT 
          name,
          ST_X(geometry) as longitude,
          ST_Y(geometry) as latitude
        FROM areas
        WHERE geometry IS NOT NULL
        LIMIT 10
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      
      result.rows.forEach(row => {
        const lon = parseFloat(row.longitude);
        const lat = parseFloat(row.latitude);
        
        // Nigeria coordinates: 2.69°E to 14.58°E, 4.32°N to 13.89°N
        expect(lon).toBeGreaterThanOrEqual(2.69);
        expect(lon).toBeLessThanOrEqual(14.58);
        expect(lat).toBeGreaterThanOrEqual(4.32);
        expect(lat).toBeLessThanOrEqual(13.89);
      });
    });

    test('should have valid coordinates for Nigeria in demographics table', async () => {
      const result = await client.query(`
        SELECT 
          estate_id,
          ST_X(geometry) as longitude,
          ST_Y(geometry) as latitude
        FROM demographics
        WHERE geometry IS NOT NULL
        LIMIT 10
      `);

      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          const lon = parseFloat(row.longitude);
          const lat = parseFloat(row.latitude);
          
          // Nigeria coordinates: 2.69°E to 14.58°E, 4.32°N to 13.89°N
          expect(lon).toBeGreaterThanOrEqual(2.69);
          expect(lon).toBeLessThanOrEqual(14.58);
          expect(lat).toBeGreaterThanOrEqual(4.32);
          expect(lat).toBeLessThanOrEqual(13.89);
        });
      }
    });

    test('should have consistent spatial relationships between estates and areas', async () => {
      const result = await client.query(`
        SELECT 
          e.name as estate_name,
          a.name as area_name,
          ST_Distance(
            a.geometry, 
            d.geometry
          ) as distance
        FROM estates e
        JOIN areas a ON e.area_id = a.id
        JOIN demographics d ON e.id = d.estate_id
        WHERE a.geometry IS NOT NULL AND d.geometry IS NOT NULL
        LIMIT 10
      `);

      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          const distance = parseFloat(row.distance);
          // Estates should be within reasonable distance of their areas
          expect(distance).toBeLessThan(0.1); // Within 0.1 degrees
        });
      }
    });
  });

  describe('Business Logic Validation', () => {
    test('should have consistent market potential scores across tiers', async () => {
      const result = await client.query(`
        SELECT 
          tier_classification,
          MIN(market_potential_score) as min_score,
          MAX(market_potential_score) as max_score,
          AVG(market_potential_score) as avg_score
        FROM estates
        WHERE market_potential_score IS NOT NULL
        GROUP BY tier_classification
        ORDER BY avg_score DESC
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify score ranges make sense
      const tierRanges = {
        'platinum': { min: 80, max: 100 },
        'gold': { min: 60, max: 89 },
        'silver': { min: 40, max: 79 },
        'bronze': { min: 20, max: 59 }
      };

      result.rows.forEach(row => {
        const tier = row.tier_classification;
        const minScore = parseFloat(row.min_score);
        const maxScore = parseFloat(row.max_score);
        
        if (tierRanges[tier]) {
          expect(minScore).toBeGreaterThanOrEqual(tierRanges[tier].min);
          expect(maxScore).toBeLessThanOrEqual(tierRanges[tier].max);
        }
      });
    });

    test('should have consistent pricing tiers across products', async () => {
      const result = await client.query(`
        SELECT 
          pricing_tier,
          COUNT(*) as count,
          AVG(CAST(features->>'base_price' AS DECIMAL)) as avg_price
        FROM products
        WHERE pricing_tier IS NOT NULL AND features IS NOT NULL
        GROUP BY pricing_tier
        ORDER BY avg_price DESC
      `);

      if (result.rows.length > 0) {
        expect(result.rows.length).toBeGreaterThan(0);
        
        // Verify pricing tiers make sense
        const pricingTiers = ['premium', 'standard', 'basic'];
        result.rows.forEach(row => {
          expect(pricingTiers).toContain(row.pricing_tier);
          expect(parseInt(row.count)).toBeGreaterThan(0);
        });

        // Premium should have higher prices than basic
        if (result.rows.length >= 2) {
          const premium = result.rows.find(r => r.pricing_tier === 'premium');
          const basic = result.rows.find(r => r.pricing_tier === 'basic');
          
          if (premium && basic) {
            expect(parseFloat(premium.avg_price)).toBeGreaterThan(parseFloat(basic.avg_price));
          }
        }
      }
    });

    test('should have consistent service categories across products', async () => {
      const result = await client.query(`
        SELECT 
          service_category,
          COUNT(*) as count
        FROM products
        WHERE service_category IS NOT NULL
        GROUP BY service_category
        ORDER BY count DESC
      `);

      if (result.rows.length > 0) {
        expect(result.rows.length).toBeGreaterThan(0);
        
        // Verify service categories are valid
        const validCategories = ['internet', 'cable_tv', 'telephony', 'security'];
        result.rows.forEach(row => {
          expect(validCategories).toContain(row.service_category);
          expect(parseInt(row.count)).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Data Quality Validation', () => {
    test('should have no duplicate records in critical tables', async () => {
      // Check estates table
      const estateDuplicates = await client.query(`
        SELECT name, COUNT(*) as count
        FROM estates
        GROUP BY name
        HAVING COUNT(*) > 1
      `);
      expect(estateDuplicates.rows.length).toBe(0);

      // Check areas table
      const areaDuplicates = await client.query(`
        SELECT name, state, COUNT(*) as count
        FROM areas
        GROUP BY name, state
        HAVING COUNT(*) > 1
      `);
      expect(areaDuplicates.rows.length).toBe(0);

      // Check products table
      const productDuplicates = await client.query(`
        SELECT slug, COUNT(*) as count
        FROM products
        GROUP BY slug
        HAVING COUNT(*) > 1
      `);
      expect(productDuplicates.rows.length).toBe(0);
    });

    test('should have consistent data types across seeders', async () => {
      // Check numeric fields
      const numericCheck = await client.query(`
        SELECT 
          COUNT(*) as invalid_count
        FROM estates
        WHERE market_potential_score IS NOT NULL 
        AND (market_potential_score < 0 OR market_potential_score > 100)
      `);
      expect(parseInt(numericCheck.rows[0].invalid_count)).toBe(0);

      // Check enum fields
      const enumCheck = await client.query(`
        SELECT 
          COUNT(*) as invalid_count
        FROM estates
        WHERE tier_classification IS NOT NULL
        AND tier_classification NOT IN ('platinum', 'gold', 'silver', 'bronze')
      `);
      expect(parseInt(enumCheck.rows[0].invalid_count)).toBe(0);
    });

    test('should have realistic data values', async () => {
      // Check population values
      const populationCheck = await client.query(`
        SELECT 
          COUNT(*) as invalid_count
        FROM demographics
        WHERE population IS NOT NULL
        AND (population < 100 OR population > 100000)
      `);
      expect(parseInt(populationCheck.rows[0].invalid_count)).toBe(0);

      // Check price values
      const priceCheck = await client.query(`
        SELECT 
          COUNT(*) as invalid_count
        FROM estate_units
        WHERE rent_price IS NOT NULL
        AND (rent_price < 10000 OR rent_price > 10000000)
      `);
      expect(parseInt(priceCheck.rows[0].invalid_count)).toBe(0);
    });
  });

  describe('Seeder Orchestration', () => {
    test('should have all required tables populated', async () => {
      const requiredTables = [
        'products', 'areas', 'estates', 'estate_units', 'price_trends',
        'demographics', 'service_providers', 'provider_coverage',
        'local_businesses', 'business_categories', 'customer_profiles',
        'usage_patterns', 'network_infrastructure', 'revenue_analytics'
      ];

      for (const table of requiredTables) {
        const result = await client.query(`
          SELECT COUNT(*) as count FROM ${table}
        `);
        
        const count = parseInt(result.rows[0].count);
        expect(count).toBeGreaterThan(0);
        console.log(`${table}: ${count} records`);
      }
    });

    test('should have consistent timestamps across seeders', async () => {
      const timestampCheck = await client.query(`
        SELECT 
          table_name,
          MIN(created_at) as earliest_record,
          MAX(created_at) as latest_record
        FROM (
          SELECT 'estates' as table_name, created_at FROM estates
          UNION ALL
          SELECT 'areas' as table_name, created_at FROM areas
          UNION ALL
          SELECT 'products' as table_name, created_at FROM products
        ) all_tables
        GROUP BY table_name
      `);

      expect(timestampCheck.rows.length).toBeGreaterThan(0);
      
      // All tables should have recent timestamps
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      timestampCheck.rows.forEach(row => {
        const latest = new Date(row.latest_record);
        expect(latest).toBeGreaterThan(oneDayAgo);
      });
    });
  });
}); 
