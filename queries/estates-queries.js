import pool from "../utils/pool.js";

export async function runEstateQueries() {
  console.log("\n🏘️ ESTATE QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: All estates
    console.log("\n1️⃣ All Estates:");
    const allEstates = await pool.query(`
      SELECT 
        e.id, e.name, e.estate_type, e.unit_count, e.occupancy_status, 
        e.classification, e.gated, e.has_security,
        p.name as product_name,
        a.name as area_name
      FROM estates e
      JOIN products p ON e.product_id = p.id
      JOIN areas a ON e.area_id = a.id
      ORDER BY e.name
    `);
    console.table(allEstates.rows);

    // Query 2: Estates by type
    console.log("\n2️⃣ Estates by Type:");
    const estatesByType = await pool.query(`
      SELECT 
        estate_type, 
        COUNT(*) as count,
        AVG(unit_count) as avg_units,
        SUM(unit_count) as total_units
      FROM estates 
      GROUP BY estate_type 
      ORDER BY count DESC
    `);
    console.table(estatesByType.rows);

    // Query 3: Estates by classification
    console.log("\n3️⃣ Estates by Classification:");
    const estatesByClassification = await pool.query(`
      SELECT 
        classification, 
        COUNT(*) as count,
        AVG(unit_count) as avg_units,
        COUNT(CASE WHEN gated = true THEN 1 END) as gated_count,
        COUNT(CASE WHEN has_security = true THEN 1 END) as security_count
      FROM estates 
      GROUP BY classification 
      ORDER BY count DESC
    `);
    console.table(estatesByClassification.rows);

    // Query 4: Estates by occupancy status
    console.log("\n4️⃣ Estates by Occupancy Status:");
    const estatesByOccupancy = await pool.query(`
      SELECT 
        occupancy_status, 
        COUNT(*) as count,
        AVG(unit_count) as avg_units,
        SUM(unit_count) as total_units
      FROM estates 
      GROUP BY occupancy_status 
      ORDER BY count DESC
    `);
    console.table(estatesByOccupancy.rows);

    // Query 5: Estates with security features
    console.log("\n5️⃣ Estates with Security Features:");
    const estatesWithSecurity = await pool.query(`
      SELECT 
        e.name as estate_name,
        e.classification,
        e.estate_type,
        e.unit_count,
        e.gated,
        e.has_security,
        a.name as area_name,
        p.name as product_name
      FROM estates e
      JOIN areas a ON e.area_id = a.id
      JOIN products p ON e.product_id = p.id
      WHERE e.gated = true OR e.has_security = true
      ORDER BY e.gated DESC, e.has_security DESC
    `);
    console.table(estatesWithSecurity.rows);

    // Query 6: Luxury estates analysis
    console.log("\n6️⃣ Luxury Estates Analysis:");
    const luxuryEstates = await pool.query(`
      SELECT 
        e.name as estate_name,
        e.estate_type,
        e.unit_count,
        e.occupancy_status,
        e.gated,
        e.has_security,
        a.name as area_name,
        p.name as product_name
      FROM estates e
      JOIN areas a ON e.area_id = a.id
      JOIN products p ON e.product_id = p.id
      WHERE e.classification = 'luxury'
      ORDER BY e.unit_count DESC
    `);
    console.table(luxuryEstates.rows);

    console.log("✅ Estate queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running estate queries:", error);
    throw error;
  }
} 