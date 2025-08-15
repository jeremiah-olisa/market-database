import pool from '../../utils/pool.js';

describe('Business Value Validation Tests', () => {
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

  describe('Market Intelligence Capabilities', () => {
    test('should provide comprehensive market analysis', async () => {
      const result = await client.query(`
        SELECT 
          COUNT(DISTINCT e.id) as total_estates,
          COUNT(DISTINCT e.area_id) as total_areas,
          COUNT(DISTINCT e.tier_classification) as total_tiers,
          AVG(e.market_potential_score) as avg_market_potential,
          COUNT(DISTINCT sp.id) as total_providers
        FROM estates e
        LEFT JOIN market_share_data msd ON e.id = msd.estate_id
        LEFT JOIN service_providers sp ON msd.provider_id = sp.id
      `);
      
      expect(result.rows.length).toBe(1);
      const row = result.rows[0];
      expect(parseInt(row.total_estates)).toBeGreaterThan(0);
      expect(parseInt(row.total_areas)).toBeGreaterThan(0);
      expect(parseInt(row.total_tiers)).toBeGreaterThan(0);
      expect(parseFloat(row.avg_market_potential)).toBeGreaterThan(0);
    });

    test('should identify high-potential investment areas', async () => {
      const result = await client.query(`
        SELECT 
          a.name as area_name,
          COUNT(e.id) as estate_count,
          AVG(e.market_potential_score) as avg_potential,
          COUNT(DISTINCT sp.id) as provider_count,
          SUM(ra.amount) as total_revenue
        FROM areas a
        JOIN estates e ON a.id = e.area_id
        LEFT JOIN market_share_data msd ON e.id = msd.estate_id
        LEFT JOIN service_providers sp ON msd.provider_id = sp.id
        LEFT JOIN revenue_analytics ra ON e.id = ra.estate_id
        GROUP BY a.id, a.name
        HAVING AVG(e.market_potential_score) > 70
        ORDER BY avg_potential DESC
        LIMIT 10
      `);
      
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Verify high-potential areas have good metrics
      result.rows.forEach(row => {
        expect(parseFloat(row.avg_potential)).toBeGreaterThan(70);
        expect(parseInt(row.estate_count)).toBeGreaterThan(0);
      });
    });
  });
});
