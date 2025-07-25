import { generateInsertData } from "../utils/index.js";

const estateUnitsData = [
  { estate_id: 1, unit_type: "2-bedroom", floor_level: "Ground", status: "occupied", last_surveyed_at: "2025-07-01", rent_price: 5000000.00, sale_price: null, notes: "Fully furnished" },
  { estate_id: 1, unit_type: "3-bedroom", floor_level: "First", status: "vacant", last_surveyed_at: "2025-06-15", rent_price: 6000000.00, sale_price: 120000000.00, notes: null },
  { estate_id: 2, unit_type: "duplex", floor_level: "N/A", status: "vacant", last_surveyed_at: "2025-07-10", rent_price: 4000000.00, sale_price: null, notes: "Newly renovated" },
  { estate_id: 3, unit_type: "bungalow", floor_level: "N/A", status: "under_construction", last_surveyed_at: null, rent_price: null, sale_price: null, notes: "Under development" },
  { estate_id: 4, unit_type: "1-bedroom", floor_level: "Ground", status: "occupied", last_surveyed_at: "2025-07-05", rent_price: 3500000.00, sale_price: null, notes: "Studio apartment" },
  { estate_id: 4, unit_type: "4-bedroom", floor_level: "Penthouse", status: "vacant", last_surveyed_at: "2025-06-20", rent_price: 8000000.00, sale_price: 150000000.00, notes: "Luxury penthouse" },
  { estate_id: 5, unit_type: "3-bedroom", floor_level: "Ground", status: "occupied", last_surveyed_at: "2025-07-12", rent_price: 4500000.00, sale_price: null, notes: "Family home" },
  { estate_id: 6, unit_type: "2-bedroom", floor_level: "N/A", status: "vacant", last_surveyed_at: "2025-06-25", rent_price: 2500000.00, sale_price: null, notes: "Affordable housing" },
  { estate_id: 7, unit_type: "5-bedroom", floor_level: "First", status: "vacant", last_surveyed_at: "2025-07-08", rent_price: 10000000.00, sale_price: 200000000.00, notes: "Executive mansion" },
  { estate_id: 8, unit_type: "1-bedroom", floor_level: "Ground", status: "under_construction", last_surveyed_at: null, rent_price: null, sale_price: null, notes: "Tech startup space" }
];

async function seedEstateUnits(client) {
  console.log(`🌱 Seeding estate_units...`);
  
  const { placeholders, values } = generateInsertData(estateUnitsData, [
    "estate_id", "unit_type", "floor_level", "status", 
    "last_surveyed_at", "rent_price", "sale_price", "notes"
  ]);
  
  const result = await client.query(
    `INSERT INTO estate_units (estate_id, unit_type, floor_level, status, last_surveyed_at, rent_price, sale_price, notes) VALUES ${placeholders}`,
    values
  );
  
  console.log(`✅ Seeded estate_units: ${result.rowCount} rows`);
  return result;
}

export { seedEstateUnits, estateUnitsData }; 