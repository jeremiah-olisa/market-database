import pool from "../utils/pool.js";

export async function runAggregatedViewQueries() {
  console.log("\n📊 AGGREGATED VIEW QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: Estate summary by area
    console.log("\n1️⃣ Estate Summary by Area:");
    const estateSummary = await pool.query(`
      SELECT * FROM estate_summary_by_area 
      ORDER BY total_estates DESC 
      LIMIT 10
    `);
    console.table(estateSummary.rows);

    // Query 2: Price trends summary
    console.log("\n2️⃣ Price Trends Summary:");
    const priceTrends = await pool.query(`
      SELECT * FROM price_trends_summary 
      WHERE price_type = 'rent' 
      ORDER BY avg_price DESC 
      LIMIT 10
    `);
    console.table(priceTrends.rows);

    // Query 3: Market performance by product
    console.log("\n3️⃣ Market Performance by Product:");
    const marketPerformance = await pool.query(`
      SELECT * FROM market_performance_by_product 
      ORDER BY estates_count DESC
    `);
    console.table(marketPerformance.rows);

    // Query 4: Monthly price trends with change percentage
    console.log("\n4️⃣ Monthly Price Trends:");
    const monthlyTrends = await pool.query(`
      SELECT 
        month, 
        price_type, 
        unit_type, 
        area_name, 
        avg_price, 
        price_change_percent
      FROM monthly_price_trends 
      WHERE price_change_percent IS NOT NULL
      ORDER BY month DESC, price_change_percent DESC 
      LIMIT 15
    `);
    console.table(monthlyTrends.rows);

    // Query 5: Occupancy analysis
    console.log("\n5️⃣ Occupancy Analysis:");
    const occupancyAnalysis = await pool.query(`
      SELECT * FROM occupancy_analysis 
      ORDER BY occupancy_rate_percent DESC
    `);
    console.table(occupancyAnalysis.rows);

    // Query 6: Top performing areas
    console.log("\n6️⃣ Top Performing Areas:");
    const topAreas = await pool.query(`
      SELECT 
        area_name,
        total_estates,
        total_units,
        luxury_estates,
        gated_estates,
        ROUND((luxury_estates::DECIMAL / total_estates * 100), 2) as luxury_percentage
      FROM estate_summary_by_area 
      WHERE total_estates > 0
      ORDER BY luxury_percentage DESC, total_estates DESC
      LIMIT 10
    `);
    console.table(topAreas.rows);

    // Query 7: Price trend insights
    console.log("\n7️⃣ Price Trend Insights:");
    const priceInsights = await pool.query(`
      SELECT 
        unit_type,
        price_type,
        area_name,
        avg_price,
        data_points,
        ROUND((max_price - min_price) / avg_price * 100, 2) as price_volatility_percent
      FROM price_trends_summary 
      WHERE data_points >= 2
      ORDER BY price_volatility_percent DESC
      LIMIT 10
    `);
    console.table(priceInsights.rows);

    console.log("✅ Aggregated view queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running aggregated view queries:", error);
    throw error;
  }
} 