import { generateInsertData } from "../utils/index.js";

const areasData = [
  { name: "Victoria Island", state: "Lagos", geo_code: "VI001" },
  { name: "Ikeja", state: "Lagos", geo_code: "IK002" },
  { name: "Garki", state: "Abuja", geo_code: "GK001" },
  { name: "Lekki", state: "Lagos", geo_code: "LK003" },
  { name: "Wuse", state: "Abuja", geo_code: "WS002" },
  { name: "Surulere", state: "Lagos", geo_code: "SR004" },
  { name: "Maitama", state: "Abuja", geo_code: "MT003" },
  { name: "Yaba", state: "Lagos", geo_code: "YB005" }
];

async function seedAreas(client) {
  console.log(`🌱 Seeding areas...`);
  
  const { placeholders, values } = generateInsertData(areasData, ["name", "state", "geo_code"]);
  
  const result = await client.query(
    `INSERT INTO areas (name, state, geo_code) VALUES ${placeholders}`,
    values
  );
  
  console.log(`✅ Seeded areas: ${result.rowCount} rows`);
  return result;
}

export { seedAreas, areasData };
