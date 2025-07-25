import { generateInsertData } from "../utils/index.js";

const priceTrendsData = [
  { product_id: 1, area_id: 1, unit_type: "2-bedroom", price_type: "rent", price: 5000000.00, currency: "NGN", period: "2025-06-01", source: "field_agent" },
  { product_id: 1, area_id: 1, unit_type: "3-bedroom", price_type: "sale", price: 120000000.00, currency: "NGN", period: "2025-06-01", source: "scraped_site" },
  { product_id: 1, area_id: 2, unit_type: "duplex", price_type: "rent", price: 4000000.00, currency: "NGN", period: "2025-07-01", source: "field_agent" },
  { product_id: 2, area_id: 4, unit_type: "1-bedroom", price_type: "rent", price: 3500000.00, currency: "NGN", period: "2025-07-01", source: "field_agent" },
  { product_id: 2, area_id: 4, unit_type: "4-bedroom", price_type: "sale", price: 150000000.00, currency: "NGN", period: "2025-07-01", source: "scraped_site" },
  { product_id: 3, area_id: 5, unit_type: "3-bedroom", price_type: "rent", price: 4500000.00, currency: "NGN", period: "2025-07-01", source: "field_agent" },
  { product_id: 4, area_id: 6, unit_type: "2-bedroom", price_type: "rent", price: 2500000.00, currency: "NGN", period: "2025-07-01", source: "field_agent" },
  { product_id: 5, area_id: 7, unit_type: "5-bedroom", price_type: "sale", price: 200000000.00, currency: "NGN", period: "2025-07-01", source: "scraped_site" }
];

async function seedPriceTrends(client) {
  console.log(`🌱 Seeding price_trends...`);
  
  const { placeholders, values } = generateInsertData(priceTrendsData, [
    "product_id", "area_id", "unit_type", "price_type", 
    "price", "currency", "period", "source"
  ]);
  
  const result = await client.query(
    `INSERT INTO price_trends (product_id, area_id, unit_type, price_type, price, currency, period, source) VALUES ${placeholders}`,
    values
  );
  
  console.log(`✅ Seeded price_trends: ${result.rowCount} rows`);
  return result;
}

export { seedPriceTrends, priceTrendsData }; 