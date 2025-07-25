import pool from "../utils/pool.js";

export async function runEstateUnitQueries() {
  console.log("\n🏠 ESTATE UNIT QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: All estate units
    console.log("\n1️⃣ All Estate Units:");
    const allUnits = await pool.query(`
      SELECT 
        eu.id, eu.unit_type, eu.floor_level, eu.status, 
        eu.rent_price, eu.sale_price,
        e.name as estate_name,
        a.name as area_name
      FROM estate_units eu
      JOIN estates e ON eu.estate_id = e.id
      JOIN areas a ON e.area_id = a.id
      ORDER BY eu.unit_type, eu.rent_price DESC
    `);
    console.table(allUnits.rows);

    // Query 2: Units by type
    console.log("\n2️⃣ Units by Type:");
    const unitsByType = await pool.query(`
      SELECT 
        unit_type, 
        COUNT(*) as count,
        AVG(rent_price) as avg_rent_price,
        AVG(sale_price) as avg_sale_price,
        MIN(rent_price) as min_rent_price,
        MAX(rent_price) as max_rent_price
      FROM estate_units 
      GROUP BY unit_type 
      ORDER BY count DESC
    `);
    console.table(unitsByType.rows);

    // Query 3: Units by status
    console.log("\n3️⃣ Units by Status:");
    const unitsByStatus = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count,
        AVG(rent_price) as avg_rent_price,
        AVG(sale_price) as avg_sale_price
      FROM estate_units 
      GROUP BY status 
      ORDER BY count DESC
    `);
    console.table(unitsByStatus.rows);

    // Query 4: Vacant units with prices
    console.log("\n4️⃣ Vacant Units with Prices:");
    const vacantUnits = await pool.query(`
      SELECT 
        eu.unit_type,
        eu.floor_level,
        eu.rent_price,
        eu.sale_price,
        e.name as estate_name,
        e.classification,
        a.name as area_name
      FROM estate_units eu
      JOIN estates e ON eu.estate_id = e.id
      JOIN areas a ON e.area_id = a.id
      WHERE eu.status = 'vacant'
      ORDER BY eu.rent_price ASC
    `);
    console.table(vacantUnits.rows);

    // Query 5: Units by floor level
    console.log("\n5️⃣ Units by Floor Level:");
    const unitsByFloor = await pool.query(`
      SELECT 
        floor_level, 
        COUNT(*) as count,
        AVG(rent_price) as avg_rent_price,
        AVG(sale_price) as avg_sale_price
      FROM estate_units 
      GROUP BY floor_level 
      ORDER BY floor_level
    `);
    console.table(unitsByFloor.rows);

    // Query 6: Price range analysis
    console.log("\n6️⃣ Price Range Analysis:");
    const priceRangeAnalysis = await pool.query(`
      SELECT 
        unit_type,
        COUNT(*) as total_units,
        COUNT(CASE WHEN rent_price <= 5000000 THEN 1 END) as affordable_units,
        COUNT(CASE WHEN rent_price > 5000000 AND rent_price <= 10000000 THEN 1 END) as mid_range_units,
        COUNT(CASE WHEN rent_price > 10000000 THEN 1 END) as luxury_units,
        ROUND(AVG(rent_price), 2) as avg_rent_price
      FROM estate_units 
      GROUP BY unit_type 
      ORDER BY avg_rent_price DESC
    `);
    console.table(priceRangeAnalysis.rows);

    console.log("✅ Estate unit queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running estate unit queries:", error);
    throw error;
  }
} 