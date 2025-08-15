import pool from '../../utils/pool.js';

describe('Data Integrity Tests', () => {
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

  describe('Foreign Key Integrity', () => {
    test('should maintain referential integrity between estates and areas', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM estates e
        LEFT JOIN areas a ON e.area_id = a.id
        WHERE a.id IS NULL
      `);
      
      expect(result.rows[0].orphan_count).toBe('0');
    });

    test('should maintain referential integrity between estate_units and estates', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM estate_units eu
        LEFT JOIN estates e ON eu.estate_id = e.id
        WHERE e.id IS NULL
      `);
      
      expect(result.rows[0].orphan_count).toBe('0');
    });

    test('should maintain referential integrity between price_trends and products', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM price_trends pt
        LEFT JOIN products p ON pt.product_id = p.id
        WHERE p.id IS NULL
      `);
      
      expect(result.rows[0].orphan_count).toBe('0');
    });

    test('should maintain referential integrity between demographics and estates', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM demographics d
        LEFT JOIN estates e ON d.estate_id = e.id
        WHERE e.id IS NULL
      `);
      
      expect(result.rows[0].orphan_count).toBe('0');
    });

    test('should maintain referential integrity between customer_profiles and estates', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as orphan_count
        FROM customer_profiles cp
        LEFT JOIN estates e ON cp.estate_id = e.id
        WHERE e.id IS NULL
      `);
      
      expect(result.rows[0].orphan_count).toBe('0');
    });
  });

  describe('Data Consistency', () => {
    test('should have consistent tier_classification values in estates table', async () => {
      const result = await client.query(`
        SELECT tier_classification, COUNT(*) as count
        FROM estates
        WHERE tier_classification IS NOT NULL
        GROUP BY tier_classification
      `);
      
      result.rows.forEach(row => {
        expect(['platinum', 'gold', 'silver', 'bronze']).toContain(row.tier_classification);
        expect(parseInt(row.count)).toBeGreaterThan(0);
      });
    });

    test('should have consistent estate_type values in estates table', async () => {
      const result = await client.query(`
        SELECT estate_type, COUNT(*) as count
        FROM estates
        GROUP BY estate_type
      `);
      
      result.rows.forEach(row => {
        expect(['residential', 'commercial', 'mixed']).toContain(row.estate_type);
        expect(parseInt(row.count)).toBeGreaterThan(0);
      });
    });

    test('should have consistent classification values in estates table', async () => {
      const result = await client.query(`
        SELECT classification, COUNT(*) as count
        FROM estates
        GROUP BY classification
      `);
      
      result.rows.forEach(row => {
        expect(['luxury', 'standard', 'budget']).toContain(row.classification);
        expect(parseInt(row.count)).toBeGreaterThan(0);
      });
    });

    test('should have consistent service_category values in products table', async () => {
      const result = await client.query(`
        SELECT service_category, COUNT(*) as count
        FROM products
        WHERE service_category IS NOT NULL
        GROUP BY service_category
      `);
      
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          expect(['internet', 'cable_tv', 'telephony', 'security']).toContain(row.service_category);
          expect(parseInt(row.count)).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Data Completeness', () => {
    test('should have required fields populated in estates table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as null_count
        FROM estates
        WHERE name IS NULL OR estate_type IS NULL OR area_id IS NULL
      `);
      
      expect(result.rows[0].null_count).toBe('0');
    });

    test('should have required fields populated in areas table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as null_count
        FROM areas
        WHERE name IS NULL OR state IS NULL OR geo_code IS NULL
      `);
      
      expect(result.rows[0].null_count).toBe('0');
    });

    test('should have required fields populated in products table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as null_count
        FROM products
        WHERE name IS NULL OR slug IS NULL OR description IS NULL
      `);
      
      expect(result.rows[0].null_count).toBe('0');
    });

    test('should have required fields populated in estate_units table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as null_count
        FROM estate_units
        WHERE estate_id IS NULL OR unit_type IS NULL OR status IS NULL
      `);
      
      expect(result.rows[0].null_count).toBe('0');
    });
  });

  describe('Data Validation', () => {
    test('should have valid market_potential_score range in estates table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as invalid_count
        FROM estates
        WHERE market_potential_score IS NOT NULL 
        AND (market_potential_score < 0 OR market_potential_score > 100)
      `);
      
      expect(result.rows[0].invalid_count).toBe('0');
    });

    test('should have valid competitive_intensity range in estates table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as invalid_count
        FROM estates
        WHERE competitive_intensity IS NOT NULL 
        AND (competitive_intensity < 1 OR competitive_intensity > 10)
      `);
      
      expect(result.rows[0].invalid_count).toBe('0');
    });

    test('should have valid population_density range in areas table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as invalid_count
        FROM areas
        WHERE population_density IS NOT NULL 
        AND (population_density < 0 OR population_density > 100000)
      `);
      
      expect(result.rows[0].invalid_count).toBe('0');
    });

    test('should have valid economic_activity_score range in areas table', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as invalid_count
        FROM areas
        WHERE economic_activity_score IS NOT NULL 
        AND (economic_activity_score < 1 OR economic_activity_score > 10)
      `);
      
      expect(result.rows[0].invalid_count).toBe('0');
    });
  });

  describe('Business Logic Validation', () => {
    test('should have estates with valid tier_classification based on market_potential_score', async () => {
      const result = await client.query(`
        SELECT 
          tier_classification,
          AVG(market_potential_score) as avg_score,
          COUNT(*) as count
        FROM estates
        WHERE tier_classification IS NOT NULL AND market_potential_score IS NOT NULL
        GROUP BY tier_classification
        ORDER BY avg_score DESC
      `);
      
      if (result.rows.length >= 2) {
        // Platinum should have higher scores than bronze
        const platinum = result.rows.find(r => r.tier_classification === 'platinum');
        const bronze = result.rows.find(r => r.tier_classification === 'bronze');
        
        if (platinum && bronze) {
          expect(parseFloat(platinum.avg_score)).toBeGreaterThan(parseFloat(bronze.avg_score));
        }
      }
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
      
      if (result.rows.length >= 2) {
        // Premium should have higher prices than basic
        const premium = result.rows.find(r => r.pricing_tier === 'premium');
        const basic = result.rows.find(r => r.pricing_tier === 'basic');
        
        if (premium && basic) {
          expect(parseFloat(premium.avg_price)).toBeGreaterThan(parseFloat(basic.avg_price));
        }
      }
    });
  });
}); 
