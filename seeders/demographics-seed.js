import pool from "../utils/pool.js";

export async function seedDemographics(client) {
  console.log("🌍 Seeding demographics data...");
  
  const demographicsData = [
    {
      estate_id: 1,
      population: 2500,
      age_groups: { '18-25': 15, '26-35': 30, '36-50': 35, '50+': 20 },
      income_levels: { 'low': 20, 'middle': 50, 'high': 30 },
      education_levels: { 'primary': 10, 'secondary': 40, 'tertiary': 50 },
      household_size: 3.5,
      employment_rate: 85.5,
      geometry: 'POINT(6.5244 3.3792)'
    },
    {
      estate_id: 2,
      population: 1800,
      age_groups: { '18-25': 20, '26-35': 35, '36-50': 30, '50+': 15 },
      income_levels: { 'low': 15, 'middle': 45, 'high': 40 },
      education_levels: { 'primary': 5, 'secondary': 35, 'tertiary': 60 },
      household_size: 3.2,
      employment_rate: 90.2,
      geometry: 'POINT(6.6018 3.3515)'
    },
    {
      estate_id: 3,
      population: 1200,
      age_groups: { '18-25': 25, '26-35': 40, '36-50': 25, '50+': 10 },
      income_levels: { 'low': 10, 'middle': 40, 'high': 50 },
      education_levels: { 'primary': 3, 'secondary': 30, 'tertiary': 67 },
      household_size: 2.8,
      employment_rate: 92.8,
      geometry: 'POINT(6.4531 3.3958)'
    }
  ];

  for (const data of demographicsData) {
    await client.query(`
      INSERT INTO demographics (
        estate_id, population, age_groups, income_levels, 
        education_levels, household_size, employment_rate, geometry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326))
    `, [
      data.estate_id, data.population, JSON.stringify(data.age_groups),
      JSON.stringify(data.income_levels), JSON.stringify(data.education_levels),
      data.household_size, data.employment_rate, data.geometry
    ]);
  }

  console.log(`✅ Seeded ${demographicsData.length} demographics records`);
}
