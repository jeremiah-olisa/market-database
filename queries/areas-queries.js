import pool from "../utils/pool.js";

export async function runAreaQueries() {
  console.log("\n🗺️ AREA QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: All areas
    console.log("\n1️⃣ All Areas:");
    const allAreas = await pool.query(`
      SELECT id, name, state, geo_code, created_at 
      FROM areas 
      ORDER BY state, name
    `);
    console.table(allAreas.rows);

    // Query 2: Areas by state
    console.log("\n2️⃣ Areas by State:");
    const areasByState = await pool.query(`
      SELECT state, COUNT(*) as area_count
      FROM areas 
      GROUP BY state 
      ORDER BY area_count DESC
    `);
    console.table(areasByState.rows);

    // Query 3: Areas with estate count
    console.log("\n3️⃣ Areas with Estate Count:");
    const areasWithEstates = await pool.query(`
      SELECT 
        a.name as area_name,
        a.state,
        COUNT(e.id) as estate_count,
        SUM(e.unit_count) as total_units,
        AVG(e.unit_count) as avg_units_per_estate
      FROM areas a
      LEFT JOIN estates e ON a.id = e.area_id
      GROUP BY a.id, a.name, a.state
      ORDER BY estate_count DESC
    `);
    console.table(areasWithEstates.rows);

    // Query 4: Areas with price statistics
    console.log("\n4️⃣ Areas with Price Statistics:");
    const areasWithPrices = await pool.query(`
      SELECT 
        a.name as area_name,
        a.state,
        COUNT(pt.id) as price_records,
        AVG(pt.price) as avg_price,
        MIN(pt.price) as min_price,
        MAX(pt.price) as max_price,
        COUNT(DISTINCT pt.unit_type) as unit_types_available
      FROM areas a
      LEFT JOIN price_trends pt ON a.id = pt.area_id
      GROUP BY a.id, a.name, a.state
      ORDER BY avg_price DESC
    `);
    console.table(areasWithPrices.rows);

    // Query 5: Areas with occupancy analysis
    console.log("\n5️⃣ Areas with Occupancy Analysis:");
    const areasWithOccupancy = await pool.query(`
      SELECT 
        a.name as area_name,
        a.state,
        COUNT(e.id) as total_estates,
        COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as occupied_estates,
        COUNT(CASE WHEN e.occupancy_status = 'vacant' THEN 1 END) as vacant_estates,
        ROUND(
          (COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::DECIMAL / COUNT(e.id) * 100), 2
        ) as occupancy_rate_percent
      FROM areas a
      LEFT JOIN estates e ON a.id = e.area_id
      GROUP BY a.id, a.name, a.state
      ORDER BY occupancy_rate_percent DESC
    `);
    console.table(areasWithOccupancy.rows);

    console.log("✅ Area queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running area queries:", error);
    throw error;
  }
} 