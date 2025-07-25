import { generateInsertData } from "../utils/index.js";

const estatesData = [
  { name: "Banana Island", estate_type: "block_of_flats", product_id: 1, area_id: 1, unit_count: 50, occupancy_status: "fully_occupied", classification: "luxury", gated: true, has_security: true },
  { name: "Ikeja GRA", estate_type: "duplex", product_id: 1, area_id: 2, unit_count: 30, occupancy_status: "vacant", classification: "middle_income", gated: true, has_security: false },
  { name: "Garki Estate", estate_type: "bungalow", product_id: 1, area_id: 3, unit_count: 20, occupancy_status: "under_construction", classification: "low_income", gated: false, has_security: false },
  { name: "Lekki Phase 1", estate_type: "block_of_flats", product_id: 2, area_id: 4, unit_count: 75, occupancy_status: "fully_occupied", classification: "luxury", gated: true, has_security: true },
  { name: "Wuse Zone 2", estate_type: "duplex", product_id: 3, area_id: 5, unit_count: 25, occupancy_status: "vacant", classification: "middle_income", gated: true, has_security: true },
  { name: "Surulere Estate", estate_type: "bungalow", product_id: 4, area_id: 6, unit_count: 40, occupancy_status: "fully_occupied", classification: "low_income", gated: false, has_security: false },
  { name: "Maitama Gardens", estate_type: "block_of_flats", product_id: 5, area_id: 7, unit_count: 60, occupancy_status: "vacant", classification: "luxury", gated: true, has_security: true },
  { name: "Yaba Tech Hub", estate_type: "duplex", product_id: 6, area_id: 8, unit_count: 35, occupancy_status: "under_construction", classification: "middle_income", gated: true, has_security: true }
];

async function seedEstates(client) {
  console.log(`🌱 Seeding estates...`);
  
  const { placeholders, values } = generateInsertData(estatesData, [
    "name", "estate_type", "product_id", "area_id", "unit_count", 
    "occupancy_status", "classification", "gated", "has_security"
  ]);
  
  const result = await client.query(
    `INSERT INTO estates (name, estate_type, product_id, area_id, unit_count, occupancy_status, classification, gated, has_security) VALUES ${placeholders}`,
    values
  );
  
  console.log(`✅ Seeded estates: ${result.rowCount} rows`);
  return result;
}

export { seedEstates, estatesData }; 