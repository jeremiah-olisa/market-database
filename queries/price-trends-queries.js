import pool from "../utils/pool.js";

export async function runPriceTrendQueries() {
  console.log("\n💰 PRICE TREND QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: All price trends
    console.log("\n1️⃣ All Price Trends:");
    const allPriceTrends = await pool.query(`
      SELECT 
        pt.id, pt.unit_type, pt.price_type, pt.price, pt.currency, pt.period,
        p.name as product_name,
        a.name as area_name
      FROM price_trends pt
      JOIN products p ON pt.product_id = p.id
      JOIN areas a ON pt.area_id = a.id
      ORDER BY pt.period DESC, pt.price DESC
    `);
    console.table(allPriceTrends.rows);

    // Query 2: Price trends by type
    console.log("\n2️⃣ Price Trends by Type:");
    const priceTrendsByType = await pool.query(`
      SELECT 
        price_type, 
        COUNT(*) as count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM price_trends 
      GROUP BY price_type 
      ORDER BY avg_price DESC
    `);
    console.table(priceTrendsByType.rows);

    // Query 3: Price trends by unit type
    console.log("\n3️⃣ Price Trends by Unit Type:");
    const priceTrendsByUnitType = await pool.query(`
      SELECT 
        unit_type, 
        price_type,
        COUNT(*) as count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM price_trends 
      GROUP BY unit_type, price_type
      ORDER BY unit_type, price_type
    `);
    console.table(priceTrendsByUnitType.rows);

    // Query 4: Price trends by area
    console.log("\n4️⃣ Price Trends by Area:");
    const priceTrendsByArea = await pool.query(`
      SELECT 
        a.name as area_name,
        pt.price_type,
        COUNT(pt.id) as price_records,
        AVG(pt.price) as avg_price,
        MIN(pt.price) as min_price,
        MAX(pt.price) as max_price
      FROM price_trends pt
      JOIN areas a ON pt.area_id = a.id
      GROUP BY a.id, a.name, pt.price_type
      ORDER BY avg_price DESC
    `);
    console.table(priceTrendsByArea.rows);

    // Query 5: Monthly price trends
    console.log("\n5️⃣ Monthly Price Trends:");
    const monthlyPriceTrends = await pool.query(`
      SELECT 
        DATE_TRUNC('month', period) as month,
        price_type,
        unit_type,
        COUNT(*) as data_points,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM price_trends 
      GROUP BY DATE_TRUNC('month', period), price_type, unit_type
      ORDER BY month DESC, avg_price DESC
    `);
    console.table(monthlyPriceTrends.rows);

    // Query 6: Price comparison (rent vs sale)
    console.log("\n6️⃣ Price Comparison (Rent vs Sale):");
    const priceComparison = await pool.query(`
      SELECT 
        a.name as area_name,
        pt.unit_type,
        AVG(CASE WHEN pt.price_type = 'rent' THEN pt.price END) as avg_rent_price,
        AVG(CASE WHEN pt.price_type = 'sale' THEN pt.price END) as avg_sale_price,
        COUNT(CASE WHEN pt.price_type = 'rent' THEN 1 END) as rent_records,
        COUNT(CASE WHEN pt.price_type = 'sale' THEN 1 END) as sale_records
      FROM price_trends pt
      JOIN areas a ON pt.area_id = a.id
      GROUP BY a.id, a.name, pt.unit_type
      ORDER BY avg_rent_price DESC
    `);
    console.table(priceComparison.rows);

    console.log("✅ Price trend queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running price trend queries:", error);
    throw error;
  }
} 