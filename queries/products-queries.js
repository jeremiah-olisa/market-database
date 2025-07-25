import pool from "../utils/pool.js";

export async function runProductQueries() {
  console.log("\n🛍️ PRODUCT QUERIES");
  console.log("=".repeat(50));

  try {
    // Query 1: All products
    console.log("\n1️⃣ All Products:");
    const allProducts = await pool.query(`
      SELECT id, name, slug, status, created_at 
      FROM products 
      ORDER BY name
    `);
    console.table(allProducts.rows);

    // Query 2: Products by status
    console.log("\n2️⃣ Products by Status:");
    const productsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM products 
      GROUP BY status 
      ORDER BY count DESC
    `);
    console.table(productsByStatus.rows);

    // Query 3: Products with estate count
    console.log("\n3️⃣ Products with Estate Count:");
    const productsWithEstates = await pool.query(`
      SELECT 
        p.name as product_name,
        p.status,
        COUNT(e.id) as estate_count,
        SUM(e.unit_count) as total_units
      FROM products p
      LEFT JOIN estates e ON p.id = e.product_id
      GROUP BY p.id, p.name, p.status
      ORDER BY estate_count DESC
    `);
    console.table(productsWithEstates.rows);

    // Query 4: Products with average rent prices
    console.log("\n4️⃣ Products with Average Rent Prices:");
    const productsWithRent = await pool.query(`
      SELECT 
        p.name as product_name,
        COUNT(DISTINCT pt.id) as price_records,
        AVG(pt.price) as avg_rent_price,
        MIN(pt.price) as min_rent_price,
        MAX(pt.price) as max_rent_price
      FROM products p
      LEFT JOIN price_trends pt ON p.id = pt.product_id AND pt.price_type = 'rent'
      GROUP BY p.id, p.name
      ORDER BY avg_rent_price DESC
    `);
    console.table(productsWithRent.rows);

    console.log("✅ Product queries completed successfully!");
  } catch (error) {
    console.error("❌ Error running product queries:", error);
    throw error;
  }
} 